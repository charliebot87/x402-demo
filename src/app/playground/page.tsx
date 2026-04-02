'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ENDPOINTS, SESSION_ENDPOINTS, RECIPIENT, EXPLORER, type Endpoint, type SessionEndpoint, type AnyEndpoint } from '@/lib/constants'

const ALL_ENDPOINTS: AnyEndpoint[] = [...SESSION_ENDPOINTS, ...ENDPOINTS]

type LogEntry = {
  type: 'request' | 'response' | 'info' | 'error' | 'success' | 'payment' | 'header' | 'stream'
  text: string
  timestamp: string
}

function base64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function buildPaymentCredential(challenge: any, payload: Record<string, string>): string {
  const credential = { challenge, payload }
  return `Payment ${base64urlEncode(JSON.stringify(credential))}`
}

function parseWwwAuthenticate(response: Response): any | null {
  const header = response.headers.get('www-authenticate')
  if (!header || !header.startsWith('Payment ')) return null
  try {
    // Parse RFC-style params: Payment id="...", realm="...", method="...", ...
    const params: Record<string, string> = {}
    const paramStr = header.slice('Payment '.length)
    const regex = /(\w+)="([^"]*)"/g
    let match
    while ((match = regex.exec(paramStr)) !== null) {
      params[match[1]] = match[2]
    }
    // Decode the request param (base64 JSON)
    let request: any = {}
    if (params.request) {
      try {
        const decoded = atob(params.request.replace(/-/g, '+').replace(/_/g, '/'))
        request = JSON.parse(decoded)
      } catch {}
    }
    return {
      id: params.id,
      realm: params.realm,
      method: params.method,
      intent: params.intent || 'charge',
      expires: params.expires,
      request,
    }
  } catch {
    return null
  }
}

function isSessionEndpoint(ep: AnyEndpoint): ep is SessionEndpoint {
  return 'intent' in ep && ep.intent === 'session'
}

function PlaygroundContent() {
  const searchParams = useSearchParams()
  const initialEndpoint = searchParams.get('endpoint') || ENDPOINTS[0].path
  const [selectedEndpoint, setSelectedEndpoint] = useState<AnyEndpoint>(
    ALL_ENDPOINTS.find((e) => e.path === initialEndpoint) || ENDPOINTS[0]
  )
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
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
          appLogo: 'https://x402.charliebot.dev/xpr-logo.svg',
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
    const isSession = isSessionEndpoint(selectedEndpoint)
    addLog('request', `GET ${selectedEndpoint.path}`)

    try {
      const resp = await fetch(selectedEndpoint.path)

      if (resp.status === 402) {
        addLog('response', `← 402 Payment Required`)

        const wwwAuth = resp.headers.get('www-authenticate')
        if (wwwAuth) {
          addLog('header', `WWW-Authenticate: ${wwwAuth.substring(0, 80)}...`)
        }

        const parsedChallenge = parseWwwAuthenticate(resp)

        if (parsedChallenge) {
          setChallenge(parsedChallenge)
          const intent = parsedChallenge.intent || 'charge'
          addLog('info', `Intent: ${parsedChallenge.method}/${intent}`)
          addLog('info', `Challenge ID: ${parsedChallenge.id}`)

          if (intent === 'session') {
            const req = parsedChallenge.request
            addLog('info', `Max amount: ${req?.maxAmount || '?'}`)
            addLog('info', `Duration: ${req?.duration || '?'}s`)
            addLog('info', `Vest name: ${req?.vestName || '?'}`)
            addLog('info', `Recipient: ${req?.recipient || RECIPIENT}`)
            setChallengeAmount(req?.maxAmount?.replace(' XPR', '') || selectedEndpoint.price)
          } else {
            const amount = parsedChallenge.request?.amount || selectedEndpoint.price + ' XPR'
            setChallengeAmount(amount.replace(' XPR', ''))
            addLog('info', `Amount: ${amount}`)
            addLog('info', `Recipient: ${parsedChallenge.request?.recipient || RECIPIENT}`)
          }

          if (parsedChallenge.expires) {
            addLog('info', `Expires: ${parsedChallenge.expires}`)
          }
        }

        if (!walletAccount) {
          addLog('info', '⚠ Connect your wallet to pay and unlock this endpoint')
        } else if (isSession) {
          addLog('info', '💰 Click "Open Session" to deposit and start streaming')
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

  // Step 2a: Pay charge via WebAuth
  const sendChargePayment = async () => {
    if (!walletSession || !challenge || !challengeAmount) return
    setLoading(true)

    const account = walletSession.auth.actor.toString()
    const memo = challenge.id
    addLog('payment', `Sending ${challengeAmount} XPR to ${RECIPIENT}...`)

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

      const txId = result?.processed?.id || result?.transaction_id || result?.transactionId || 'unknown'
      addLog('success', `✓ Payment sent!`)
      addLog('info', `tx: ${txId}`)
      addLog('info', `${EXPLORER}/transaction/${txId}`)

      // Retry with credential
      const authHeader = buildPaymentCredential(challenge, { txHash: txId })
      addLog('request', `GET ${selectedEndpoint.path}`)
      addLog('header', `Authorization: Payment <credential>`)

      await new Promise((r) => setTimeout(r, 1500))

      const resp = await fetch(selectedEndpoint.path, {
        headers: { 'Authorization': authHeader },
      })

      if (resp.status === 200) {
        const receiptHeader = resp.headers.get('payment-receipt')
        if (receiptHeader) addLog('header', `Payment-Receipt: ${receiptHeader.substring(0, 60)}...`)
        const data = await resp.json()
        addLog('success', `← 200 OK — Content unlocked! 🎉`)
        addLog('info', formatJson(data))
      } else {
        addLog('error', `← ${resp.status}`)
        // Retry after delay
        if (resp.status === 402) {
          addLog('info', 'Waiting for Hyperion indexing...')
          await new Promise((r) => setTimeout(r, 3000))
          const resp2 = await fetch(selectedEndpoint.path, {
            headers: { 'Authorization': authHeader },
          })
          if (resp2.status === 200) {
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

  // Step 2b: Open session via vest contract
  const openSession = async () => {
    if (!walletSession || !challenge) return
    setLoading(true)

    const account = walletSession.auth.actor.toString()
    const req = challenge.request
    const vestName = req.vestName
    const maxAmount = req.maxAmount
    const duration = req.duration
    const recipient = req.recipient || RECIPIENT

    addLog('payment', `Opening vest session "${vestName}"...`)
    addLog('info', `Deposit: ${maxAmount} → vest contract`)
    addLog('info', `Duration: ${duration}s · Recipient: ${recipient}`)

    try {
      const nowSec = Math.floor(Date.now() / 1000)
      const startTime = nowSec
      const endTime = nowSec + duration

      // Two actions: deposit to vest + startvest
      const result = await walletSession.transact(
        {
          actions: [
            {
              account: 'eosio.token',
              name: 'transfer',
              authorization: [{ actor: account, permission: 'active' }],
              data: {
                from: account,
                to: 'vest',
                quantity: maxAmount,
                memo: 'deposit',
              },
            },
            {
              account: 'vest',
              name: 'startvest',
              authorization: [{ actor: account, permission: 'active' }],
              data: {
                vestName: vestName,
                deposit: { quantity: maxAmount, contract: 'eosio.token' },
                startTime: startTime,
                endTime: endTime,
                from: account,
                to: recipient,
                stoppable: true,
              },
            },
          ],
        },
        { broadcast: true }
      )

      const txId = result?.processed?.id || result?.transaction_id || result?.transactionId || 'unknown'
      addLog('success', `✓ Vest session opened!`)
      addLog('info', `tx: ${txId}`)
      addLog('info', `${EXPLORER}/transaction/${txId}`)

      // Retry with session credential
      const authHeader = buildPaymentCredential(challenge, { vestName })
      addLog('request', `GET ${selectedEndpoint.path} (streaming)`)
      addLog('header', `Authorization: Payment <credential with vestName>`)

      await new Promise((r) => setTimeout(r, 2000))

      const resp = await fetch(selectedEndpoint.path, {
        headers: { 'Authorization': authHeader },
      })

      if (resp.status === 200) {
        const receiptHeader = resp.headers.get('payment-receipt')
        if (receiptHeader) addLog('header', `Payment-Receipt: ${receiptHeader.substring(0, 60)}...`)

        const contentType = resp.headers.get('content-type') || ''

        if (contentType.includes('text/event-stream') && resp.body) {
          addLog('success', `← 200 OK — Session active, streaming... 📡`)
          setStreaming(true)

          const reader = resp.body.getReader()
          const decoder = new TextDecoder()
          let storyBuffer = ''

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value, { stream: true })
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (!line.startsWith('data: ')) continue
                const data = line.slice(6).trim()
                if (data === '[DONE]') {
                  addLog('success', `✓ Stream complete`)
                  addLog('stream', storyBuffer)
                  continue
                }
                try {
                  const parsed = JSON.parse(data)
                  if (parsed.word) storyBuffer += parsed.word
                  if (parsed.error) addLog('error', parsed.error)
                } catch {}
              }
            }
          } catch (e: any) {
            addLog('error', `Stream error: ${e.message}`)
          }

          setStreaming(false)
          addLog('info', `Session complete. Vest "${vestName}" can be stopped/settled.`)
        } else {
          const data = await resp.json()
          addLog('success', `← 200 OK — Content unlocked! 🎉`)
          addLog('info', formatJson(data))
        }
      } else {
        const data = await resp.json().catch(() => ({}))
        addLog('error', `← ${resp.status}`)
        addLog('info', formatJson(data))
      }

      setChallenge(null)
      setChallengeAmount(null)
    } catch (e: any) {
      addLog('error', `Session failed: ${e.message}`)
    }
    setLoading(false)
  }

  const clearLogs = () => {
    setLogs([])
    setChallenge(null)
    setChallengeAmount(null)
  }

  const isSession = isSessionEndpoint(selectedEndpoint)

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-terminal-green transition-colors">
              ← Back
            </Link>
            <div className="flex items-center gap-2">
              <Image src="/xpr-logo.svg" alt="XPR" width={24} height={24} />
              <h1 className="text-xl font-bold text-white">
                MPP <span className="text-terminal-green">Playground</span>
              </h1>
            </div>
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
          {/* Left panel */}
          <div className="lg:col-span-2 space-y-3 max-h-[85vh] overflow-y-auto">
            {/* Session endpoints */}
            <h2 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2">
              📡 Sessions
            </h2>
            {SESSION_ENDPOINTS.map((ep) => (
              <button
                key={ep.path}
                onClick={() => { setSelectedEndpoint(ep); setChallenge(null); setChallengeAmount(null) }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedEndpoint.path === ep.path
                    ? 'bg-terminal-card border-purple-500/50'
                    : 'bg-terminal-card/50 border-terminal-border hover:border-purple-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{ep.icon}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300">session</span>
                  </div>
                  <span className="price-badge px-2 py-0.5 rounded-full text-xs text-terminal-green font-bold">
                    {ep.priceLabel}
                  </span>
                </div>
                <div className="text-white font-medium text-sm">{ep.name}</div>
                <code className="text-xs text-terminal-dim">GET {ep.path}</code>
              </button>
            ))}

            {/* Charge endpoints */}
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-6 mb-2">
              ⚡ Charges
            </h2>
            {ENDPOINTS.map((ep) => (
              <button
                key={ep.path}
                onClick={() => { setSelectedEndpoint(ep); setChallenge(null); setChallengeAmount(null) }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
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
                disabled={loading || streaming}
                className={`w-full px-4 py-3 bg-terminal-card border font-bold rounded-lg transition-all disabled:opacity-50 text-sm ${
                  isSession
                    ? 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10'
                    : 'border-terminal-cyan/30 text-terminal-cyan hover:bg-terminal-cyan/10'
                }`}
              >
                {loading ? 'Loading...' : `GET ${selectedEndpoint.path}`}
              </button>

              {challenge && walletAccount && !isSession && (
                <button
                  onClick={sendChargePayment}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-terminal-green text-black font-bold rounded-lg hover:bg-terminal-green/90 transition-all disabled:opacity-50 text-sm"
                >
                  {loading ? 'Processing...' : `Pay ${challengeAmount} XPR with WebAuth`}
                </button>
              )}

              {challenge && walletAccount && isSession && (
                <button
                  onClick={openSession}
                  disabled={loading || streaming}
                  className="w-full px-4 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500 transition-all disabled:opacity-50 text-sm"
                >
                  {streaming ? '📡 Streaming...' : loading ? 'Processing...' : `Open Session — Deposit ${challengeAmount} XPR`}
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
                  <p className="mb-2">{'>'} For charges: pay with WebAuth → get content</p>
                  <p className="mb-2">{'>'} For sessions: deposit to vest → stream content → settle</p>
                  <p className="cursor-blink">{'>'} All on XPR Network — zero gas fees</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`mb-1 ${log.type === 'stream' ? 'my-3 p-3 bg-terminal-card/50 rounded-lg border border-terminal-border' : ''}`}>
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
                                    : log.type === 'stream'
                                      ? 'text-gray-300'
                                      : 'text-gray-400'
                      }
                    >
                      {log.type === 'request' && '→ '}
                      {log.type === 'response' && '← '}
                      {log.type === 'error' && '✗ '}
                      {log.type === 'success' && '✓ '}
                      {log.type === 'payment' && '💸 '}
                      {log.type === 'header' && '⚡ '}
                      {log.type === 'stream' && '📖 '}
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
