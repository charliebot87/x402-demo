'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ENDPOINTS } from '@/lib/constants'

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
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-white">MPP</span>{' '}
            <span className="text-terminal-green glow-green">Playground</span>
          </h1>
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
                title: 'Request',
                desc: 'Client hits a paid endpoint. Server returns 402 with payment details — amount, recipient, unique memo.',
                code: 'GET /api/joke → 402',
              },
              {
                step: '2',
                title: 'Pay',
                desc: 'Client sends XPR via WebAuth wallet. On-chain transfer with the memo as a payment receipt.',
                code: 'transfer 1 XPR → charliebot',
              },
              {
                step: '3',
                title: 'Access',
                desc: 'Client retries with transaction proof. Server verifies on-chain, returns the paid content.',
                code: 'GET /api/joke + tx → 200 🎉',
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

        {/* Endpoints grid */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-10 text-white">Paid Endpoints</h2>
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
          <h2 className="text-2xl font-bold text-center mb-10 text-white">Why XPR Network?</h2>
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
