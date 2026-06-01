'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { marketplaceFilters, marketplaceProviders, marketplaceServices, type MarketplaceFilter } from '@/lib/services'

export default function ServicesPage() {
  const [activeFilter, setActiveFilter] = useState<MarketplaceFilter>('All')
  const [query, setQuery] = useState('')

  const marketDataCount = marketplaceServices.filter((service) => service.category === 'Market Data').length
  const composedCount = marketplaceServices.filter((service) => service.category === 'Workflow').length

  const filteredServices = useMemo(() => {
    const q = query.trim().toLowerCase()
    return marketplaceServices.filter((service) => {
      const matchesFilter =
        activeFilter === 'All' ||
        service.provider === activeFilter ||
        service.category === activeFilter

      const haystack = [
        service.name,
        service.description,
        service.path,
        service.category,
        service.source,
        service.status,
        ...service.tags,
        ...service.proof,
      ]
        .join(' ')
        .toLowerCase()

      return matchesFilter && (!q || haystack.includes(q))
    })
  }, [activeFilter, query])

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-10">
        <nav className="mb-16 flex flex-col gap-4 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="font-semibold text-white hover:text-terminal-green">
            x402.charliebot.dev
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/docs" className="hover:text-white">Docs</Link>
            <a href="/.well-known/agent-services.json" className="hover:text-white">Discovery JSON</a>
            <Link href="/submit" className="hover:text-white">Submit service</Link>
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
                <div className="text-3xl font-black text-terminal-green">{marketplaceServices.length}</div>
                <div className="mt-1 text-xs text-gray-500">paid services</div>
              </div>
              <div className="rounded-2xl bg-black/30 p-4">
                <div className="text-3xl font-black text-terminal-cyan">{marketDataCount}</div>
                <div className="mt-1 text-xs text-gray-500">data feeds</div>
              </div>
              <div className="rounded-2xl bg-black/30 p-4">
                <div className="text-3xl font-black text-purple-300">{composedCount}</div>
                <div className="mt-1 text-xs text-gray-500">composed</div>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-terminal-green/20 bg-terminal-green/10 p-4 text-sm text-gray-300">
              Every card below is advertised through <code className="text-terminal-green">/.well-known/agent-services.json</code>. This is the UI layer over the agent-discoverable registry.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-terminal-green">Providers</div>
            <h2 className="mt-2 text-2xl font-black">Verified storefronts</h2>
          </div>
          <Link href="/submit" className="rounded-full border border-white/10 px-5 py-2 text-sm font-bold text-white hover:border-terminal-green/50">
            Submit yours →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {marketplaceProviders.map((provider) => (
            <article key={provider.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xl font-black">{provider.name}</div>
                  <div className="text-sm text-gray-500">@{provider.handle} · {provider.type}</div>
                </div>
                <span className="rounded-full border border-terminal-green/20 bg-terminal-green/10 px-3 py-1 text-xs font-bold text-terminal-green">
                  trust {provider.trustScore}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-400">{provider.description}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-gray-300">
                <span className="rounded-full bg-black/30 px-3 py-1">{provider.serviceCount} services</span>
                <span className="rounded-full bg-black/30 px-3 py-1">verified provider</span>
                <a href={provider.links.discovery} className="rounded-full bg-black/30 px-3 py-1 hover:text-terminal-green">discovery</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sticky top-0 z-20 border-y border-white/10 bg-[#080b13]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-[1fr_auto] gap-2 lg:hidden">
            <label className="block">
              <span className="sr-only">Filter services</span>
              <select
                value={activeFilter}
                onChange={(event) => setActiveFilter(event.target.value as MarketplaceFilter)}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm font-bold text-white outline-none focus:border-terminal-green/60"
              >
                {marketplaceFilters.map((filter) => (
                  <option key={filter} value={filter} className="bg-[#080b13] text-white">
                    {filter}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex h-11 items-center rounded-xl border border-terminal-green/20 bg-terminal-green/10 px-3 text-xs font-bold text-terminal-green">
              {filteredServices.length}/{marketplaceServices.length}
            </div>
          </div>

          <div className="hidden flex-wrap items-center gap-3 lg:flex">
            {marketplaceFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                  activeFilter === filter
                    ? 'border-terminal-green bg-terminal-green text-black'
                    : 'border-white/10 bg-black/20 text-gray-300 hover:border-white/25 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <label className="relative block lg:w-80">
            <span className="sr-only">Search services</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search services..."
              className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-terminal-green/60 lg:rounded-full"
            />
          </label>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-8 text-sm text-gray-500">
        Showing <span className="font-bold text-white">{filteredServices.length}</span> of {marketplaceServices.length} services.
        {activeFilter !== 'All' ? <span> Filter: <span className="text-terminal-green">{activeFilter}</span>.</span> : null}
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-8 md:grid-cols-2 xl:grid-cols-3">
        {filteredServices.map((service) => (
          <article
            key={service.path}
            className="group rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-6 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-terminal-green/40"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/35 text-2xl ring-1 ring-white/10">
                {service.icon}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-bold text-gray-300">
                  {service.provider}
                </span>
                <span className="rounded-full border border-terminal-green/20 bg-terminal-green/10 px-3 py-1 text-xs font-bold text-terminal-green">
                  {service.status}
                </span>
              </div>
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

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-gray-500">Price</div>
                <div className="text-lg font-black text-terminal-green">{service.priceLabel}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-gray-500">Payment</div>
                <div className="text-sm font-bold text-white">{service.paymentType}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-gray-500">Source</div>
                <div className="text-sm font-bold text-white">{service.source}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-gray-500">Endpoint</div>
                <code className="text-[11px] text-gray-300">{service.path}</code>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Proof labels</div>
              <div className="flex flex-wrap gap-2">
                {service.proof.map((proof) => (
                  <span key={proof} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-300">
                    {proof}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <Link
                href={`/playground?endpoint=${encodeURIComponent(service.path)}`}
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-black text-black transition group-hover:bg-terminal-green"
              >
                Try
              </Link>
              <Link
                href={`/services/${service.slug}`}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white hover:border-terminal-green/50"
              >
                Details
              </Link>
              <a
                href="/openapi.json"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white hover:border-terminal-green/50"
              >
                Docs
              </a>
            </div>
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
              <Link href="/submit" className="rounded-full bg-terminal-green px-6 py-3 font-black text-black hover:bg-terminal-green/90">
                Submit your service
              </Link>
              <a href="/.well-known/agent-services.json" className="rounded-full border border-white/15 px-6 py-3 font-bold text-white hover:border-white/30">
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
