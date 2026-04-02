'use client'

import Link from 'next/link'
import Image from 'next/image'
import { VERSION } from '@/lib/constants'

const NAV_ITEMS = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'charges', label: 'Charges (xpr.charge)' },
  { id: 'sessions', label: 'Sessions (xpr.session)' },
  { id: 'api-reference', label: 'API Reference' },
  { id: 'headers', label: 'Headers (IETF)' },
  { id: 'links', label: 'Links' },
]

function CodeBlock({ code, language = 'typescript', title }: { code: string; language?: string; title?: string }) {
  return (
    <div className="rounded-xl bg-black border border-terminal-border overflow-hidden mb-4">
      {title && (
        <div className="px-4 py-2 border-b border-terminal-border bg-terminal-card flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wider">{title}</span>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="text-xs text-gray-600 hover:text-terminal-green transition-colors"
          >
            Copy
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-gray-300">{code}</code>
      </pre>
    </div>
  )
}

function SectionHeader({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-2xl font-bold text-white mb-6 pt-2 scroll-mt-8 flex items-center gap-3 border-b border-terminal-border pb-3"
    >
      {children}
    </h2>
  )
}

function SubHeader({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-bold text-terminal-green mb-3 mt-6">{children}</h3>
}

function Pill({ children, color = 'green' }: { children: React.ReactNode; color?: 'green' | 'purple' | 'cyan' | 'gray' }) {
  const colors = {
    green: 'bg-terminal-green/10 text-terminal-green border-terminal-green/20',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    cyan: 'bg-cyan-500/10 text-terminal-cyan border-cyan-500/20',
    gray: 'bg-gray-700/30 text-gray-400 border-gray-600/20',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono border ${colors[color]}`}>
      {children}
    </span>
  )
}

function FlowDiagram({ steps }: { steps: { label: string; detail?: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 my-4 p-4 rounded-xl bg-black border border-terminal-border">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-terminal-card border border-terminal-border">
            <div className="text-sm text-white font-medium">{step.label}</div>
            {step.detail && <div className="text-xs text-gray-500">{step.detail}</div>}
          </div>
          {i < steps.length - 1 && <span className="text-terminal-green text-lg">→</span>}
        </div>
      ))}
    </div>
  )
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-terminal-border bg-black/80 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-terminal-green text-sm transition-colors">
              ← Back
            </Link>
            <div className="flex items-center gap-3">
              <Image src="/xpr-logo.svg" alt="XPR Network" width={28} height={28} />
              <span className="text-white font-bold">mppx-xpr-network</span>
              <span className="text-gray-600 text-sm">docs</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">v{VERSION}</span>
            <Link
              href="/playground"
              className="px-3 py-1.5 text-sm bg-terminal-green text-black font-bold rounded-lg hover:bg-terminal-green/90 transition-all"
            >
              Playground →
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 flex gap-10">
        {/* Sidebar nav */}
        <aside className="hidden lg:block w-56 shrink-0">
          <nav className="sticky top-24 space-y-1">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-3 px-3">Contents</p>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block px-3 py-2 text-sm text-gray-400 hover:text-terminal-green hover:bg-terminal-green/5 rounded-lg transition-all"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4 px-3">
              <a
                href="https://github.com/charliebot87/mpp-xpr"
                target="_blank"
                className="text-xs text-gray-600 hover:text-terminal-cyan transition-colors block"
              >
                GitHub →
              </a>
              <a
                href="https://www.npmjs.com/package/mppx-xpr-network"
                target="_blank"
                className="text-xs text-gray-600 hover:text-terminal-cyan transition-colors block mt-1"
              >
                npm →
              </a>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Intro */}
          <div className="mb-10">
            <div className="inline-block mb-4 px-3 py-1 rounded-full border border-terminal-green/30 bg-terminal-green/5">
              <span className="text-terminal-green text-xs">HTTP 402 — Machine Payments for XPR Network</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              mppx-xpr-network
            </h1>
            <p className="text-gray-400 text-lg mb-4">
              An <a href="https://mpp.dev" target="_blank" className="text-terminal-cyan hover:underline">MPP</a> plugin
              that brings HTTP 402 machine payments to{' '}
              <a href="https://xprnetwork.org" target="_blank" className="text-terminal-cyan hover:underline">XPR Network</a>.
              Zero gas fees. Sub-second finality. Human-readable account names.
            </p>
            <div className="flex flex-wrap gap-2">
              <Pill>no gas fees</Pill>
              <Pill>&lt;1s finality</Pill>
              <Pill>@account names</Pill>
              <Pill color="purple">streaming payments</Pill>
              <Pill color="cyan">IETF 402 spec</Pill>
            </div>
          </div>

          {/* ── Quick Start ────────────────────────────────── */}
          <section className="mb-14">
            <SectionHeader id="quick-start">⚡ Quick Start</SectionHeader>

            <CodeBlock
              title="Install"
              code="npm install mppx mppx-xpr-network"
            />

            <SubHeader>Minimal server (charge)</SubHeader>
            <CodeBlock
              title="Server — 6 lines"
              code={`import { Mppx } from 'mppx/server'
import { xpr } from 'mppx-xpr-network'

const mppx = Mppx.create({
  methods: [xpr.charge({ recipient: 'yourname' })],
  secretKey: process.env.MPP_SECRET_KEY,
})

// In your route handler:
const result = await mppx.xpr.charge({ amount: '1.0000 XPR' })(request)
if (result.status === 402) return result.challenge
return result.withReceipt(Response.json({ hello: 'world' }))`}
            />

            <SubHeader>Minimal client</SubHeader>
            <CodeBlock
              title="Client"
              code={`import { MppxClient } from 'mppx/client'
import { xprClientMethod } from 'mppx-xpr-network/client'

const client = new MppxClient({ methods: [xprClientMethod()] })

// Call a paid endpoint — client handles 402 automatically
const response = await client.fetch('https://your-api.com/api/joke', {
  onChallenge: async (challenge) => {
    // Sign with WebAuth or any XPR wallet
    const txId = await wallet.transfer({
      to: challenge.request.recipient,
      amount: challenge.request.amount,
    })
    return { txId }
  },
})`}
            />
          </section>

          {/* ── Charges ────────────────────────────────────── */}
          <section className="mb-14">
            <SectionHeader id="charges">⚡ Charges — xpr.charge()</SectionHeader>

            <p className="text-gray-400 mb-4">
              One-time payments verified on-chain via Hyperion history nodes. The client sends XPR, attaches the
              transaction ID as a credential, and the server verifies the transfer happened before returning content.
              Simple, instant, non-refundable.
            </p>

            <SubHeader>Flow</SubHeader>
            <FlowDiagram steps={[
              { label: '1. Request', detail: 'client → GET /api' },
              { label: '2. 402', detail: '← WWW-Authenticate: Payment' },
              { label: '3. Pay', detail: 'transfer XPR on-chain' },
              { label: '4. Credential', detail: '→ Authorization: Payment' },
              { label: '5. Verify', detail: 'Hyperion confirms tx' },
              { label: '6. 200', detail: '← content + Payment-Receipt' },
            ]} />

            <SubHeader>Server setup</SubHeader>
            <CodeBlock
              title="Next.js route handler"
              code={`import { Mppx } from 'mppx/server'
import { xpr } from 'mppx-xpr-network'

const mppx = Mppx.create({
  methods: [
    xpr.charge({
      recipient: 'charliebot',                     // XPR account name
      hyperion: 'https://proton.eosusa.io',         // optional: preferred node
      // amount is set per-request (see below)
    }),
  ],
  secretKey: process.env.MPP_SECRET_KEY!,          // signs challenges
})

export async function GET(request: Request) {
  const result = await mppx.xpr.charge({
    amount: '1.0000 XPR',                          // per-request amount
  })(request)

  if (result.status === 402) return result.challenge
  return result.withReceipt(
    Response.json({ joke: 'Why did the blockchain...' })
  )
}`}
            />

            <SubHeader>Configuration options</SubHeader>
            <div className="rounded-xl border border-terminal-border overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-terminal-card border-b border-terminal-border">
                    <th className="text-left px-4 py-2 text-gray-400">Option</th>
                    <th className="text-left px-4 py-2 text-gray-400">Type</th>
                    <th className="text-left px-4 py-2 text-gray-400">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['recipient', 'string', 'XPR account name to receive payments (e.g. "charliebot")'],
                    ['hyperion', 'string?', 'Preferred Hyperion endpoint. Falls back to built-in pool if unreachable.'],
                    ['amount', 'string', 'Per-request amount in XPR format: "1.0000 XPR"'],
                  ].map(([opt, type, desc], i) => (
                    <tr key={i} className="border-b border-terminal-border/50 last:border-0">
                      <td className="px-4 py-3 font-mono text-terminal-green">{opt}</td>
                      <td className="px-4 py-3 font-mono text-purple-300">{type}</td>
                      <td className="px-4 py-3 text-gray-400">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubHeader>Hyperion verification — multi-node fallback</SubHeader>
            <p className="text-gray-400 mb-3">
              The plugin ships with 5 built-in Hyperion endpoints and tries them in order. If the preferred node
              is unreachable or the transaction isn&apos;t found yet, it automatically falls back to the next node.
              This makes verification resilient to node downtime without any configuration.
            </p>
            <CodeBlock
              title="Built-in Hyperion endpoints (tried in order)"
              code={`// Bundled fallback pool — no config needed
const HYPERION_ENDPOINTS = [
  'https://proton.eosusa.io',
  'https://proton.cryptolions.io',
  'https://hyperion.protonchain.com',
  'https://api.protonnz.com',
  'https://proton.eosphere.io',
]`}
            />
          </section>

          {/* ── Sessions ───────────────────────────────────── */}
          <section className="mb-14">
            <SectionHeader id="sessions">📡 Sessions — xpr.session()</SectionHeader>

            <p className="text-gray-400 mb-4">
              Streaming payments via XPR Network&apos;s <strong className="text-white">vest contract</strong>. The client
              deposits a maximum amount upfront. The server claims what it uses. When the session ends (or the client stops
              early), the unclaimed balance is refunded automatically. Zero gas fees on open, every claim, and close.
            </p>

            <SubHeader>Flow</SubHeader>
            <FlowDiagram steps={[
              { label: '1. Request', detail: 'client → GET /api/stream' },
              { label: '2. 402', detail: '← Payment challenge' },
              { label: '3. Deposit', detail: 'transfer XPR to vest' },
              { label: '4. startvest', detail: 'open vest stream' },
              { label: '5. Stream', detail: 'server claims per-unit' },
              { label: '6. stopvest', detail: 'close + refund remainder' },
            ]} />

            <SubHeader>Server setup</SubHeader>
            <CodeBlock
              title="Next.js streaming route handler"
              code={`import { Mppx } from 'mppx/server'
import { xpr } from 'mppx-xpr-network'

const mppx = Mppx.create({
  methods: [
    xpr.session({
      recipient: 'charliebot',
      rpc: 'https://api.protonnz.com',
      // duration and maxAmount set per-request
    }),
  ],
  secretKey: process.env.MPP_SECRET_KEY!,
})

export async function GET(request: Request) {
  const result = await mppx.xpr.session({
    maxAmount: '10.0000 XPR',   // max deposit (refund remainder on stop)
    duration: 120,               // seconds the vest runs for
    recipient: 'charliebot',
  })(request)

  if (result.status === 402) return result.challenge

  // Stream content — each chunk claims from the vest
  const stream = new ReadableStream({
    async start(controller) {
      for (const fact of facts) {
        controller.enqueue(encoder.encode(fact))
        await result.claim('1.0000 XPR')   // claim per unit delivered
        await sleep(1000)
      }
      await result.stop()                   // refund unused balance
      controller.close()
    },
  })

  return result.withReceipt(
    new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
  )
}`}
            />

            <SubHeader>Configuration options</SubHeader>
            <div className="rounded-xl border border-terminal-border overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-terminal-card border-b border-terminal-border">
                    <th className="text-left px-4 py-2 text-gray-400">Option</th>
                    <th className="text-left px-4 py-2 text-gray-400">Type</th>
                    <th className="text-left px-4 py-2 text-gray-400">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['recipient', 'string', 'XPR account to receive streamed payments'],
                    ['rpc', 'string', 'XPR Network RPC endpoint for vest contract calls'],
                    ['maxAmount', 'string', 'Maximum deposit: "10.0000 XPR". Unused portion is refunded on stop.'],
                    ['duration', 'number', 'Vest duration in seconds before auto-expiry'],
                  ].map(([opt, type, desc], i) => (
                    <tr key={i} className="border-b border-terminal-border/50 last:border-0">
                      <td className="px-4 py-3 font-mono text-terminal-green">{opt}</td>
                      <td className="px-4 py-3 font-mono text-purple-300">{type}</td>
                      <td className="px-4 py-3 text-gray-400">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubHeader>Vest contract actions</SubHeader>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {[
                {
                  action: 'deposit',
                  desc: 'Client transfers XPR to the vest contract as collateral for the session.',
                  who: 'client',
                },
                {
                  action: 'claim',
                  desc: 'Server claims earned XPR as content is delivered. Each claim is a separate on-chain action.',
                  who: 'server',
                },
                {
                  action: 'stop',
                  desc: 'Ends the vest early. Unclaimed balance is returned to the depositor immediately.',
                  who: 'server or client',
                },
              ].map((v) => (
                <div key={v.action} className="p-4 rounded-xl bg-terminal-card border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-purple-300 font-bold">{v.action}</code>
                    <span className="text-xs text-gray-600">{v.who}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{v.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── API Reference ──────────────────────────────── */}
          <section className="mb-14">
            <SectionHeader id="api-reference">📖 API Reference</SectionHeader>

            <SubHeader>Mppx.create(options)</SubHeader>
            <p className="text-gray-400 mb-3">Creates the main MPP server instance.</p>
            <div className="rounded-xl border border-terminal-border overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-terminal-card border-b border-terminal-border">
                    <th className="text-left px-4 py-2 text-gray-400">Option</th>
                    <th className="text-left px-4 py-2 text-gray-400">Type</th>
                    <th className="text-left px-4 py-2 text-gray-400">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['methods', 'PluginMethod[]', 'Array of payment method plugins (e.g. xpr.charge(), xpr.session())'],
                    ['secretKey', 'string', 'Secret used to sign and verify challenge tokens. Keep server-side only.'],
                    ['realm', 'string?', 'Optional realm for the WWW-Authenticate header. Defaults to request origin.'],
                  ].map(([opt, type, desc], i) => (
                    <tr key={i} className="border-b border-terminal-border/50 last:border-0">
                      <td className="px-4 py-3 font-mono text-terminal-green">{opt}</td>
                      <td className="px-4 py-3 font-mono text-purple-300">{type}</td>
                      <td className="px-4 py-3 text-gray-400">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SubHeader>mppx.xpr.charge(options)</SubHeader>
            <p className="text-gray-400 mb-3">
              Returns a request handler factory. Call it with the incoming request to get back either a 402 challenge
              or a verified result object.
            </p>
            <CodeBlock
              code={`// Returns a handler function
const handler = mppx.xpr.charge({ amount: '1.0000 XPR' })

// Call with the request
const result = await handler(request)

// result.status === 402 — needs payment
if (result.status === 402) return result.challenge   // Response with WWW-Authenticate

// result.status === 200 — payment verified
return result.withReceipt(Response.json({ data: '...' }))   // adds Payment-Receipt header`}
            />

            <SubHeader>mppx.xpr.session(options)</SubHeader>
            <p className="text-gray-400 mb-3">
              Like charge, but returns a streaming session handle with claim/stop methods.
            </p>
            <CodeBlock
              code={`const result = await mppx.xpr.session({
  maxAmount: '10.0000 XPR',
  duration: 120,
  recipient: 'charliebot',
})(request)

if (result.status === 402) return result.challenge

await result.claim('1.0000 XPR')   // claim earned amount mid-stream
await result.stop()                 // stop vest, refund remainder
return result.withReceipt(response)`}
            />

            <SubHeader>handlePaidRequest(mppx, handler)(request)</SubHeader>
            <p className="text-gray-400 mb-3">
              Convenience wrapper that automatically returns the 402 challenge if payment is needed, otherwise
              calls your handler with the verified result. Reduces boilerplate.
            </p>
            <CodeBlock
              code={`import { handlePaidRequest } from 'mppx/server'

export const GET = handlePaidRequest(
  mppx.xpr.charge({ amount: '1.0000 XPR' }),
  async (result) => {
    return result.withReceipt(Response.json({ data: 'premium content' }))
  }
)`}
            />

            <SubHeader>enrichChallengeResponse(response, challenge)</SubHeader>
            <p className="text-gray-400 mb-3">
              Adds payment metadata to an existing Response object. Useful when you want to construct the
              response yourself and attach the challenge or receipt headers manually.
            </p>
            <CodeBlock
              code={`import { enrichChallengeResponse } from 'mppx/server'

const base = new Response(null, { status: 402 })
return enrichChallengeResponse(base, challenge)
// → adds WWW-Authenticate: Payment ... header`}
            />
          </section>

          {/* ── Headers ────────────────────────────────────── */}
          <section className="mb-14">
            <SectionHeader id="headers">📡 Headers — IETF Spec</SectionHeader>

            <p className="text-gray-400 mb-6">
              MPP uses the{' '}
              <a
                href="https://datatracker.ietf.org/doc/draft-ietf-httpbis-unprompted-auth/"
                target="_blank"
                className="text-terminal-cyan hover:underline"
              >
                IETF Payment Authentication
              </a>{' '}
              draft headers. Three headers carry the full challenge-response-receipt lifecycle.
            </p>

            {/* WWW-Authenticate */}
            <div className="p-5 rounded-xl bg-terminal-card border border-terminal-border mb-4">
              <div className="flex items-start justify-between mb-3">
                <code className="text-terminal-green font-bold">WWW-Authenticate: Payment</code>
                <Pill color="gray">402 response</Pill>
              </div>
              <p className="text-gray-400 text-sm mb-3">
                Server sends this on a 402 response. Contains a base64url-encoded challenge with the payment
                requirements: method, amount, recipient, expiry, and a server-signed token.
              </p>
              <CodeBlock
                code={`HTTP/1.1 402 Payment Required
WWW-Authenticate: Payment challenge="eyJpZCI6ImFiYzEyMyIsIm1ldGhvZCI6InhwciIsImludGVudCI6ImNoYXJnZSIsInJlcXVlc3QiOnsiYW1vdW50IjoiMS4wMDAwIFhQUiIsInJlY2lwaWVudCI6ImNoYXJsaWVib3QifX0"`}
              />
              <div className="text-xs text-gray-500 mt-2">
                Decoded challenge payload contains: <code className="text-gray-400">id, method, intent, realm, request, expires</code>
              </div>
            </div>

            {/* Authorization */}
            <div className="p-5 rounded-xl bg-terminal-card border border-terminal-border mb-4">
              <div className="flex items-start justify-between mb-3">
                <code className="text-terminal-green font-bold">Authorization: Payment</code>
                <Pill color="purple">retry request</Pill>
              </div>
              <p className="text-gray-400 text-sm mb-3">
                Client sends this when retrying after payment. Contains the original challenge plus a
                payload with the transaction proof (tx ID from the XPR chain).
              </p>
              <CodeBlock
                code={`GET /api/joke HTTP/1.1
Authorization: Payment credential="eyJjaGFsbGVuZ2UiOnsuLi59LCJwYXlsb2FkIjp7InR4SWQiOiJhYmMxMjMuLi4ifX0"`}
              />
              <div className="text-xs text-gray-500 mt-2">
                Decoded credential contains: <code className="text-gray-400">challenge</code> (original) + <code className="text-gray-400">payload.txId</code>
              </div>
            </div>

            {/* Payment-Receipt */}
            <div className="p-5 rounded-xl bg-terminal-card border border-terminal-border mb-4">
              <div className="flex items-start justify-between mb-3">
                <code className="text-terminal-green font-bold">Payment-Receipt</code>
                <Pill color="cyan">200 response</Pill>
              </div>
              <p className="text-gray-400 text-sm mb-3">
                Server attaches this to the successful 200 response. Contains a server-signed receipt
                that the client can use as proof of payment. Added automatically via <code className="text-gray-300">result.withReceipt()</code>.
              </p>
              <CodeBlock
                code={`HTTP/1.1 200 OK
Payment-Receipt: receipt="eyJpZCI6ImFiYzEyMyIsInR4SWQiOiIuLi4iLCJhbW91bnQiOiIxLjAwMDAgWFBSIiwic2lnbmF0dXJlIjoiLi4uIn0"`}
              />
            </div>
          </section>

          {/* ── Links ──────────────────────────────────────── */}
          <section className="mb-14">
            <SectionHeader id="links">🔗 Links</SectionHeader>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  label: 'mppx-xpr-network',
                  desc: 'The XPR Network plugin — source code, issues, contributions welcome',
                  href: 'https://github.com/charliebot87/mpp-xpr',
                  badge: 'GitHub',
                  color: 'green' as const,
                },
                {
                  label: 'x402-demo',
                  desc: 'Source code for this playground app',
                  href: 'https://github.com/charliebot87/x402-demo',
                  badge: 'GitHub',
                  color: 'green' as const,
                },
                {
                  label: 'mppx-xpr-network',
                  desc: 'npm package — install and version history',
                  href: 'https://www.npmjs.com/package/mppx-xpr-network',
                  badge: 'npm',
                  color: 'purple' as const,
                },
                {
                  label: 'MPP Spec',
                  desc: 'Machine Payment Protocol — chain-agnostic open standard',
                  href: 'https://mpp.dev',
                  badge: 'Spec',
                  color: 'cyan' as const,
                },
                {
                  label: 'x402 Spec',
                  desc: 'The original HTTP 402 payment spec by Coinbase + Cloudflare',
                  href: 'https://x402.org',
                  badge: 'Spec',
                  color: 'cyan' as const,
                },
                {
                  label: 'XPR Network',
                  desc: 'Zero-fee blockchain with WebAuth login and sub-second finality',
                  href: 'https://xprnetwork.org',
                  badge: 'Chain',
                  color: 'gray' as const,
                },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  className="group p-4 rounded-xl bg-terminal-card border border-terminal-border hover:border-terminal-green/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-white font-medium group-hover:text-terminal-green transition-colors">
                      {link.label}
                    </span>
                    <Pill color={link.color}>{link.badge}</Pill>
                  </div>
                  <p className="text-gray-500 text-sm">{link.desc}</p>
                  <p className="text-terminal-cyan text-xs mt-2 truncate">{link.href}</p>
                </a>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-terminal-border pt-8 text-center text-gray-600 text-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Image src="/xpr-logo.svg" alt="XPR Network" width={14} height={14} className="opacity-40" />
              <span>mppx-xpr-network v{VERSION}</span>
            </div>
            <p>
              Built by{' '}
              <a href="https://x.com/charliebot87" target="_blank" className="text-terminal-cyan hover:underline">
                @charliebot87
              </a>{' '}
              — an AI agent on XPR Network
            </p>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs">
              <a href="https://mpp.dev" target="_blank" className="hover:text-gray-400">mpp.dev</a>
              <span>·</span>
              <a href="https://x402.org" target="_blank" className="hover:text-gray-400">x402.org</a>
              <span>·</span>
              <Link href="/playground" className="hover:text-terminal-green">playground</Link>
              <span>·</span>
              <Link href="/" className="hover:text-gray-400">home</Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
