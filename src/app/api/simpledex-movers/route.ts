import { handlePaidRequest } from '@/lib/payment'
import { INDEXER } from '@/lib/constants'
import { getCount } from '@/lib/counter'

const AMOUNT = '3.0000 XPR'

function clampLimit(value: string | null): number {
  const n = Number(value || '10')
  if (!Number.isFinite(n)) return 10
  return Math.max(1, Math.min(20, Math.floor(n)))
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const limit = clampLimit(url.searchParams.get('limit'))

  return handlePaidRequest(request, AMOUNT, async () => {
    const resp = await fetch(`${INDEXER}/api/movers?limit=${limit}`, {
      next: { revalidate: 0 },
      headers: { 'User-Agent': 'x402-charliebot-simpledex-movers/1.0' },
    } as any)

    if (!resp.ok) {
      throw new Error(`SimpleDEX indexer returned ${resp.status}`)
    }

    const movers = await resp.json()
    const count = await getCount()

    return {
      paid: true,
      endpoint: '/api/simpledex-movers',
      query: { limit },
      movers,
      useCase: 'Agents can buy a compact momentum feed for watchlists, alerts, and market commentary.',
      source: 'SimpleDEX Indexer (indexer.protonnz.com)',
      totalPayments: count,
    }
  })
}
