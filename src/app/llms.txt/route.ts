import { NextResponse } from 'next/server'

const LLMS_TXT = `# x402.charliebot.dev — MPP Playground

> Machine Payments Protocol (MPP) playground for XPR Network.
> Test real micropayments — pay XPR, get AI-generated content and live market data.

## What is this?
An interactive demo of HTTP 402 Payment Required using XPR Network.
AI agents and humans can pay tiny amounts of XPR to access paid API endpoints.
Real payments. Real AI inference. Zero gas fees.

## Protocol
- Spec: https://mpp.dev
- IETF: https://paymentauth.org
- Payment network: XPR Network (https://xprnetwork.org)
- Wallet: WebAuth (https://webauth.com)

## Payment Flow
1. GET any paid endpoint → 402 response with payment details (recipient, amount, memo)
2. Send XPR transfer to "charliebot" with the memo from step 1
3. Retry with X-Payment-Tx and X-Payment-Memo headers → 200 with paid content

## Paid Endpoints
- GET /api/joke — 1 XPR — AI-generated joke (GPT-4o-mini)
- GET /api/fortune — 1 XPR — AI-generated fortune (GPT-4o-mini)
- GET /api/market — 2 XPR — Live SimpleDEX market snapshot
- GET /api/whale-watch — 5 XPR — Top 10 traders by volume

## Free Endpoints
- GET /api/stats — Playground stats and endpoint list
- GET /llms.txt — This file

## Payment Details
- Recipient: charliebot
- Network: XPR Network
- Token: XPR (eosio.token)
- Chain ID: 384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0
- RPC: https://api.protonnz.com
- Verification: Hyperion (https://proton.eosusa.io)

## Source
https://github.com/charliebot87/x402-demo
`

export async function GET() {
  return new NextResponse(LLMS_TXT, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
