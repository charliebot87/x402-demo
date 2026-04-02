import { NextResponse } from 'next/server'
import { getCount } from '@/lib/counter'
import { ENDPOINTS } from '@/lib/constants'

export async function GET() {
  return NextResponse.json({
    totalPayments: await getCount(),
    endpoints: ENDPOINTS.map((e) => ({
      path: e.path,
      name: e.name,
      price: `${e.price} XPR`,
    })),
    protocol: 'Machine Payments Protocol (MPP)',
    spec: 'https://mpp.dev',
  })
}
