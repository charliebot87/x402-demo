import { Mppx } from 'mppx/server'
import { xpr } from 'mppx-xpr-network'
import { RECIPIENT, HYPERION, RPC } from './constants'

/**
 * Spec-compliant MPP payment handler using mppx SDK.
 * 
 * Headers per IETF Payment Authentication draft:
 * - WWW-Authenticate: Payment (402 challenge)
 * - Authorization: Payment (credential with tx proof)
 * - Payment-Receipt (settlement proof)
 */
export const mppx = Mppx.create({
  methods: [
    xpr.charge({
      recipient: RECIPIENT,
      hyperion: HYPERION,
    }),
    xpr.session({
      recipient: RECIPIENT,
      rpc: RPC,
    }),
  ],
  secretKey: process.env.MPP_SECRET_KEY || 'x402-playground-secret-key-change-in-production',
  realm: 'x402.charliebot.dev',
})

/**
 * Handle a paid endpoint using the mppx SDK.
 * Returns either the 402 challenge or calls the content function.
 */
export async function handlePaidRequest(
  request: Request,
  amount: string,
  contentFn: () => Promise<any>,
): Promise<Response> {
  const result = await mppx.xpr.charge({ amount, recipient: RECIPIENT })(request)

  if (result.status === 402) {
    return enrichChallengeResponse(result.challenge)
  }

  const content = await contentFn()
  return result.withReceipt(Response.json(content))
}

/**
 * Clone a 402 challenge response so the body contains the parsed challenge JSON.
 * This ensures the client can read the challenge even if the browser/CDN strips
 * the WWW-Authenticate header.
 */
export function enrichChallengeResponse(response: Response): Response {
  const wwwAuth = response.headers.get('www-authenticate')
  if (!wwwAuth) return response

  // Parse the challenge from the header
  const challenge = parseChallengeHeader(wwwAuth)
  if (!challenge) return response

  // Clone headers and add JSON body with the challenge
  const headers = new Headers(response.headers)
  headers.set('content-type', 'application/json')

  return new Response(JSON.stringify({ challenge }), {
    status: 402,
    statusText: 'Payment Required',
    headers,
  })
}

function parseChallengeHeader(header: string): Record<string, any> | null {
  if (!header.startsWith('Payment ')) return null
  try {
    const params: Record<string, string> = {}
    const paramStr = header.slice('Payment '.length)
    const regex = /(\w+)="([^"]*)"/g
    let match
    while ((match = regex.exec(paramStr)) !== null) {
      params[match[1]] = match[2]
    }
    let request: any = {}
    if (params.request) {
      try {
        const decoded = atob(params.request.replace(/-/g, '+').replace(/_/g, '/'))
        request = JSON.parse(decoded)
      } catch {}
    }
    return {
      id: params.id,
      realm: params.realm,
      method: params.method,
      intent: params.intent || 'charge',
      expires: params.expires,
      request,
    }
  } catch {
    return null
  }
}


