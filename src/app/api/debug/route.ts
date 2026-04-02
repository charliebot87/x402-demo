import { mppx } from '@/lib/payment'
import { RECIPIENT } from '@/lib/constants'

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')
  
  try {
    const result = await mppx.xpr.charge({ amount: '1.0000 XPR', recipient: RECIPIENT })(request)
    
    if (result.status === 402) {
      const wwwAuth = result.challenge.headers.get('www-authenticate')
      return Response.json({
        status: 402,
        hasAuth: !!authHeader,
        authPreview: authHeader ? authHeader.substring(0, 100) + '...' : null,
        wwwAuth: wwwAuth ? wwwAuth.substring(0, 200) : null,
      })
    }
    
    return result.withReceipt(Response.json({ status: 200, ok: true }))
  } catch (e: any) {
    return Response.json({
      error: e.message,
      name: e.name,
      stack: e.stack?.split('\n').slice(0, 5),
      hasAuth: !!authHeader,
      authPreview: authHeader ? authHeader.substring(0, 100) + '...' : null,
    }, { status: 500 })
  }
}
