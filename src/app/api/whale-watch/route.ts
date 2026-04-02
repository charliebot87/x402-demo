import { handlePaidRequest } from '@/lib/payment'
import { INDEXER } from '@/lib/constants'
import { getCount } from '@/lib/counter'

const AMOUNT = '5.0000 XPR'

export async function GET(request: Request) {
  return handlePaidRequest(request, AMOUNT, async () => {
    const tradersResp = await fetch(`${INDEXER}/api/traders?sort=volume&limit=10`, {
      next: { revalidate: 0 },
    } as any)
    const traders = await tradersResp.json()
    const count = await getCount()

    return {
      paid: true,
      endpoint: '/api/whale-watch',
      whales: traders,
      source: 'SimpleDEX Indexer (indexer.protonnz.com)',
      totalPayments: count,
    }
  })
}
