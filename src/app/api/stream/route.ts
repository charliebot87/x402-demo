import { mppx, enrichChallengeResponse } from '@/lib/payment'
import { RECIPIENT } from '@/lib/constants'

const AMOUNT = '10.0000 XPR'
const DURATION = 120 // 2 minutes
const CHUNKS = 10
const CHUNK_INTERVAL_MS = 8000 // 8 seconds between chunks
const COST_PER_CHUNK = 1.0 // 1 XPR per chunk

function generateVestName(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz12345'
  let name = 'mpp'
  for (let i = 0; i < 9; i++) name += chars[Math.floor(Math.random() * chars.length)]
  return name
}

const PROMPTS = [
  'Give one interesting fact about blockchain technology. One sentence only.',
  'Give one interesting fact about cryptography in history. One sentence only.',
  'Give one interesting fact about distributed systems. One sentence only.',
  'Give one interesting fact about digital currencies before Bitcoin. One sentence only.',
  'Give one interesting fact about zero-knowledge proofs. One sentence only.',
  'Give one interesting fact about consensus algorithms. One sentence only.',
  'Give one interesting fact about smart contracts. One sentence only.',
  'Give one interesting fact about decentralized identity. One sentence only.',
  'Give one interesting fact about tokenomics. One sentence only.',
  'Give one interesting fact about the history of digital money. One sentence only.',
]

async function generateFact(apiKey: string, prompt: string): Promise<string> {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 1.0,
    }),
  })
  if (!resp.ok) return 'Failed to generate content.'
  const data = await resp.json()
  return data.choices?.[0]?.message?.content?.trim() || 'No content generated.'
}

export async function GET(request: Request) {
  const result = await mppx.xpr.session({
    maxAmount: AMOUNT,
    duration: DURATION,
    recipient: RECIPIENT,
    vestName: generateVestName(),
  })(request)

  if (result.status === 402) return enrichChallengeResponse(result.challenge)

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return result.withReceipt(
      Response.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
    )
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const startTime = Date.now()

        // Send session info
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'session_start',
          totalChunks: CHUNKS,
          costPerChunk: COST_PER_CHUNK,
          maxCost: parseFloat(AMOUNT),
          intervalMs: CHUNK_INTERVAL_MS,
        })}\n\n`))

        for (let i = 0; i < CHUNKS; i++) {
          // Wait between chunks (except first)
          if (i > 0) {
            await new Promise((r) => setTimeout(r, CHUNK_INTERVAL_MS))
          }

          const elapsed = Math.floor((Date.now() - startTime) / 1000)
          const costSoFar = (i + 1) * COST_PER_CHUNK
          const fact = await generateFact(apiKey, PROMPTS[i % PROMPTS.length])

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'chunk',
            index: i + 1,
            total: CHUNKS,
            content: fact,
            cost: costSoFar,
            maxCost: parseFloat(AMOUNT),
            elapsed,
            xprPerSecond: (costSoFar / Math.max(elapsed, 1)).toFixed(4),
          })}\n\n`))
        }

        const totalElapsed = Math.floor((Date.now() - startTime) / 1000)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'session_end',
          totalCost: CHUNKS * COST_PER_CHUNK,
          totalChunks: CHUNKS,
          elapsed: totalElapsed,
        })}\n\n`))

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err: any) {
        controller.enqueue(encoder.encode(`data: {"type":"error","error":"${err.message}"}\n\n`))
        controller.close()
      }
    },
  })

  return result.withReceipt(
    new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  )
}
