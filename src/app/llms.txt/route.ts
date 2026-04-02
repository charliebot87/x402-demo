import { NextResponse } from 'next/server'

const LLMS_TXT = `# x402.charliebot.dev — Machine Payments on XPR Network

> HTTP 402 Payment Required — implemented for real.
> Pay XPR to access paid API endpoints. No accounts, no API keys, no subscriptions.
> Built on the Machine Payments Protocol (MPP) with mppx-xpr-network.

## What is this?
A live demo of machine payments using the MPP standard on XPR Network.
AI agents and humans can pay XPR to unlock API endpoints — jokes, fortunes,
market data, and streaming sessions. Real on-chain payments. Real AI inference.
Zero gas fees.

## How it works (for agents)

### One-time charges
1. GET any charge endpoint → 402 + WWW-Authenticate: Payment header with challenge
2. Parse the challenge: id, amount, recipient, method
3. Send XPR transfer to "charliebot" with challenge.id as memo
4. Retry the GET with Authorization: Payment <base64url credential>
   - Credential contains: { challenge: <echoed challenge>, payload: { txHash: "<your tx hash>" } }
5. Server verifies on-chain via Hyperion → 200 + Payment-Receipt header + content

### Streaming sessions (vest contract)
1. GET /api/stream → 402 + challenge with intent "session" (includes vestName, duration, maxAmount)
2. Deposit to vest contract: transfer XPR to "vest" + call vest::startvest
3. Retry GET with Authorization: Payment <credential with vestName in payload>
4. Server verifies vest on-chain → 200 + Server-Sent Events stream
5. Stop early: call vest::stopvest to get unused XPR refunded

## Charge Endpoints (one-time payment)
- GET /api/joke — 1 XPR — AI-generated joke (GPT-4o-mini)
- GET /api/fortune — 1 XPR — AI-generated fortune (GPT-4o-mini)
- GET /api/market — 2 XPR — Live SimpleDEX market snapshot
- GET /api/whale-watch — 5 XPR — Top 10 traders by volume

## Session Endpoints (streaming payment)
- GET /api/stream — 10 XPR max — 10 AI facts streamed over ~90s, stop early for refund

## Free Endpoints
- GET /api/stats — Playground stats and endpoint list (JSON)
- GET /llms.txt — This file

## Payment Details
- Recipient: charliebot
- Network: XPR Network (https://xprnetwork.org)
- Token: XPR (eosio.token)
- Chain ID: 384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0
- RPC: https://api.protonnz.com
- Hyperion endpoints (verification, tried in order):
  - https://proton.eosusa.io
  - https://proton.protonuk.io
  - https://proton-api.eosiomadrid.io
  - https://xpr-mainnet-api.bloxprod.io
  - https://proton-hyperion.luminaryvisn.com

## HTTP Headers (IETF Payment Authentication draft)
- 402 response: WWW-Authenticate: Payment id="...", realm="...", method="xpr", intent="charge|session", request="<base64url>"
- Client retry: Authorization: Payment <base64url encoded credential JSON>
- 200 response: Payment-Receipt: <base64url encoded receipt>

## Credential format (base64url-encoded JSON)
{
  "challenge": {
    "id": "<HMAC challenge ID>",
    "method": "xpr",
    "intent": "charge",
    "realm": "x402.charliebot.dev",
    "request": { "amount": "1.0000 XPR", "recipient": "charliebot" }
  },
  "payload": {
    "txHash": "<on-chain transaction hash>"
  }
}

## NPM packages
- npm install mppx mppx-xpr-network
- Server: import { Mppx } from 'mppx/server'; import { xpr } from 'mppx-xpr-network'
- Docs: https://x402.charliebot.dev/docs

## Related
- MPP spec: https://mpp.dev
- x402 (Coinbase): https://x402.org
- IETF draft: https://paymentauth.org
- Source: https://github.com/charliebot87/x402-demo
- Payment plugin: https://github.com/charliebot87/mpp-xpr
- npm: https://npmjs.com/package/mppx-xpr-network
- XPR Network: https://xprnetwork.org
- WebAuth wallet: https://webauth.com
- Live playground: https://x402.charliebot.dev/playground
`

export async function GET() {
  return new NextResponse(LLMS_TXT, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
