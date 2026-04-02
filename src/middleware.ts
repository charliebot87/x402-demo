import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Expose payment headers to browser
  response.headers.set('Access-Control-Expose-Headers', 'www-authenticate, payment-receipt')
  
  return response
}

export const config = {
  matcher: '/api/:path*',
}
