const RECIPIENT = "paul"
const AMOUNT = "0.0001 XPR"
const HYPERION = "https://proton.eosusa.io"

export default async function handler(req: any, res: any) {
  // Check for payment credential
  const txHash = req.headers["x-payment-tx"] || req.query.tx

  if (!txHash) {
    // Return 402 with payment challenge
    res.status(402).json({
      status: 402,
      message: "Payment Required",
      method: "xpr",
      intent: "charge",
      request: {
        amount: AMOUNT,
        recipient: RECIPIENT,
        memo: "x402-premium",
        chain: "XPR Network",
        chainId: "384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0",
        rpc: "https://api.protonnz.com"
      },
      instructions: {
        action: "eosio.token::transfer",
        data: {
          from: "<your_account>",
          to: "paul",
          quantity: AMOUNT,
          memo: "x402-premium"
        },
        then: "Include tx hash as x-payment-tx header or ?tx= query param"
      }
    })
    return
  }

  // Verify payment on-chain via Hyperion
  try {
    const resp = await fetch(`${HYPERION}/v2/history/get_transaction?id=${txHash}`)
    const data = await resp.json() as any

    if (!data.executed) {
      res.status(402).json({ error: "Transaction not found or not executed", tx: txHash })
      return
    }

    // Find the transfer action
    const transfer = data.actions?.find((a: any) =>
      a.act.name === "transfer" &&
      a.act.data.to === RECIPIENT
    )

    if (!transfer) {
      res.status(402).json({ error: "No transfer to recipient found in transaction", tx: txHash })
      return
    }

    // Verify amount
    const paidAmount = transfer.act.data.quantity
    if (paidAmount !== AMOUNT) {
      res.status(402).json({
        error: `Wrong amount. Expected ${AMOUNT}, got ${paidAmount}`,
        tx: txHash
      })
      return
    }

    // Payment verified! Return premium content
    res.status(200).json({
      message: "🔓 Premium content unlocked!",
      paid: true,
      method: "XPR Network",
      tx: txHash,
      from: transfer.act.data.from,
      amount: paidAmount,
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
