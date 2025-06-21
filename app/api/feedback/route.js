export async function POST(req) {
  const body = await req.json()

  const scriptUrl = 'https://script.google.com/macros/s/AKfycbyE00Gq1e8Hcz-MFNOvTWzB0_Ou7K2U3pIqRvg8H2xcGB2Xg9a88GNsw1iwhpO06QJPuA/exec'

  try {
    const res = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const text = await res.text()

    // ✅ Accept plain text like "Success"
    if (text.trim().toLowerCase() === 'success') {
      return new Response(JSON.stringify({ status: 'success' }), { status: 200 })
    }

    // ✅ Try to parse JSON response
    try {
      const data = JSON.parse(text)
      return new Response(JSON.stringify(data), { status: 200 })
    } catch {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Invalid JSON response from script' }),
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Google Script request failed:', error)
    return new Response(
      JSON.stringify({ status: 'error', message: error.message }),
      { status: 500 }
    )
  }
}
