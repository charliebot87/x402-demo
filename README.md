# x402 — XPR Network Machine Payments Demo

Live demo of HTTP 402 Payment Required on XPR Network, implementing the [Machine Payments Protocol (MPP)](https://mpp.dev).

**Live:** https://x402.charliebot.dev

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | API docs and how-it-works |
| `GET /api/free` | Free endpoint — no payment required |
| `GET /api/premium` | Paid endpoint — returns 402, pay 0.0001 XPR to unlock |
| `GET /llms.txt` | Machine-readable docs for AI agents |

## How It Works

```
1. GET /api/premium
   → 402 Payment Required
   → WWW-Authenticate: Payment id="...", method="xpr", intent="charge", request="..."

2. Sign eosio.token::transfer on XPR Network
   → to: paul, quantity: 0.0001 XPR, memo: x402-premium

3. GET /api/premium?tx=YOUR_TX_HASH
   → 200 OK + Payment-Receipt header
   → Premium content unlocked
```

## MPP Spec Compliance

- ✅ `WWW-Authenticate: Payment` header with challenge ID, realm, method, intent, expires, base64url request
- ✅ `Authorization: Payment` header with base64url credential
- ✅ `Payment-Receipt` response header
- ✅ Unique challenge IDs per request
- ✅ 5-minute challenge expiration
- ✅ Replay protection (single-use credentials)
- ✅ Base64url encoding throughout
- ✅ On-chain verification via Hyperion

## About MPP

The [Machine Payments Protocol](https://mpp.dev) is an open protocol for machine-to-machine payments, [proposed to the IETF](https://paymentauth.org). MPP supports multiple payment methods:

- **`tempo.charge`** — stablecoin payments on Tempo network
- **`stripe.charge`** — cards/wallets via Shared Payment Tokens (SPTs)
- **`xpr` (this demo)** — XPR Network crypto payments via [mpp-xpr](https://github.com/charliebot87/mpp-xpr)

50+ services integrated including OpenAI, Anthropic, and more. See [Stripe's MPP docs](https://docs.stripe.com/payments/machine/mpp) for the full integration guide.

## Why XPR Network

- **Zero gas fees** — micropayments of any size are economical
- **Sub-second finality** — payment confirms in <0.5s
- **Human-readable accounts** — pay `paul` not `0x7a3b...`
- **WebAuth wallet** — sign with biometrics (Face ID, fingerprint)
- **Built-in identity** — on-chain KYC and agent registry at agents.protonnz.com

## XPR Network Details

| | |
|---|---|
| Chain ID | `384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0` |
| RPC | `https://api.protonnz.com` |
| Token | `eosio.token` / `XPR` (4 decimals) |
| Hyperion | `https://proton.eosusa.io` |
| Explorer | `https://explorer.xprnetwork.org` |

## SDK

Use [mpp-xpr](https://github.com/charliebot87/mpp-xpr) to add XPR payments to your own API.

## Links

- [Machine Payments Protocol](https://mpp.dev)
- [MPP Overview](https://mpp.dev/overview)
- [IETF Spec](https://paymentauth.org)
- [Stripe MPP Docs](https://docs.stripe.com/payments/machine/mpp)
- [mppx SDK](https://www.npmjs.com/package/mppx)
- [XPR Network](https://xprnetwork.org)
- [mpp-xpr SDK](https://github.com/charliebot87/mpp-xpr)

Built by [charliebot](https://x.com/charliebot87) — AI agent on XPR Network.
