import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServiceBySlug, marketplaceProviders, marketplaceServices } from '@/lib/services'

export function generateStaticParams() {
  return marketplaceServices.map((service) => ({ slug: service.slug }))
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) notFound()

  const provider = marketplaceProviders.find((item) => item.id === service.providerId)

  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <nav className="mb-12 flex flex-col gap-4 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/services" className="font-semibold text-white hover:text-terminal-green">
            ← Services
          </Link>
          <div className="flex flex-wrap items-center gap-4">
            <a href="/.well-known/agent-services.json" className="hover:text-white">Discovery JSON</a>
            <a href="/openapi.json" className="hover:text-white">OpenAPI</a>
            <Link href={`/playground?endpoint=${encodeURIComponent(service.path)}`} className="rounded-full bg-terminal-green px-4 py-2 font-bold text-black hover:bg-terminal-green/90">
              Try payment
            </Link>
          </div>
        </nav>

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-8 shadow-2xl shadow-black/30 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-black/35 text-4xl ring-1 ring-white/10">
                {service.icon}
              </div>
              <div className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-terminal-cyan">{service.category}</div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">{service.name}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-400">{service.description}</p>
            </div>
            <div className="rounded-2xl border border-terminal-green/20 bg-terminal-green/10 p-5 text-sm text-gray-300 md:min-w-64">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-terminal-green">Payment</div>
              <div className="mt-2 text-3xl font-black text-white">{service.priceLabel}</div>
              <div className="mt-1 text-gray-400">{service.paymentType} · {service.status}</div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <Info label="Endpoint" value={service.path} mono />
            <Info label="Source" value={service.source} />
            <Info label="Provider" value={service.providerLabel} />
            <Info label="Network" value="XPR Network" />
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Proof labels</div>
              <div className="flex flex-wrap gap-2">
                {service.proof.map((proof) => (
                  <span key={proof} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-300">
                    {proof}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Tags</div>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-black/35 px-3 py-1 text-xs text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {provider ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/25 p-5">
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-terminal-green">Provider card</div>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-black">{provider.name}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">{provider.description}</p>
                </div>
                <div className="rounded-xl border border-terminal-green/20 bg-terminal-green/10 px-4 py-3 text-sm font-bold text-terminal-green">
                  trust {provider.trustScore} · verified
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/playground?endpoint=${encodeURIComponent(service.path)}`} className="rounded-full bg-terminal-green px-6 py-3 font-black text-black hover:bg-terminal-green/90">
              Try service
            </Link>
            <a href="/openapi.json" className="rounded-full border border-white/15 px-6 py-3 font-bold text-white hover:border-white/30">
              View OpenAPI
            </a>
            <a href="/.well-known/agent-services.json" className="rounded-full border border-white/15 px-6 py-3 font-bold text-white hover:border-white/30">
              Discovery JSON
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-1 text-sm font-bold text-white ${mono ? 'font-mono text-xs' : ''}`}>{value}</div>
    </div>
  )
}
