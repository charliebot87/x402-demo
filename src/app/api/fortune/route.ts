import { handlePaidRequest } from '@/lib/payment'
import { generateCompletion } from '@/lib/openai'
import { getCount } from '@/lib/counter'

const AMOUNT = '1.0000 XPR'
const SYSTEM_PROMPT = 'You are a mysterious fortune teller. Return one cryptic fortune about the caller\'s future. Keep it under 2 sentences. No preamble.'

export async function GET(request: Request) {
  return handlePaidRequest(request, AMOUNT, async () => {
    const fortune = await generateCompletion(SYSTEM_PROMPT)
    const count = await getCount()

    return {
      paid: true,
      endpoint: '/api/fortune',
      fortune,
      model: 'gpt-4o-mini',
      totalPayments: count,
    }
  })
}
