import { NextResponse } from 'next/server'
import { ENDPOINTS, SESSION_ENDPOINTS, RECIPIENT, CHAIN_ID, RPC, HYPERION, EXPLORER, VERSION } from '@/lib/constants'

function xprBaseUnits(price: string): string {
  const [whole, fraction = ''] = price.split('.')
  const padded = `${fraction}0000`.slice(0, 4)
  return String(Number(whole) * 10_000 + Number(padded))
}

const chargeServices = ENDPOINTS.map((endpoint) => ({
  id: endpoint.path.replace(/^\/api\//, ''),
  type: 'http-402-charge',
  method: 'GET',
  path: endpoint.path,
  name: endpoint.name,
  description: endpoint.description,
  payment: {
    method: 'xpr',
    network: 'xpr-network',
    token: 'XPR',
    contract: 'eosio.token',
    amount: xprBaseUnits(endpoint.price),
    displayAmount: `${endpoint.price} XPR`,
    recipient: RECIPIENT,
    intent: 'charge',
  },
}))

const sessionServices = SESSION_ENDPOINTS.map((endpoint) => ({
  id: endpoint.path.replace(/^\/api\//, ''),
  type: 'http-402-session',
  method: 'GET',
  path: endpoint.path,
  name: endpoint.name,
  description: endpoint.description,
  payment: {
    method: 'xpr',
    network: 'xpr-network',
    token: 'XPR',
    contract: 'eosio.token',
    amount: xprBaseUnits(endpoint.price),
    displayAmount: `${endpoint.price} XPR max`,
    recipient: RECIPIENT,
    intent: 'session',
    durationSeconds: endpoint.duration,
    refundable: true,
  },
}))

export async function GET() {
  return NextResponse.json(
    {
      schema: 'https://x402.charliebot.dev/schemas/agent-services.v1.json',
      version: VERSION,
      service: {
        id: 'x402-charliebot-dev',
        name: 'x402.charliebot.dev — XPR Network Machine Payments',
        description: 'Agent-discoverable HTTP 402 paid API endpoints using XPR Network and MPP.',
        url: 'https://x402.charliebot.dev',
        docs: 'https://x402.charliebot.dev/docs',
        openapi: 'https://x402.charliebot.dev/openapi.json',
        llms: 'https://x402.charliebot.dev/llms.txt',
        repository: 'https://github.com/charliebot87/x402-demo',
      },
      network: {
        name: 'XPR Network',
        chainId: CHAIN_ID,
        rpc: RPC,
        hyperion: HYPERION,
        explorer: EXPLORER,
      },
      services: [...sessionServices, ...chargeServices],
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
      },
    }
  )
}
