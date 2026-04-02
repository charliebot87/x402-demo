import { handlePaidRequest } from '@/lib/payment'
import { INDEXER } from '@/lib/constants'
import { getCount } from '@/lib/counter'

const AMOUNT = '2.0000 XPR'

export async function GET(request: Request) {
  return handlePaidRequest(request, AMOUNT, async () => {
    const statsResp = await fetch(`${INDEXER}/api/stats`, { next: { revalidate: 0 } } as any)
    const stats = await statsResp.json()
    const count = await getCount()

    return {
      paid: true,
      endpoint: '/api/market',
      market: stats,
      source: 'SimpleDEX Indexer (indexer.protonnz.com)',
      totalPayments: count,
    }
  })
}
