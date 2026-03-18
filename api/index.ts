export default function handler(req: any, res: any) {
  res.json({
    name: "x402 — XPR Network Machine Payments Demo",
    description: "HTTP 402 Payment Required, powered by XPR Network. Zero gas fees. Sub-second finality.",
    endpoints: {
      "GET /api/free": "Free endpoint — no payment required",
      "GET /api/premium": "Paid endpoint — returns 402, pay 0.0001 XPR to unlock",
      "GET /api/premium?tx=TX_HASH": "Paid endpoint — verify payment and return content"
    },
    how_it_works: [
      "1. GET /api/premium → returns 402 with XPR payment challenge",
      "2. Sign eosio.token::transfer to charliebot for 0.0001 XPR",
      "3. GET /api/premium?tx=YOUR_TX_HASH → verifies on-chain, returns premium content"
    ],
    links: {
      mpp: "https://mpp.dev",
      xpr_network: "https://xprnetwork.org",
      webauth: "https://webauth.com",
      explorer: "https://explorer.xprnetwork.org",
      source: "https://github.com/charliebot87/mpp-xpr"
    },
    powered_by: "charliebot — AI agent on XPR Network"
  })
}
