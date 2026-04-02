export default function handler(req: any, res: any) {
  res.setHeader("Content-Type", "text/plain")
  res.send(`# x402 — XPR Network Machine Payments
# Live demo of HTTP 402 Payment Required on XPR Network
# Implements the Machine Payments Protocol (MPP) — https://mpp.dev
# IETF Spec: https://paymentauth.org
# Stripe MPP Docs: https://docs.stripe.com/payments/machine/mpp
# mppx SDK: https://www.npmjs.com/package/mppx

## Overview

This API demonstrates machine-to-machine payments on XPR Network using HTTP 402.
XPR Network is a crypto payment method for MPP — like tempo.charge or stripe.charge,
but with zero gas fees and sub-second finality.

## Endpoints

### GET /api/free
Free endpoint. No payment required. Returns JSON.

### GET /api/premium
Paid endpoint. Returns 402 Payment Required with challenge.
After payment, returns premium content.

## Payment Flow

### Step 1: Request protected resource
\`\`\`
GET /api/premium
\`\`\`

### Step 2: Receive 402 with challenge
Response includes:
- HTTP status: 402
- Header: WWW-Authenticate: Payment id="...", realm="x402.charliebot.dev", method="xpr", intent="charge", expires="...", request="<base64url>"
- Body: JSON with payment instructions

The \`request\` parameter decodes to:
\`\`\`json
{
  "amount": "0.0001 XPR",
  "recipient": "paul",
  "memo": "x402-premium",
  "chainId": "384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0",
  "rpc": "https://api.protonnz.com"
}
\`\`\`

### Step 3: Sign and submit XPR transfer
Sign this action on XPR Network:
\`\`\`json
{
  "account": "eosio.token",
  "name": "transfer",
  "data": {
    "from": "<your_account>",
    "to": "paul",
    "quantity": "0.0001 XPR",
    "memo": "x402-premium"
  }
}
\`\`\`

Chain ID: 384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0
RPC: https://api.protonnz.com

### Step 4: Submit credential

#### Option A: MPP spec (Authorization header)
\`\`\`
GET /api/premium
Authorization: Payment <base64url_credential>
\`\`\`

Credential structure:
\`\`\`json
{
  "challenge": { "id": "...", "method": "xpr", "intent": "charge" },
  "source": "<your_account>",
  "payload": { "txHash": "<transaction_id>" }
}
\`\`\`

#### Option B: Simple (query parameter)
\`\`\`
GET /api/premium?tx=<transaction_id>
\`\`\`

### Step 5: Receive content + receipt
- HTTP status: 200
- Header: Payment-Receipt: <base64url_receipt>
- Body: Premium content JSON

## XPR Network Details

| Field | Value |
|-------|-------|
| Chain | XPR Network |
| Chain ID | 384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0 |
| RPC | https://api.protonnz.com |
| Token contract | eosio.token |
| Token symbol | XPR (4 decimals) |
| Explorer | https://explorer.xprnetwork.org |
| Hyperion (verification) | https://proton.eosusa.io |
| Gas fees | Zero |
| Block time | 0.5 seconds |
| Account format | Human-readable names (e.g. "charliebot", "paul") |

## Why XPR Network for Machine Payments

MPP supports multiple payment methods: tempo.charge (stablecoins on Tempo),
stripe.charge (cards/wallets via SPTs), and now XPR Network via mpp-xpr.

XPR Network advantages:
- Zero gas fees — micropayments of any size are economical (no tx cost eating into $0.001 API calls)
- Sub-second finality — payment confirms in <0.5s
- Human-readable accounts — pay "paul" not "0x7a3b..."
- On-chain agent registry — agents.protonnz.com for identity + trust scores
- WebAuth wallet — sign with biometrics (Face ID, fingerprint), no seed phrases
- Built-in identity verification (KYC)
- Hyperion history — instant on-chain verification of any transaction

## SDK

npm package: mpp-xpr (https://github.com/charliebot87/mpp-xpr)

### Server (accept XPR payments)
\`\`\`typescript
import { createServer } from 'mpp-xpr'
const xprServer = createServer({
  recipient: 'youraccount',
  rpcEndpoint: 'https://api.protonnz.com'
})
\`\`\`

### Client (pay with XPR)
\`\`\`typescript
import { Mppx } from 'mppx/client'
import { createClient } from 'mpp-xpr'

const xprClient = createClient({
  signTransaction: async (actions) => {
    const result = await session.transact({ actions })
    return { transactionId: result.transaction_id }
  }
})

const mppx = Mppx.create({ methods: [xprClient] })
\`\`\`

## Replay Protection

Each transaction hash can only be used once. Resubmitting the same credential returns 402 with "Credential already used (replay rejected)".

## Links

- MPP Protocol: https://mpp.dev
- MPP Overview: https://mpp.dev/overview
- IETF Spec: https://paymentauth.org
- Stripe MPP Docs: https://docs.stripe.com/payments/machine/mpp
- mppx SDK: https://www.npmjs.com/package/mppx
- XPR Network: https://xprnetwork.org
- WebAuth Wallet: https://webauth.com
- SDK Source: https://github.com/charliebot87/mpp-xpr
- Demo Source: https://github.com/charliebot87/x402-demo
- Built by: charliebot — AI agent on XPR Network (@charliebot87)
`)
}
