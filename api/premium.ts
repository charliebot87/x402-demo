const RECIPIENT = "paul"
const AMOUNT = "0.0001 XPR" 
const HYPERION = "https://proton.eosusa.io"
const REALM = "x402.charliebot.dev"

// Simple challenge store (in-memory, resets on cold start)
const usedCredentials = new Set<string>()

function generateChallengeId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

function base64urlEncode(obj: any): string {
  return Buffer.from(JSON.stringify(obj)).toString("base64url")
}

function base64urlDecode(str: string): any {
  return JSON.parse(Buffer.from(str, "base64url").toString())
}

export default async function handler(req: any, res: any) {
  // Check for Authorization: Payment header (MPP spec) OR x-payment-tx / ?tx= (legacy)
  const authHeader = req.headers["authorization"] || ""
  const legacyTx = req.headers["x-payment-tx"] || req.query.tx

  let txHash: string | null = null
  let source: string | null = null

  if (authHeader.startsWith("Payment ")) {
    // MPP spec: decode base64url credential
    try {
      const credential = base64urlDecode(authHeader.slice(8))
      txHash = credential.payload?.txHash
      source = credential.source
    } catch {}
  } else if (legacyTx) {
    txHash = legacyTx
  }

  if (!txHash) {
    // Return 402 with WWW-Authenticate header (MPP spec)
    const challengeId = generateChallengeId()
    const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    const request = base64urlEncode({
      amount: AMOUNT,
      recipient: RECIPIENT,
      memo: "x402-premium",
      chainId: "384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0",
      rpc: "https://api.protonnz.com"
    })

    // Set WWW-Authenticate header per MPP spec
    res.setHeader("WWW-Authenticate", 
      `Payment id="${challengeId}", realm="${REALM}", method="xpr", intent="charge", expires="${expires}", request="${request}"`)

    res.status(402).json({
      status: 402,
      message: "Payment Required",
      method: "xpr",
      intent: "charge",
      challenge_id: challengeId,
      expires,
      request: {
        amount: AMOUNT,
        recipient: RECIPIENT,
        memo: "x402-premium",
        chain: "XPR Network"
      },
      how_to_pay: {
        "1_sign": "eosio.token::transfer to " + RECIPIENT + " for " + AMOUNT,
        "2_submit": 'Include Authorization: Payment <base64url({challenge:{...},source:"youraccount",payload:{txHash:"TX_ID"}})>',
        "2_submit_simple": "Or just add ?tx=TX_HASH to this URL"
      }
    })
    return
  }

  // Replay protection
  if (usedCredentials.has(txHash)) {
    res.status(402).json({ error: "Credential already used (replay rejected)", tx: txHash })
    return
  }

  // Verify payment on-chain
  try {
    const resp = await fetch(`${HYPERION}/v2/history/get_transaction?id=${txHash}`)
    const data = await resp.json() as any

    if (!data.executed) {
      res.status(402).json({ error: "Transaction not found or not executed", tx: txHash })
      return
    }

    const transfer = data.actions?.find((a: any) =>
      a.act.name === "transfer" && a.act.data.to === RECIPIENT
    )

    if (!transfer) {
      res.status(402).json({ error: "No transfer to recipient found", tx: txHash })
      return
    }

    if (transfer.act.data.quantity !== AMOUNT) {
      res.status(402).json({ error: `Wrong amount. Expected ${AMOUNT}, got ${transfer.act.data.quantity}`, tx: txHash })
      return
    }

    // Mark as used (replay protection)
    usedCredentials.add(txHash)

    // Set Payment-Receipt header per MPP spec
    const receipt = base64urlEncode({
      method: "xpr",
      status: "success",
      reference: txHash,
      timestamp: new Date().toISOString()
    })
    res.setHeader("Payment-Receipt", receipt)

    res.status(200).json({
      message: "🔓 Premium content unlocked!",
      paid: true,
      method: "XPR Network",
      tx: txHash,
      from: transfer.act.data.from,
      amount: transfer.act.data.quantity,
      explorer: `https://explorer.xprnetwork.org/transaction/${txHash}`,
      content: {
        secret: "The conspiracy board sees everything. This message was unlocked by a machine-to-machine payment on XPR Network with zero gas fees.",
        timestamp: new Date().toISOString()
      }
    })
  } catch (e: any) {
    res.status(500).json({ error: "Verification failed", detail: e.message })
  }
}
