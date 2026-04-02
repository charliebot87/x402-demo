export const RECIPIENT = 'charliebot'
export const HYPERION = 'https://proton.eosusa.io'
export const INDEXER = 'https://indexer.protonnz.com'
export const RPC = 'https://api.protonnz.com'
export const CHAIN_ID = '384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0'
export const EXPLORER = 'https://explorer.xprnetwork.org'

export const SESSION_ENDPOINTS = [
  {
    path: '/api/stream',
    name: 'Metered Stream',
    description: '10 AI-generated facts streamed over ~90s. Live cost ticker shows XPR consumed in real-time. Stop early for a refund.',
    price: '10.0000',
    priceLabel: '10 XPR max',
    icon: '📡',
    intent: 'session' as const,
    duration: 120,
  },
] as const

export type SessionEndpoint = (typeof SESSION_ENDPOINTS)[number]

export const ENDPOINTS = [
  {
    path: '/api/joke',
    name: 'Random Joke',
    description: 'GPT-4o-mini generates a unique joke. Real AI inference behind a paywall.',
    price: '1.0000',
    priceLabel: '1 XPR',
    icon: '😂',
  },
  {
    path: '/api/fortune',
    name: 'Fortune Teller',
    description: 'GPT-4o-mini channels a mysterious oracle. Cryptic predictions, every time unique.',
    price: '1.0000',
    priceLabel: '1 XPR',
    icon: '🔮',
  },
  {
    path: '/api/market',
    name: 'Market Snapshot',
    description: 'Live SimpleDEX stats — total tokens, volume, TVL. Fresh from the indexer.',
    price: '2.0000',
    priceLabel: '2 XPR',
    icon: '📊',
  },
  {
    path: '/api/whale-watch',
    name: 'Whale Watch',
    description: 'Top 10 traders by volume across SimpleDEX. See who\'s moving markets.',
    price: '5.0000',
    priceLabel: '5 XPR',
    icon: '🐋',
  },
] as const

export type Endpoint = (typeof ENDPOINTS)[number]
export type AnyEndpoint = Endpoint | SessionEndpoint
