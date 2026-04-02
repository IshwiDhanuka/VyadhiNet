export async function callGroq(prompt: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.15,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    }),
  })
  const data = await res.json()
  if (!data.choices || data.choices.length === 0) {
    console.error('Groq error:', data)
    throw new Error(data.error?.message || 'Groq returned no response')
  }
  return data.choices[0].message.content
}

// Keep old export name for compatibility
export const callGemini = callGroq
