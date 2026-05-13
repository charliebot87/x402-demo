import { NextResponse } from 'next/server'
import { ENDPOINTS, SESSION_ENDPOINTS } from '@/lib/constants'

function xprBaseUnits(price: string): string {
  const [whole, fraction = ''] = price.split('.')
  const padded = `${fraction}0000`.slice(0, 4)
  return String(Number(whole) * 10_000 + Number(padded))
}

const chargePaths = Object.fromEntries(
  ENDPOINTS.map((endpoint) => [
    endpoint.path,
    {
      get: {
        summary: endpoint.name,
        description: endpoint.description,
        'x-payment-info': {
          offers: [
            {
              amount: xprBaseUnits(endpoint.price),
              currency: 'XPR',
              description: `${endpoint.priceLabel} for ${endpoint.name}`,
              intent: 'charge',
              method: 'xpr',
              network: 'xpr-network',
              recipient: 'charliebot',
            },
          ],
        },
        responses: {
          '200': { description: 'Paid response with Payment-Receipt header' },
          '402': { description: 'Payment Required challenge via WWW-Authenticate: Payment' },
        },
      },
    },
  ])
)

const sessionPaths = Object.fromEntries(
  SESSION_ENDPOINTS.map((endpoint) => [
    endpoint.path,
    {
      get: {
        summary: endpoint.name,
        description: endpoint.description,
        'x-payment-info': {
          offers: [
            {
              amount: xprBaseUnits(endpoint.price),
              currency: 'XPR',
              description: `${endpoint.priceLabel} refundable streaming session`,
              duration: endpoint.duration,
              intent: 'session',
              method: 'xpr',
              network: 'xpr-network',
              recipient: 'charliebot',
            },
          ],
        },
        responses: {
          '200': { description: 'Paid Server-Sent Events stream with Payment-Receipt header' },
          '402': { description: 'Payment Required session challenge via WWW-Authenticate: Payment' },
        },
      },
    },
  ])
)

export async function GET() {
  return NextResponse.json(
    {
      openapi: '3.1.0',
      info: {
        title: 'x402.charliebot.dev — XPR Network Machine Payments',
        version: '1.0.0',
        description: 'Live MPP / HTTP 402 playground using XPR Network for one-time and streaming machine payments.',
      },
      'x-service-info': {
        categories: ['ai', 'payments', 'micropayments', 'xpr-network', 'mpp'],
        docs: {
          homepage: 'https://x402.charliebot.dev',
          apiReference: 'https://x402.charliebot.dev/docs',
          llms: 'https://x402.charliebot.dev/llms.txt',
        },
        repository: 'https://github.com/charliebot87/x402-demo',
        paymentMethod: 'https://github.com/charliebot87/mpp-xpr',
      },
      servers: [{ url: 'https://x402.charliebot.dev' }],
      paths: {
        ...sessionPaths,
        ...chargePaths,
        '/api/stats': {
          get: {
            summary: 'Playground stats',
            description: 'Free endpoint listing payment-gated routes and total processed payments.',
            responses: { '200': { description: 'Stats response' } },
          },
        },
      },
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    }
  )
}
