import { handlePaidRequest } from '@/lib/payment'
import { INDEXER } from '@/lib/constants'
import { getCount } from '@/lib/counter'

const AMOUNT = '8.0000 XPR'

type Token = {
  tokenId?: number
  symbol?: string
  name?: string
  creator?: string
  graduated?: boolean
  price?: number
  mcap?: number
  change24h?: number
  volume24h?: number
}

type Mover = {
  tokenId?: number
  symbol?: string
  change24h?: number
  mcap?: number
  price?: number
}

async function fetchJson(path: string) {
  const resp = await fetch(`${INDEXER}${path}`, {
    next: { revalidate: 0 },
    headers: { 'User-Agent': 'x402-charliebot-simpledex-intel/1.0' },
  } as any)

  if (!resp.ok) {
    throw new Error(`SimpleDEX indexer ${path} returned ${resp.status}`)
  }

  return resp.json()
}

function fmtUsd(value: unknown): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return 'n/a'
  return `$${Math.round(n).toLocaleString()}`
}

function fmtPct(value: unknown): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return 'n/a'
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

function compactToken(token: Token) {
  return {
    tokenId: token.tokenId,
    symbol: token.symbol,
    name: token.name,
    creator: token.creator,
    graduated: token.graduated,
    marketCapUsd: token.mcap,
    volume24hUsd: token.volume24h,
    change24h: token.change24h,
    link: token.graduated
      ? `https://simpledex.fun/pool/${token.tokenId}`
      : `https://simpledex.fun/launch/${token.tokenId}`,
  }
}

function buildSignals(stats: any, launches: Token[], movers: any) {
  const gainers: Mover[] = movers?.gainers || []
  const losers: Mover[] = movers?.losers || []
  const newestGraduated = launches.filter((token) => token.graduated).length
  const freshBonding = launches.filter((token) => !token.graduated).length
  const topGainer = gainers[0]
  const topLoser = losers[0]
  const activeTape = Number(stats?.dailyTradeCount || 0) > 5000

  return [
    activeTape
      ? `active tape: ${Number(stats.dailyTradeCount).toLocaleString()} trades in 24h across ${stats.tokenCount} tokens`
      : `quiet tape: ${Number(stats?.dailyTradeCount || 0).toLocaleString()} trades in 24h`,
    `${freshBonding} fresh bonding-curve launches and ${newestGraduated} graduated tokens in the newest sample`,
    topGainer ? `top momentum: ${topGainer.symbol} at ${fmtPct(topGainer.change24h)}` : 'top momentum: n/a',
    topLoser ? `largest pullback: ${topLoser.symbol} at ${fmtPct(topLoser.change24h)}` : 'largest pullback: n/a',
  ]
}

function buildWatchlist(launches: Token[], movers: any) {
  const launchIdeas = launches.slice(0, 3).map((token) => ({
    type: token.graduated ? 'new-graduated-token' : 'fresh-launch',
    symbol: token.symbol,
    tokenId: token.tokenId,
    why: token.graduated
      ? `recent graduated token with ${fmtUsd(token.mcap)} market cap and ${fmtUsd(token.volume24h)} 24h volume`
      : `fresh bonding-curve launch from ${token.creator || 'unknown creator'} with ${fmtUsd(token.mcap)} market cap`,
    link: token.graduated
      ? `https://simpledex.fun/pool/${token.tokenId}`
      : `https://simpledex.fun/launch/${token.tokenId}`,
  }))

  const moverIdeas = (movers?.gainers || []).slice(0, 2).map((token: Mover) => ({
    type: 'momentum',
    symbol: token.symbol,
    tokenId: token.tokenId,
    why: `${fmtPct(token.change24h)} 24h move with ${fmtUsd(token.mcap)} market cap`,
    link: `https://simpledex.fun/launch/${token.tokenId}`,
  }))

  return [...launchIdeas, ...moverIdeas]
}

export async function GET(request: Request) {
  return handlePaidRequest(request, AMOUNT, async () => {
    const [stats, launchesData, movers, traders] = await Promise.all([
      fetchJson('/api/stats'),
      fetchJson('/api/tokens?sort=newest&fields=compact&limit=5'),
      fetchJson('/api/movers?limit=5'),
      fetchJson('/api/traders?sort=volume&limit=5').catch((error) => ({ error: String(error) })),
    ])

    const launches: Token[] = launchesData?.tokens || []
    const count = await getCount()

    return {
      paid: true,
      endpoint: '/api/simpledex-intel',
      title: 'SimpleDEX Agent Intel Brief',
      generatedAt: new Date().toISOString(),
      summary: {
        tvlUsd: stats.totalTvlUsd,
        marketCapUsd: stats.totalMarketCapUsd,
        tokenCount: stats.tokenCount,
        graduatedCount: stats.graduatedCount,
        dailyVolumeUsd: stats.dailyVolumeUsd,
        dailyTradeCount: stats.dailyTradeCount,
        uniqueTraders: stats.uniqueTraders,
      },
      signals: buildSignals(stats, launches, movers),
      watchlist: buildWatchlist(launches, movers),
      raw: {
        newestLaunches: launches.map(compactToken),
        movers,
        topTraders: traders,
      },
      chainedServices: [
        '/api/market',
        '/api/simpledex-launches',
        '/api/simpledex-movers',
        '/api/whale-watch',
      ],
      useCase: 'One paid call that chains market stats, launch monitoring, movers, and trader flow into an agent-ready brief.',
      caveat: 'Market intelligence only. Not financial advice. The board has strings, not guarantees.',
      totalPayments: count,
    }
  })
}
