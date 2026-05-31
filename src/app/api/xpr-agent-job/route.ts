import { handlePaidRequest } from '@/lib/payment'
import { RPC, EXPLORER } from '@/lib/constants'
import { getCount } from '@/lib/counter'

const AMOUNT = '4.0000 XPR'

function parseJobId(value: string | null): number {
  const n = Number(value || '53')
  if (!Number.isFinite(n) || n < 0) return 53
  return Math.floor(n)
}

async function getTableRows(code: string, scope: string, table: string, lowerBound: number, upperBound: number) {
  const resp = await fetch(`${RPC}/v1/chain/get_table_rows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      scope,
      table,
      json: true,
      lower_bound: String(lowerBound),
      upper_bound: String(upperBound),
      limit: 1,
    }),
  })

  if (!resp.ok) {
    throw new Error(`XPR RPC returned ${resp.status}`)
  }

  return resp.json()
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const jobId = parseJobId(url.searchParams.get('job_id') || url.searchParams.get('jobId'))

  return handlePaidRequest(request, AMOUNT, async () => {
    const data = await getTableRows('agentescrow', 'agentescrow', 'jobs', jobId, jobId + 1)
    const job = data.rows?.[0] || null
    const count = await getCount()

    return {
      paid: true,
      endpoint: '/api/xpr-agent-job',
      query: { jobId },
      jobFound: Boolean(job),
      job,
      proof: {
        chain: 'XPR Network',
        contract: 'agentescrow',
        table: 'jobs',
        explorer: EXPLORER,
      },
      useCase: 'Agents can fetch on-chain escrow job state before buying work, verifying delivery, or producing proof-of-work receipts.',
      totalPayments: count,
    }
  })
}
