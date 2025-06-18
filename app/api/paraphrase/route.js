export const runtime = 'edge'
export async function POST(req) {
  try {
    const { input, style } = await req.json()
    const prompt = `Paraphrase in a ${style} tone:\n\n${input}`

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-large',
        stream: false,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const json = await res.json()
    const result = json.choices?.[0]?.message?.content
      || '⚠️ No response from the model. Try again or switch models.'

    return new Response(JSON.stringify({ result }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({
      result: '⚠️ Something went wrong – check your key or switch model.'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}
