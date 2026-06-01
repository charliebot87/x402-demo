import Link from 'next/link'
import { ENDPOINTS, SESSION_ENDPOINTS } from '@/lib/constants'

const services = [
  ...SESSION_ENDPOINTS.map((service) => ({
    ...service,
    provider: '1P',
    providerLabel: 'Direct from Charlie',
    category: 'Session',
    tags: ['streaming', 'refundable', 'xpr'],
  })),
  ...ENDPOINTS.map((service) => ({
    ...service,
    provider: '1P',
    providerLabel: 'Direct from Charlie',
    category: service.path.includes('simpledex')
      ? 'Market Data'
      : service.path.includes('agent-job')
        ? 'Agent Proof'
        : service.path.includes('whale') || service.path.includes('market')
          ? 'Market Data'
          : 'AI Utility',
    tags: service.path.includes('simpledex')
      ? ['simpledex', 'market-data', 'agents']
      : service.path.includes('agent-job')
        ? ['escrow', 'receipts', 'agents']
        : ['paid-api', 'xpr', 'http-402'],
  })),
]

export default function ServicesPage() {
  const marketDataCount = services.filter((service) => service.category === 'Market Data').length

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-10">
        <nav className="mb-16 flex items-center justify-between text-sm text-gray-400">
          <Link href="/" className="font-semibold text-white hover:text-terminal-green">
            x402.charliebot.dev
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="hover:text-white">Docs</Link>
            <a href="/.well-known/agent-services.json" className="hover:text-white">Discovery JSON</a>
            <Link href="/playground" className="rounded-full bg-terminal-green px-4 py-2 font-bold text-black hover:bg-terminal-green/90">
              Try payments
            </Link>
          </div>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-terminal-green/25 bg-terminal-green/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-terminal-green">
              Agent marketplace prototype
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              Discover what your agent can buy on XPR.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
              A machine-readable service shelf for paid API calls. Agents can inspect the endpoint, price, network, recipient, docs, and proof before sending a transaction.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-black/30 p-4">
                <div className="text-3xl font-black text-terminal-green">{services.length}</div>
                <div className="mt-1 text-xs text-gray-500">paid services</div>
              </div>
              <div className="rounded-2xl bg-black/30 p-4">
                <div className="text-3xl font-black text-terminal-cyan">{marketDataCount}</div>
                <div className="mt-1 text-xs text-gray-500">data feeds</div>
              </div>
              <div className="rounded-2xl bg-black/30 p-4">
                <div className="text-3xl font-black text-purple-300">XPR</div>
                <div className="mt-1 text-xs text-gray-500">zero gas</div>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-terminal-green/20 bg-terminal-green/10 p-4 text-sm text-gray-300">
              Every card below is also advertised through <code className="text-terminal-green">/.well-known/agent-services.json</code>. This is the UI layer over the agent-discoverable registry.
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 py-5">
          {['All', '1P', '3P', 'Market Data', 'Agent Proof', 'AI Utility'].map((filter, index) => (
            <button
              key={filter}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                index === 0
                  ? 'border-terminal-green bg-terminal-green text-black'
                  : 'border-white/10 bg-black/20 text-gray-300 hover:border-white/25 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-12 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <article
            key={service.path}
            className="group rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-6 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-terminal-green/40"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/35 text-2xl ring-1 ring-white/10">
                {service.icon}
              </div>
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-bold text-gray-300">
                {service.provider}
              </span>
            </div>

            <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-terminal-cyan">
              {service.category}
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">{service.name}</h2>
            <p className="mt-3 min-h-[72px] text-sm leading-6 text-gray-400">{service.description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-black/30 px-3 py-1 text-xs text-gray-400">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-500">Price</div>
                  <div className="text-lg font-black text-terminal-green">{service.priceLabel}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Endpoint</div>
                  <code className="text-xs text-gray-300">{service.path}</code>
                </div>
              </div>
            </div>

            <Link
              href={`/playground?endpoint=${encodeURIComponent(service.path)}`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-black text-black transition group-hover:bg-terminal-green"
            >
              Open service →
            </Link>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-[2rem] border border-terminal-green/20 bg-gradient-to-br from-terminal-green/15 via-white/[0.04] to-terminal-cyan/10 p-8 md:p-10">
          <div className="max-w-3xl">
            <div className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-terminal-green">For sellers</div>
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">Your API is a storefront.</h2>
            <p className="mt-4 text-lg leading-8 text-gray-300">
              Add a discovery file, price your endpoint in XPR, and agents can buy calls without a signup flow or checkout page. The registry turns hidden APIs into revenue lines.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="/.well-known/agent-services.json" className="rounded-full bg-terminal-green px-6 py-3 font-black text-black hover:bg-terminal-green/90">
                View discovery file
              </a>
              <a href="/openapi.json" className="rounded-full border border-white/15 px-6 py-3 font-bold text-white hover:border-white/30">
                OpenAPI
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
