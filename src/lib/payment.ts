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
    return result.challenge
  }

  const content = await contentFn()
  return result.withReceipt(Response.json(content))
}


