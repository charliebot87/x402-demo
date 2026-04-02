'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ENDPOINTS, SESSION_ENDPOINTS } from '@/lib/constants'

export default function Home() {
  const [totalPayments, setTotalPayments] = useState(0)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setTotalPayments(d.totalPayments))
      .catch(() => {})
  }, [])

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-terminal-green/30 bg-terminal-green/5">
            <span className="text-terminal-green text-sm">HTTP 402 — Payment Required</span>
          </div>

          {/* Logo + Title */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Image
              src="/xpr-logo.svg"
              alt="XPR Network"
              width={56}
              height={56}
              className="drop-shadow-[0_0_12px_rgba(122,82,255,0.4)]"
            />
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="text-white">MPP</span>{' '}
              <span className="text-terminal-green glow-green">Playground</span>
            </h1>
          </div>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-4">
            Test real XPR micropayments in your browser.
            Pay fractions of a cent. Get AI-generated content and live market data.
            Zero gas fees. Sub-second finality.
          </p>
          <p className="text-sm text-gray-500 mb-10">
            Powered by{' '}
            <a href="https://xprnetwork.org" target="_blank" className="text-terminal-cyan hover:underline">
              XPR Network
            </a>{' '}
            &middot;{' '}
            <a href="https://mpp.dev" target="_blank" className="text-terminal-cyan hover:underline">
              MPP Spec
            </a>{' '}
            &middot;{' '}
            <a href="https://paymentauth.org" target="_blank" className="text-terminal-cyan hover:underline">
              IETF Draft
            </a>
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            <Link
              href="/playground"
              className="px-8 py-3 bg-terminal-green text-black font-bold rounded-lg hover:bg-terminal-green/90 transition-all"
            >
              Open Playground →
            </Link>
            <a
              href="/llms.txt"
              className="px-8 py-3 border border-terminal-border text-gray-400 rounded-lg hover:border-terminal-green/50 hover:text-terminal-green transition-all"
            >
              llms.txt
            </a>
          </div>
        </div>

        {/* Live counter */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-terminal-card border border-terminal-border">
            <span className="w-2 h-2 rounded-full bg-terminal-green pulse-dot"></span>
            <span className="text-gray-400 text-sm">Payments processed:</span>
            <span className="text-terminal-green font-bold text-lg">{totalPayments}</span>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-10 text-white">How MPP Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'Challenge',
                desc: 'Client hits a paid endpoint. Server returns 402 with WWW-Authenticate: Payment header containing the challenge.',
                code: '← 402 + WWW-Authenticate: Payment',
              },
              {
                step: '2',
                title: 'Pay',
                desc: 'Client sends XPR via WebAuth wallet. Zero gas fees. Sub-second finality. Human-readable accounts.',
                code: 'transfer 1 XPR → charliebot',
              },
              {
                step: '3',
                title: 'Verify',
                desc: 'Client retries with Authorization: Payment credential. Server verifies on-chain, returns content + Payment-Receipt.',
                code: '→ Authorization: Payment → 200 🎉',
              },
            ].map((s) => (
              <div key={s.step} className="p-6 rounded-xl bg-terminal-card border border-terminal-border">
                <div className="w-8 h-8 rounded-full bg-terminal-green/10 border border-terminal-green/30 flex items-center justify-center mb-4">
                  <span className="text-terminal-green font-bold text-sm">{s.step}</span>
                </div>
                <h3 className="text-white font-bold mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{s.desc}</p>
                <code className="text-xs text-terminal-dim bg-black/50 px-3 py-1.5 rounded">{s.code}</code>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Intents */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-4 text-white">Two Payment Intents</h2>
          <p className="text-center text-gray-500 text-sm mb-10">
            One-time charges for instant content. Sessions for streaming with refundable deposits.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="p-6 rounded-xl bg-terminal-card border border-terminal-green/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-terminal-green/10 flex items-center justify-center">
                  <span className="text-terminal-green font-bold">⚡</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">xpr.charge()</h3>
                  <p className="text-gray-500 text-xs">One-time payment</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-3">
                Single transfer → verify on Hyperion → content delivered. Simple, instant, non-refundable.
              </p>
              <code className="text-xs text-terminal-dim">eosio.token::transfer → verify → 200</code>
            </div>
            <div className="p-6 rounded-xl bg-terminal-card border border-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <span className="text-purple-400 font-bold">📡</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">xpr.session()</h3>
                  <p className="text-gray-500 text-xs">Streaming payment</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-3">
                Deposit to vest contract → stream content → stop early and get a refund. Zero gas fees on open, close, and every claim.
              </p>
              <code className="text-xs text-terminal-dim">vest::startvest → stream → stopvest</code>
            </div>
          </div>
        </div>

        {/* Session endpoint (featured) */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-10 text-white">
            <span className="text-purple-400">New</span> — Streaming Sessions
          </h2>
          <div className="max-w-xl mx-auto">
            {SESSION_ENDPOINTS.map((ep) => (
              <Link
                key={ep.path}
                href={`/playground?endpoint=${encodeURIComponent(ep.path)}`}
                className="group block p-6 rounded-xl bg-terminal-card border border-purple-500/30 hover:border-purple-400/60 transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-terminal-green/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{ep.icon}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-300 font-medium">
                        session
                      </span>
                      <span className="price-badge px-3 py-1 rounded-full text-xs text-terminal-green font-bold">
                        {ep.priceLabel}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-white font-bold mb-1 group-hover:text-purple-300 transition-colors">
                    {ep.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3">{ep.description}</p>
                  <div className="flex items-center gap-4">
                    <code className="text-xs text-terminal-dim">GET {ep.path}</code>
                    <span className="text-xs text-gray-600">vest contract · {ep.duration}s · refundable</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Charge endpoints grid */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-10 text-white">Charge Endpoints</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {ENDPOINTS.map((ep) => (
              <Link
                key={ep.path}
                href={`/playground?endpoint=${encodeURIComponent(ep.path)}`}
                className="group p-6 rounded-xl bg-terminal-card border border-terminal-border hover:border-terminal-green/40 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{ep.icon}</span>
                  <span className="price-badge px-3 py-1 rounded-full text-xs text-terminal-green font-bold">
                    {ep.priceLabel}
                  </span>
                </div>
                <h3 className="text-white font-bold mb-1 group-hover:text-terminal-green transition-colors">
                  {ep.name}
                </h3>
                <p className="text-gray-500 text-sm mb-3">{ep.description}</p>
                <code className="text-xs text-terminal-dim">GET {ep.path}</code>
              </Link>
            ))}
          </div>
        </div>

        {/* Why XPR */}
        <div className="mb-20">
          <div className="flex items-center justify-center gap-3 mb-10">
            <Image
              src="/xpr-logo.svg"
              alt="XPR Network"
              width={32}
              height={32}
            />
            <h2 className="text-2xl font-bold text-white">Why XPR Network?</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Gas Fees', value: '$0', sub: 'Always free' },
              { label: 'Finality', value: '<1s', sub: 'Sub-second' },
              { label: 'Accounts', value: '@name', sub: 'Human-readable' },
              { label: 'Auth', value: 'WebAuth', sub: 'Biometric login' },
            ].map((s) => (
              <div key={s.label} className="text-center p-6 rounded-xl bg-terminal-card border border-terminal-border">
                <div className="text-2xl font-bold text-terminal-green mb-1">{s.value}</div>
                <div className="text-white text-sm font-medium">{s.label}</div>
                <div className="text-gray-500 text-xs">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-600 text-sm pb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Image
              src="/xpr-logo.svg"
              alt="XPR Network"
              width={16}
              height={16}
              className="opacity-40"
            />
            <span>Powered by XPR Network</span>
          </div>
          <p>
            Built by{' '}
            <a href="https://x.com/charliebot87" target="_blank" className="text-terminal-cyan hover:underline">
              @charliebot87
            </a>{' '}
            — an AI agent on XPR Network
          </p>
          <p className="mt-2">
            <a href="https://github.com/charliebot87/x402-demo" target="_blank" className="hover:text-gray-400">
              Source
            </a>{' '}
            &middot;{' '}
            <a href="https://mpp.dev" target="_blank" className="hover:text-gray-400">
              MPP Spec
            </a>{' '}
            &middot;{' '}
            <a href="/llms.txt" className="hover:text-gray-400">
              llms.txt
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}
