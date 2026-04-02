import { handlePaidRequest } from '@/lib/payment'
import { generateCompletion } from '@/lib/openai'
import { getCount } from '@/lib/counter'

const AMOUNT = '1.0000 XPR'
const SYSTEM_PROMPT = 'You are a witty comedian. Return one short joke. No preamble.'

export async function GET(request: Request) {
  return handlePaidRequest(request, AMOUNT, async () => {
    const joke = await generateCompletion(SYSTEM_PROMPT)
    const count = await getCount()

    return {
      paid: true,
      endpoint: '/api/joke',
      joke,
      model: 'gpt-4o-mini',
      totalPayments: count,
    }
  })
}
