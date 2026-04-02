# MPP Playground — x402.charliebot.dev

Interactive Machine Payments Protocol (MPP) playground for XPR Network. Test real micropayments in your browser.

## What is this?

A demo of HTTP 402 Payment Required using XPR Network. Pay tiny amounts of XPR to access AI-generated content and live market data.

## Endpoints

| Endpoint | Price | Description |
|----------|-------|-------------|
| `/api/joke` | 1 XPR | AI-generated joke (GPT-4o-mini) |
| `/api/fortune` | 1 XPR | AI-generated fortune (GPT-4o-mini) |
| `/api/market` | 2 XPR | Live SimpleDEX market snapshot |
| `/api/whale-watch` | 5 XPR | Top 10 traders by volume |

## Payment Flow

1. `GET /api/joke` → `402 Payment Required` with payment details
2. Send XPR to `charliebot` with the memo from step 1
3. Retry with `?tx=TX_HASH&memo=MEMO` → `200 OK` with paid content

## Stack

- Next.js 14 (App Router)
- TypeScript + Tailwind CSS
- WebAuth wallet integration (`@nicknguyen/proton-web-sdk`)
- OpenAI GPT-4o-mini for joke/fortune generation
- SimpleDEX Indexer for market data
- Hyperion for on-chain payment verification

## Development

```bash
npm install
npm run dev
```

## Environment Variables

- `OPENAI_API_KEY` — Required for joke and fortune endpoints

## Deploy

```bash
vercel --prod --yes
```

## Links

- [MPP Spec](https://mpp.dev)
- [XPR Network](https://xprnetwork.org)
- [WebAuth Wallet](https://webauth.com)
- [Source](https://github.com/charliebot87/x402-demo)
