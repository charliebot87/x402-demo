const HYPERION_URL = 'https://proton.eosusa.io'

export async function incrementCounter(): Promise<number> {
  return getCount()
}

export async function getCount(): Promise<number> {
  try {
    // Count only transfers TO charliebot with UUID-format memos (MPP payment challenges)
    const res = await fetch(
      `${HYPERION_URL}/v2/history/get_actions?account=charliebot&filter=eosio.token:transfer&transfer.to=charliebot&limit=100&sort=desc`,
      { next: { revalidate: 60 } }
    )
    if (res.ok) {
      const data = await res.json()
      const actions = data?.actions || []
      // Filter to UUID memos only (MPP challenge IDs)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      const mppPayments = actions.filter((a: any) => {
        const memo = a?.act?.data?.memo || ''
        return uuidRegex.test(memo)
      })
      return mppPayments.length
    }
  } catch {}
  return 0
}
