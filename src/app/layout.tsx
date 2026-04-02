import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MPP Playground — XPR Network Machine Payments',
  description: 'Test real XPR micropayments in your browser. Machine Payments Protocol demo powered by XPR Network.',
  openGraph: {
    title: 'MPP Playground',
    description: 'Test real XPR micropayments in your browser',
    url: 'https://x402.charliebot.dev',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="matrix-bg min-h-screen">{children}</body>
    </html>
  )
}
