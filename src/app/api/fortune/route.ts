import { NextRequest, NextResponse } from 'next/server'
import { createChallenge, verifyPayment, make402Response } from '@/lib/payment'
import { generateCompletion } from '@/lib/openai'
import { EXPLORER } from '@/lib/constants'
import { incrementCounter } from '@/lib/counter'

const AMOUNT = '1.0000'
const SYSTEM_PROMPT = 'You are a mysterious fortune teller. Return one cryptic fortune about the caller\'s future. Keep it under 2 sentences. No preamble.'

export async function GET(req: NextRequest) {
  const txHash = req.headers.get('x-payment-tx') || req.nextUrl.searchParams.get('tx')
  const memo = req.headers.get('x-payment-memo') || req.nextUrl.searchParams.get('memo')

  if (!txHash || !memo) {
    const { challengeId, expires } = createChallenge(AMOUNT)
    return NextResponse.json(make402Response(AMOUNT, challengeId, expires, '/api/fortune'), {
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

  const fortune = await generateCompletion(SYSTEM_PROMPT)
  const count = incrementCounter()

  return NextResponse.json({
    paid: true,
    endpoint: '/api/fortune',
    fortune,
    model: 'gpt-4o-mini',
    receipt: {
      from: result.from,
      amount: result.amount,
      tx: txHash,
      explorer: `${EXPLORER}/transaction/${txHash}`,
    },
    totalPayments: count,
  })
}
