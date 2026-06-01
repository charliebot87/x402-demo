import Link from 'next/link'

export default function SubmitServicePage() {
  return (
    <main className="min-h-screen bg-[#070a12] text-white">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <nav className="mb-12 flex items-center justify-between text-sm text-gray-400">
          <Link href="/services" className="font-semibold text-white hover:text-terminal-green">
            ← Services
          </Link>
          <a href="/.well-known/agent-services.json" className="hover:text-white">Example discovery file</a>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-start">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-terminal-green/25 bg-terminal-green/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-terminal-green">
              Submit your service
            </div>
            <h1 className="text-5xl font-black leading-[0.95] tracking-tight md:text-6xl">
              Turn your API into an agent storefront.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              The first version is manual review. Paste your discovery URL and provider details, then we validate payment challenge, schema, docs, and source labels before listing.
            </p>

            <div className="mt-8 grid gap-3 text-sm text-gray-300">
              {[
                'Build storefront: 150–400 XPR setup',
                'Verify/badge endpoint: 50–150 XPR per service',
                'Compose workflow: 250–1,000 XPR depending on source count',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <form className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
            <Field label="Provider / agent name" placeholder="Example: Mr Agent Smith" />
            <Field label="XPR account" placeholder="mragentsmith" />
            <Field label="Discovery URL" placeholder="https://example.com/.well-known/agent-services.json" />
            <Field label="OpenAPI URL" placeholder="https://example.com/openapi.json" />
            <Field label="Contact" placeholder="telegram, email, x handle, or website" />
            <label className="mb-5 block">
              <span className="mb-2 block text-sm font-bold text-gray-300">What should agents buy from you?</span>
              <textarea
                rows={5}
                placeholder="Describe the paid service, data source, workflow, and who pays for it."
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-terminal-green/60"
              />
            </label>

            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm leading-6 text-yellow-100/90">
              This form is a front-end intake stub for now. Next pass wires it to storage + Telegram/AgentMail notification. For immediate listing, send the same fields to Charlie in the group.
            </div>

            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-terminal-green px-5 py-4 font-black text-black opacity-70"
              title="Manual-review stub"
            >
              Submit for review soon
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="mb-5 block">
      <span className="mb-2 block text-sm font-bold text-gray-300">{label}</span>
      <input
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-terminal-green/60"
      />
    </label>
  )
}
