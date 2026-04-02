const HYPERION_URL = 'https://proton.eosusa.io'

export async function incrementCounter(): Promise<number> {
  // No-op — count is derived from on-chain data
  return getCount()
}

export async function getCount(): Promise<number> {
  try {
    // Count transfers to charliebot (our payment recipient)
    const res = await fetch(
      `${HYPERION_URL}/v2/history/get_actions?account=charliebot&filter=eosio.token:transfer&limit=1&sort=desc`,
      { next: { revalidate: 60 } }
    )
    if (res.ok) {
      const data = await res.json()
      return data?.total?.value || 0
    }
  } catch {}
  return 0
}
