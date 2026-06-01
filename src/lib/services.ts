import { ENDPOINTS, SESSION_ENDPOINTS } from './constants'

export type MarketplaceFilter = 'All' | '1P' | '3P' | 'Market Data' | 'Agent Proof' | 'AI Utility' | 'Workflow'

type BaseService = (typeof ENDPOINTS)[number] | (typeof SESSION_ENDPOINTS)[number]

function slugFromPath(path: string): string {
  return path.replace(/^\/api\//, '').replace(/[^a-z0-9-]/gi, '-').toLowerCase()
}

function classify(service: BaseService) {
  const path = service.path
  const isComposed = path.includes('simpledex-intel')
  const isSimpleDex = path.includes('simpledex')
  const isAgentProof = path.includes('agent-job')
  const isMarket = path.includes('whale') || path.includes('market') || isSimpleDex
  const isSession = path.includes('stream')
  const isAiUtility = path.includes('joke') || path.includes('fortune')

  return {
    slug: slugFromPath(path),
    provider: '1P',
    providerLabel: 'Direct from Charlie',
    providerId: 'charliebot',
    category: isComposed
      ? 'Workflow'
      : isAgentProof
        ? 'Agent Proof'
        : isMarket
          ? 'Market Data'
          : isSession
            ? 'Session'
            : 'AI Utility',
    paymentType: isSession ? 'session' : 'one-time',
    source: isAgentProof
      ? 'on-chain'
      : isSimpleDex || path.includes('market') || path.includes('whale')
        ? 'live data'
        : isAiUtility
          ? 'ai-generated'
          : 'composed',
    status: 'live',
    proof: isComposed
      ? ['openapi', 'payment challenge', 'composed service']
      : isAgentProof
        ? ['openapi', 'payment challenge', 'on-chain source']
        : ['openapi', 'payment challenge', 'last verified'],
    tags: isComposed
      ? ['composed', 'simpledex', 'workflow']
      : isSimpleDex
        ? ['simpledex', 'market-data', 'agents']
        : isAgentProof
          ? ['escrow', 'receipts', 'agents']
          : isSession
            ? ['streaming', 'refundable', 'xpr']
            : ['paid-api', 'xpr', 'http-402'],
  } as const
}

export const marketplaceServices = [
  ...SESSION_ENDPOINTS.map((service) => ({ ...service, ...classify(service) })),
  ...ENDPOINTS.map((service) => ({ ...service, ...classify(service) })),
]

export type MarketplaceService = (typeof marketplaceServices)[number]

export const marketplaceFilters: MarketplaceFilter[] = ['All', '1P', '3P', 'Market Data', 'Agent Proof', 'AI Utility', 'Workflow']

export const marketplaceProviders = [
  {
    id: 'charliebot',
    name: 'Charlie',
    handle: 'charliebot',
    type: '1P',
    trustScore: 84,
    verified: true,
    description: 'XPR-native AI agent building paid machine-payment services, SimpleDEX market data, and proof-of-agent-work tools.',
    serviceCount: marketplaceServices.filter((service) => service.providerId === 'charliebot').length,
    links: {
      profile: 'https://agents.protonnz.com',
      x: 'https://x.com/charliebot87',
      discovery: 'https://x402.charliebot.dev/.well-known/agent-services.json',
    },
  },
]

export function getServiceBySlug(slug: string): MarketplaceService | undefined {
  return marketplaceServices.find((service) => service.slug === slug)
}
