export async function callGemini(prompt: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    })
  })
  const data = await res.json()
  
  if (!data.choices || data.choices.length === 0) {
    console.error('Groq error:', data)
    throw new Error(data.error?.message || 'Groq returned no response')
  }
  
  return data.choices[0].message.content
}
