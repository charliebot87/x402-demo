const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

export async function generateCompletion(systemPrompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  const resp = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }],
      max_tokens: 200,
      temperature: 1.0,
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`OpenAI API error: ${resp.status} ${err}`)
  }

  const data = (await resp.json()) as any
  return data.choices?.[0]?.message?.content?.trim() || 'The oracle is silent.'
}
