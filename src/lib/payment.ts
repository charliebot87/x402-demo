import { RECIPIENT, HYPERION } from './constants'

// In-memory challenge store (resets on cold start — fine for a demo)
const challenges = new Map<string, { amount: string; expires: number }>()
const usedTxs = new Set<string>()

export function createChallenge(amount: string): { challengeId: string; expires: string } {
  const challengeId = crypto.randomUUID()
  const expires = new Date(Date.now() + 5 * 60 * 1000)
  challenges.set(challengeId, { amount, expires: expires.getTime() })
  return { challengeId, expires: expires.toISOString() }
}

export function getChallenge(id: string) {
  return challenges.get(id)
}

export function isExpired(challengeId: string): boolean {
  const c = challenges.get(challengeId)
  if (!c) return true
  return Date.now() > c.expires
}

export function markUsed(txHash: string) {
  usedTxs.add(txHash)
}

export function isUsed(txHash: string): boolean {
  return usedTxs.has(txHash)
}

export interface VerifyResult {
  valid: boolean
  error?: string
  from?: string
  amount?: string
}

export async function verifyPayment(
  txHash: string,
  expectedAmount: string,
  expectedMemo: string
): Promise<VerifyResult> {
  if (isUsed(txHash)) {
    return { valid: false, error: 'Transaction already used (replay rejected)' }
  }

  try {
    const resp = await fetch(
      `${HYPERION}/v2/history/get_transaction?id=${txHash}`,
      { next: { revalidate: 0 } }
    )
    const data = await resp.json() as any

    if (!data.executed) {
      return { valid: false, error: 'Transaction not found or not executed' }
    }

    const transfer = data.actions?.find(
      (a: any) =>
        a.act.name === 'transfer' &&
        a.act.account === 'eosio.token' &&
        a.act.data.to === RECIPIENT
    )

    if (!transfer) {
      return { valid: false, error: `No transfer to ${RECIPIENT} found in transaction` }
    }

    const actualAmount = transfer.act.data.quantity?.replace(' XPR', '')
    if (actualAmount !== expectedAmount) {
      return {
        valid: false,
        error: `Wrong amount. Expected ${expectedAmount} XPR, got ${transfer.act.data.quantity}`,
      }
    }

    if (transfer.act.data.memo !== expectedMemo) {
      return {
        valid: false,
        error: `Wrong memo. Expected "${expectedMemo}", got "${transfer.act.data.memo}"`,
      }
    }

    markUsed(txHash)
    return { valid: true, from: transfer.act.data.from, amount: transfer.act.data.quantity }
  } catch (e: any) {
    return { valid: false, error: `Verification failed: ${e.message}` }
  }
}

export function make402Response(amount: string, challengeId: string, expires: string, path: string) {
  return {
    status: 402,
    message: 'Payment Required',
    protocol: 'Machine Payments Protocol (MPP)',
    payment: {
      network: 'xprnetwork',
      recipient: RECIPIENT,
      amount: `${amount} XPR`,
      memo: challengeId,
      expires,
      chain_id: '384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0',
      rpc: 'https://api.protonnz.com',
    },
    endpoint: path,
    spec: 'https://mpp.dev',
  }
}
