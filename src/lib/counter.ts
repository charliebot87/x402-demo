const HYPERION_URL = 'https://proton.eosusa.io'

export async function incrementCounter(): Promise<number> {
  return getCount()
}

export async function getCount(): Promise<number> {
  try {
    // Count transfers TO charliebot with base64url memos (MPP challenge IDs)
    // MPP challenge IDs are HMAC-SHA256 hashes encoded as base64url (e.g. MoLddk-AQJxjxt4UZ...)
    const res = await fetch(
      `${HYPERION_URL}/v2/history/get_actions?account=charliebot&filter=eosio.token:transfer&transfer.to=charliebot&limit=500&sort=desc`,
      { next: { revalidate: 60 } }
    )
    if (res.ok) {
      const data = await res.json()
      const actions = data?.actions || []
      // MPP challenge IDs are 43-44 char base64url strings (256-bit HMAC)
      const mppMemoRegex = /^[A-Za-z0-9_-]{20,50}$/
      const mppPayments = actions.filter((a: any) => {
        const memo = a?.act?.data?.memo || ''
        return mppMemoRegex.test(memo)
      })
      return mppPayments.length
    }
  } catch {}
  return 0
}
