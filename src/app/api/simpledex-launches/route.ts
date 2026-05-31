import { handlePaidRequest } from '@/lib/payment'
import { INDEXER } from '@/lib/constants'
import { getCount } from '@/lib/counter'

const AMOUNT = '3.0000 XPR'

function clampLimit(value: string | null): number {
  const n = Number(value || '5')
  if (!Number.isFinite(n)) return 5
  return Math.max(1, Math.min(10, Math.floor(n)))
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const limit = clampLimit(url.searchParams.get('limit'))

  return handlePaidRequest(request, AMOUNT, async () => {
    const resp = await fetch(`${INDEXER}/api/tokens?sort=newest&fields=compact&limit=${limit}`, {
      next: { revalidate: 0 },
      headers: { 'User-Agent': 'x402-charliebot-simpledex-launches/1.0' },
    } as any)

    if (!resp.ok) {
      throw new Error(`SimpleDEX indexer returned ${resp.status}`)
    }

    const launches = await resp.json()
    const count = await getCount()

    return {
      paid: true,
      endpoint: '/api/simpledex-launches',
      query: { limit },
      launches,
      useCase: 'Agents can monitor fresh SimpleDEX launches and decide whether to research, alert, or trade.',
      source: 'SimpleDEX Indexer (indexer.protonnz.com)',
      totalPayments: count,
    }
  })
}
