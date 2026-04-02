'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ENDPOINTS, RECIPIENT, EXPLORER, type Endpoint } from '@/lib/constants'

type LogEntry = {
  type: 'request' | 'response' | 'info' | 'error' | 'success' | 'payment' | 'header'
  text: string
  timestamp: string
}

/**
 * Base64url encode (browser-safe, no padding)
 */
function base64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Build a spec-compliant Authorization: Payment credential
 */
function buildPaymentCredential(challenge: any, txHash: string): string {
  const credential = {
    challenge,
    payload: { txHash },
  }
  return `Payment ${base64urlEncode(JSON.stringify(credential))}`
}

/**
 * Parse a WWW-Authenticate: Payment header to extract the challenge
 */
function parseWwwAuthenticate(response: Response): any | null {
  const header = response.headers.get('www-authenticate')
  if (!header || !header.startsWith('Payment ')) return null
  try {
    const b64 = header.slice('Payment '.length)
    const decoded = atob(b64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
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
  const [challenge, setChallenge] = useState<any>(null)
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

      if (resp.status === 402) {
        addLog('response', `← 402 Payment Required`)

        // Show spec-compliant headers
        const wwwAuth = resp.headers.get('www-authenticate')
        if (wwwAuth) {
          addLog('header', `WWW-Authenticate: ${wwwAuth.substring(0, 80)}...`)
        }

        // Parse the challenge from the WWW-Authenticate header
        const parsedChallenge = parseWwwAuthenticate(resp)

        // Also show the body for context
        const data = await resp.json().catch(() => null)

        if (parsedChallenge) {
          setChallenge(parsedChallenge)
          const amount = parsedChallenge.request?.amount || selectedEndpoint.price + ' XPR'
          setChallengeAmount(amount.replace(' XPR', ''))
          addLog('info', `Challenge ID: ${parsedChallenge.id}`)
          addLog('info', `Method: ${parsedChallenge.method}/${parsedChallenge.intent}`)
          addLog('info', `Amount: ${amount}`)
          addLog('info', `Recipient: ${parsedChallenge.request?.recipient || RECIPIENT}`)
          if (parsedChallenge.expires) {
            addLog('info', `Expires: ${parsedChallenge.expires}`)
          }
        } else if (data) {
          addLog('info', formatJson(data))
        }

        if (!walletAccount) {
          addLog('info', '⚠ Connect your wallet to pay and unlock this endpoint')
        } else {
          addLog('info', '💰 Click "Pay with XPR" to send payment')
        }
      } else {
        addLog('response', `← ${resp.status}`)
        const data = await resp.json()
        addLog('info', formatJson(data))
      }
    } catch (e: any) {
      addLog('error', `Request failed: ${e.message}`)
    }
    setLoading(false)
  }

  // Step 2: Pay via WebAuth
  const sendPayment = async () => {
    if (!walletSession || !challenge || !challengeAmount) return
    setLoading(true)

    const account = walletSession.auth.actor.toString()
    const memo = challenge.id
    addLog('payment', `Sending ${challengeAmount} XPR to ${RECIPIENT}...`)
    addLog('info', `memo: ${memo}`)

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
                memo,
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

      // Step 3: Build spec-compliant credential and retry
      const authHeader = buildPaymentCredential(challenge, txId)
      addLog('request', `GET ${selectedEndpoint.path}`)
      addLog('header', `Authorization: Payment <credential>`)

      // Small delay for Hyperion indexing
      await new Promise((r) => setTimeout(r, 1500))

      const resp = await fetch(selectedEndpoint.path, {
        headers: {
          'Authorization': authHeader,
        },
      })

      if (resp.status === 200) {
        // Show the Payment-Receipt header
        const receiptHeader = resp.headers.get('payment-receipt')
        if (receiptHeader) {
          addLog('header', `Payment-Receipt: ${receiptHeader.substring(0, 60)}...`)
        }

        const data = await resp.json()
        addLog('success', `← 200 OK — Content unlocked! 🎉`)
        addLog('info', formatJson(data))
      } else {
        const data = await resp.json().catch(() => ({}))
        addLog('error', `← ${resp.status}`)
        addLog('info', formatJson(data))

        // Retry once more after delay (Hyperion indexing)
        if (resp.status === 402) {
          addLog('info', 'Waiting for Hyperion to index the transaction...')
          await new Promise((r) => setTimeout(r, 3000))
          const resp2 = await fetch(selectedEndpoint.path, {
            headers: {
              'Authorization': authHeader,
            },
          })
          if (resp2.status === 200) {
            const receiptHeader = resp2.headers.get('payment-receipt')
            if (receiptHeader) {
              addLog('header', `Payment-Receipt: ${receiptHeader.substring(0, 60)}...`)
            }
            const data2 = await resp2.json()
            addLog('success', `← 200 OK — Content unlocked! 🎉`)
            addLog('info', formatJson(data2))
          } else {
            const data2 = await resp2.json().catch(() => ({}))
            addLog('error', `← ${resp2.status} (retry)`)
            addLog('info', formatJson(data2))
          }
        }
      }

      setChallenge(null)
      setChallengeAmount(null)
    } catch (e: any) {
      addLog('error', `Payment failed: ${e.message}`)
    }
    setLoading(false)
  }

  const clearLogs = () => {
    setLogs([])
    setChallenge(null)
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

        {/* Spec badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-terminal-card/50 border border-terminal-border text-xs text-gray-400">
            <span className="text-terminal-green">●</span>
            Spec-compliant: WWW-Authenticate / Authorization / Payment-Receipt headers
            <a href="https://paymentauth.org" target="_blank" className="text-terminal-cyan hover:underline ml-1">
              IETF Draft
            </a>
          </div>
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
                  setChallenge(null)
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
              {challenge && walletAccount && (
                <button
                  onClick={sendPayment}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-terminal-green text-black font-bold rounded-lg hover:bg-terminal-green/90 transition-all disabled:opacity-50 text-sm"
                >
                  {loading ? 'Processing...' : `Pay ${challengeAmount} XPR with WebAuth`}
                </button>
              )}
              {challenge && !walletAccount && (
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
                  <p className="mb-2">{'>'} Server returns 402 + WWW-Authenticate: Payment header</p>
                  <p className="mb-2">{'>'} Pay with WebAuth → sends Authorization: Payment credential</p>
                  <p className="cursor-blink">{'>'} Receive content + Payment-Receipt header</p>
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
                                  : log.type === 'header'
                                    ? 'text-orange-400'
                                    : 'text-gray-400'
                      }
                    >
                      {log.type === 'request' && '→ '}
                      {log.type === 'response' && '← '}
                      {log.type === 'error' && '✗ '}
                      {log.type === 'success' && '✓ '}
                      {log.type === 'payment' && '💸 '}
                      {log.type === 'header' && '⚡ '}
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
