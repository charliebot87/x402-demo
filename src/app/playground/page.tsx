'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ENDPOINTS, RECIPIENT, EXPLORER, type Endpoint } from '@/lib/constants'

type LogEntry = {
  type: 'request' | 'response' | 'info' | 'error' | 'success' | 'payment'
  text: string
  timestamp: string
}

function PlaygroundContent() {
  const searchParams = useSearchParams()
  const initialEndpoint = searchParams.get('endpoint') || ENDPOINTS[0].path
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(
    ENDPOINTS.find((e) => e.path === initialEndpoint) || ENDPOINTS[0]
  )
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [walletSession, setWalletSession] = useState<any>(null)
  const [walletAccount, setWalletAccount] = useState<string | null>(null)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [challengeAmount, setChallengeAmount] = useState<string | null>(null)
  const logEndRef = useRef<HTMLDivElement>(null)

  const now = () => new Date().toLocaleTimeString('en-US', { hour12: false })

  const addLog = useCallback((type: LogEntry['type'], text: string) => {
    setLogs((prev) => [...prev, { type, text, timestamp: now() }])
  }, [])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Connect wallet
  const connectWallet = async () => {
    try {
      addLog('info', 'Connecting WebAuth wallet...')
      const ConnectWalletModule = await import('@proton/web-sdk')
      const ConnectWallet = ConnectWalletModule.default
      const { link, session } = await ConnectWallet({
        linkOptions: {
          endpoints: ['https://api.protonnz.com'],
          chainId: '384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0',
          restoreSession: false,
        },
        transportOptions: {
          requestAccount: 'charliebot',
        },
        selectorOptions: {
          appName: 'MPP Playground',
          appLogo: 'https://x402.charliebot.dev/icon.png',
        },
      })
      if (!session) throw new Error('No session returned')
      setWalletSession(session)
      const account = session.auth.actor.toString()
      setWalletAccount(account)
      addLog('success', `Wallet connected: ${account}`)
    } catch (e: any) {
      addLog('error', `Wallet connection failed: ${e.message}`)
    }
  }

  // Step 1: Hit the endpoint, get 402
  const requestEndpoint = async () => {
    setLoading(true)
    addLog('request', `GET ${selectedEndpoint.path}`)

    try {
      const resp = await fetch(selectedEndpoint.path)
      const data = await resp.json()

      if (resp.status === 402) {
        addLog('response', `← 402 Payment Required`)
        addLog('info', formatJson(data))
        setChallengeId(data.payment.memo)
        setChallengeAmount(data.payment.amount.replace(' XPR', ''))

        if (!walletAccount) {
          addLog('info', '⚠ Connect your wallet to pay and unlock this endpoint')
        } else {
          addLog('info', '💰 Click "Pay with XPR" to send payment')
        }
      } else {
        addLog('response', `← ${resp.status}`)
        addLog('info', formatJson(data))
      }
    } catch (e: any) {
      addLog('error', `Request failed: ${e.message}`)
    }
    setLoading(false)
  }

  // Step 2: Pay via WebAuth
  const sendPayment = async () => {
    if (!walletSession || !challengeId || !challengeAmount) return
    setLoading(true)

    const account = walletSession.auth.actor.toString()
    addLog('payment', `Sending ${challengeAmount} XPR to ${RECIPIENT}...`)
    addLog('info', `memo: ${challengeId}`)

    try {
      const result = await walletSession.transact(
        {
          actions: [
            {
              account: 'eosio.token',
              name: 'transfer',
              authorization: [{ actor: account, permission: 'active' }],
              data: {
                from: account,
                to: RECIPIENT,
                quantity: `${challengeAmount} XPR`,
                memo: challengeId,
              },
            },
          ],
        },
        { broadcast: true }
      )

      const txId =
        result?.processed?.id ||
        result?.transaction_id ||
        result?.transactionId ||
        (typeof result?.transaction === 'string' ? result.transaction : result?.transaction?.id) ||
        'unknown'

      addLog('success', `✓ Payment sent!`)
      addLog('info', `tx: ${txId}`)
      addLog('info', `${EXPLORER}/transaction/${txId}`)

      // Step 3: Retry with payment proof
      addLog('request', `GET ${selectedEndpoint.path} + payment headers`)
      addLog('info', `X-Payment-Tx: ${txId}`)
      addLog('info', `X-Payment-Memo: ${challengeId}`)

      // Small delay for Hyperion indexing
      await new Promise((r) => setTimeout(r, 1500))

      const resp = await fetch(
        `${selectedEndpoint.path}?tx=${txId}&memo=${challengeId}`
      )
      const data = await resp.json()

      if (resp.status === 200) {
        addLog('success', `← 200 OK — Content unlocked! 🎉`)
        addLog('info', formatJson(data))
      } else {
        addLog('error', `← ${resp.status}`)
        addLog('info', formatJson(data))

        // Retry once more after another delay
        if (data.error?.includes('not found') || data.error?.includes('not executed')) {
          addLog('info', 'Waiting for Hyperion to index the transaction...')
          await new Promise((r) => setTimeout(r, 3000))
          const resp2 = await fetch(
            `${selectedEndpoint.path}?tx=${txId}&memo=${challengeId}`
          )
          const data2 = await resp2.json()
          if (resp2.status === 200) {
            addLog('success', `← 200 OK — Content unlocked! 🎉`)
            addLog('info', formatJson(data2))
          } else {
            addLog('error', `← ${resp2.status} (retry)`)
            addLog('info', formatJson(data2))
          }
        }
      }

      setChallengeId(null)
      setChallengeAmount(null)
    } catch (e: any) {
      addLog('error', `Payment failed: ${e.message}`)
    }
    setLoading(false)
  }

  const clearLogs = () => {
    setLogs([])
    setChallengeId(null)
    setChallengeAmount(null)
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-terminal-green transition-colors">
              ← Back
            </Link>
            <h1 className="text-xl font-bold text-white">
              MPP <span className="text-terminal-green">Playground</span>
            </h1>
          </div>
          {walletAccount ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-terminal-card border border-terminal-green/30">
              <span className="w-2 h-2 rounded-full bg-terminal-green"></span>
              <span className="text-terminal-green text-sm font-medium">{walletAccount}</span>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-terminal-green text-black font-bold rounded-lg hover:bg-terminal-green/90 transition-all text-sm"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {/* Main layout */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left panel: endpoint selector */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
              Select Endpoint
            </h2>
            {ENDPOINTS.map((ep) => (
              <button
                key={ep.path}
                onClick={() => {
                  setSelectedEndpoint(ep)
                  setChallengeId(null)
                  setChallengeAmount(null)
                }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedEndpoint.path === ep.path
                    ? 'bg-terminal-card border-terminal-green/50'
                    : 'bg-terminal-card/50 border-terminal-border hover:border-terminal-green/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{ep.icon}</span>
                  <span className="price-badge px-2 py-0.5 rounded-full text-xs text-terminal-green font-bold">
                    {ep.priceLabel}
                  </span>
                </div>
                <div className="text-white font-medium text-sm">{ep.name}</div>
                <code className="text-xs text-terminal-dim">GET {ep.path}</code>
              </button>
            ))}

            {/* Action buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={requestEndpoint}
                disabled={loading}
                className="w-full px-4 py-3 bg-terminal-card border border-terminal-cyan/30 text-terminal-cyan font-bold rounded-lg hover:bg-terminal-cyan/10 transition-all disabled:opacity-50 text-sm"
              >
                {loading ? 'Loading...' : `GET ${selectedEndpoint.path}`}
              </button>
              {challengeId && walletAccount && (
                <button
                  onClick={sendPayment}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-terminal-green text-black font-bold rounded-lg hover:bg-terminal-green/90 transition-all disabled:opacity-50 text-sm"
                >
                  {loading ? 'Processing...' : `Pay ${challengeAmount} XPR with WebAuth`}
                </button>
              )}
              {challengeId && !walletAccount && (
                <button
                  onClick={connectWallet}
                  className="w-full px-4 py-3 bg-terminal-green/20 border border-terminal-green/30 text-terminal-green font-bold rounded-lg hover:bg-terminal-green/30 transition-all text-sm"
                >
                  Connect Wallet to Pay
                </button>
              )}
            </div>
          </div>

          {/* Right panel: terminal output */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Request / Response
              </h2>
              <button
                onClick={clearLogs}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="terminal-output min-h-[500px] max-h-[700px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-600">
                  <p className="mb-2">{'>'} Select an endpoint and click the request button</p>
                  <p className="mb-2">{'>'} The server will return 402 Payment Required</p>
                  <p className="mb-2">{'>'} Connect your WebAuth wallet and pay</p>
                  <p className="cursor-blink">{'>'} Content unlocked</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="mb-1">
                    <span className="text-gray-600 text-xs mr-2">[{log.timestamp}]</span>
                    <span
                      className={
                        log.type === 'request'
                          ? 'text-terminal-cyan'
                          : log.type === 'response'
                            ? 'text-yellow-400'
                            : log.type === 'error'
                              ? 'text-red-400'
                              : log.type === 'success'
                                ? 'text-terminal-green'
                                : log.type === 'payment'
                                  ? 'text-purple-400'
                                  : 'text-gray-400'
                      }
                    >
                      {log.type === 'request' && '→ '}
                      {log.type === 'response' && '← '}
                      {log.type === 'error' && '✗ '}
                      {log.type === 'success' && '✓ '}
                      {log.type === 'payment' && '💸 '}
                      {log.text}
                    </span>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function formatJson(obj: any): string {
  return JSON.stringify(obj, null, 2)
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>}>
      <PlaygroundContent />
    </Suspense>
  )
}
