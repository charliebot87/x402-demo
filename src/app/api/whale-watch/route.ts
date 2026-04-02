import { NextRequest, NextResponse } from 'next/server'
import { createChallenge, verifyPayment, make402Response } from '@/lib/payment'
import { EXPLORER, INDEXER } from '@/lib/constants'
import { incrementCounter } from '@/lib/counter'

const AMOUNT = '5.0000'

export async function GET(req: NextRequest) {
  const txHash = req.headers.get('x-payment-tx') || req.nextUrl.searchParams.get('tx')
  const memo = req.headers.get('x-payment-memo') || req.nextUrl.searchParams.get('memo')

  if (!txHash || !memo) {
    const { challengeId, expires } = createChallenge(AMOUNT)
    return NextResponse.json(make402Response(AMOUNT, challengeId, expires, '/api/whale-watch'), {
      status: 402,
      headers: {
        'WWW-Authenticate': `Payment method="xpr" amount="${AMOUNT} XPR" recipient="charliebot" memo="${challengeId}"`,
      },
    })
  }

  const result = await verifyPayment(txHash, AMOUNT, memo)
  if (!result.valid) {
    return NextResponse.json({ error: result.error, tx: txHash }, { status: 402 })
  }

  // Fetch top traders
  const tradersResp = await fetch(`${INDEXER}/api/traders?sort=volume&limit=10`, {
    next: { revalidate: 0 },
  })
  const traders = await tradersResp.json()

  const count = incrementCounter()

  return NextResponse.json({
    paid: true,
    endpoint: '/api/whale-watch',
    whales: traders,
    source: 'SimpleDEX Indexer (indexer.protonnz.com)',
    receipt: {
      from: result.from,
      amount: result.amount,
      tx: txHash,
      explorer: `${EXPLORER}/transaction/${txHash}`,
    },
    totalPayments: count,
  })
}
