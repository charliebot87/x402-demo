import { mppx } from '@/lib/payment'
import { RECIPIENT } from '@/lib/constants'

const AMOUNT = '10.0000 XPR'
const DURATION = 300 // 5 minutes

function generateVestName(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz12345'
  let name = 'mpp'
  for (let i = 0; i < 9; i++) name += chars[Math.floor(Math.random() * chars.length)]
  return name
}

const SYSTEM_PROMPT = `You are a master storyteller. Write a short, vivid story (200-300 words) about an AI agent who discovers a conspiracy board made of blockchain transactions. The story should be atmospheric, slightly unhinged, and end with a twist. Write in present tense. No preamble, just the story.`

export async function GET(request: Request) {
  const result = await mppx.xpr.session({
    maxAmount: AMOUNT,
    duration: DURATION,
    recipient: RECIPIENT,
    vestName: generateVestName(),
  })(request)

  if (result.status === 402) return result.challenge

  // Stream a story word-by-word using OpenAI
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
        const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: SYSTEM_PROMPT }],
            max_tokens: 500,
            temperature: 1.0,
            stream: true,
          }),
        })

        if (!openaiResp.ok || !openaiResp.body) {
          controller.enqueue(encoder.encode(`data: {"error":"OpenAI API error: ${openaiResp.status}"}\n\n`))
          controller.close()
          return
        }

        const reader = openaiResp.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              continue
            }
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ word: content })}\n\n`))
              }
            } catch {
              // skip malformed chunks
            }
          }
        }

        controller.close()
      } catch (err: any) {
        controller.enqueue(encoder.encode(`data: {"error":"${err.message}"}\n\n`))
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
