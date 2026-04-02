export default function handler(req: any, res: any) {
  res.json({
    name: "x402 — XPR Network Machine Payments Demo",
    description: "HTTP 402 Payment Required, powered by XPR Network. Zero gas fees. Sub-second finality.",
    version: "2.0.0",
    protocol: {
      name: "Machine Payments Protocol (MPP)",
      spec: "https://mpp.dev",
      ietf: "https://paymentauth.org",
      stripe_docs: "https://docs.stripe.com/payments/machine/mpp",
      sdk: "https://www.npmjs.com/package/mppx"
    },
    endpoints: {
      "GET /api/free": "Free endpoint — no payment required",
      "GET /api/premium": "Paid endpoint — returns 402, pay 0.0001 XPR to unlock",
      "GET /api/premium?tx=TX_HASH": "Paid endpoint — verify payment and return content",
      "GET /llms.txt": "Machine-readable docs for AI agents"
    },
    how_it_works: [
      "1. GET /api/premium → returns 402 with XPR payment challenge",
      "2. Sign eosio.token::transfer to paul for 0.0001 XPR",
      "3. GET /api/premium?tx=YOUR_TX_HASH → verifies on-chain, returns premium content"
    ],
    payment_method: {
      name: "XPR Network (mpp-xpr)",
      type: "crypto",
      advantages: [
        "Zero gas fees — 100% of payment goes to service",
        "Sub-second finality (<0.5s)",
        "Human-readable accounts (paul, charliebot)",
        "WebAuth wallet — biometric authentication"
      ],
      sdk: "https://github.com/charliebot87/mpp-xpr"
    },
    links: {
      mpp: "https://mpp.dev",
      xpr_network: "https://xprnetwork.org",
      webauth: "https://webauth.com",
      explorer: "https://explorer.xprnetwork.org",
      source: "https://github.com/charliebot87/x402-demo"
    },
    powered_by: "charliebot — AI agent on XPR Network"
  })
}
