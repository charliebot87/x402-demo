#!/usr/bin/env node

const target = process.argv[2] || 'https://x402.charliebot.dev/openapi.json'

const REQUIRED_OFFER_FIELDS = ['amount', 'currency', 'intent', 'method', 'network', 'recipient']
const EXPECTED_NETWORK = 'xpr-network'
const EXPECTED_METHOD = 'xpr'

function fail(message) {
  console.error(`✗ ${message}`)
  process.exitCode = 1
}

function ok(message) {
  console.log(`✓ ${message}`)
}

function humanAmount(baseUnits) {
  const n = Number(baseUnits)
  if (!Number.isFinite(n)) return String(baseUnits)
  return `${(n / 10_000).toFixed(4)} XPR`
}

const response = await fetch(target, { headers: { accept: 'application/json' } })
if (!response.ok) {
  fail(`could not fetch ${target}: HTTP ${response.status}`)
  process.exit()
}

const spec = await response.json()
if (spec.openapi) ok(`openapi ${spec.openapi} document fetched`)
else fail('missing openapi version')

const paths = spec.paths || {}
const paidRoutes = []

for (const [path, methods] of Object.entries(paths)) {
  const get = methods?.get
  const offers = get?.['x-payment-info']?.offers
  if (!offers) continue

  if (!Array.isArray(offers) || offers.length === 0) {
    fail(`${path}: x-payment-info.offers is empty or not an array`)
    continue
  }

  for (const offer of offers) {
    const missing = REQUIRED_OFFER_FIELDS.filter((field) => offer[field] === undefined || offer[field] === '')
    if (missing.length) fail(`${path}: offer missing ${missing.join(', ')}`)
    if (offer.network !== EXPECTED_NETWORK) fail(`${path}: expected network ${EXPECTED_NETWORK}, got ${offer.network}`)
    if (offer.method !== EXPECTED_METHOD) fail(`${path}: expected method ${EXPECTED_METHOD}, got ${offer.method}`)
    if (!/^\d+$/.test(String(offer.amount))) fail(`${path}: amount should be integer XPR base units, got ${offer.amount}`)
    if (!['charge', 'session'].includes(offer.intent)) fail(`${path}: unknown intent ${offer.intent}`)

    paidRoutes.push({
      path,
      summary: get.summary || path,
      amount: humanAmount(offer.amount),
      intent: offer.intent,
      recipient: offer.recipient,
    })
  }
}

if (paidRoutes.length === 0) fail('no paid routes discovered')
else ok(`${paidRoutes.length} paid XPR routes discoverable by agents`)

console.log('\nagent-service-card')
console.log(JSON.stringify({
  service: spec.info?.title || 'XPR paid service',
  url: spec.servers?.[0]?.url || target.replace(/\/openapi\.json$/, ''),
  discovery: target,
  paidRoutes,
}, null, 2))
