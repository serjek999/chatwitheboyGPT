// Use Node.js runtime so Buffer works
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { Buffer } from 'buffer'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const message = formData.get('message') || ''
    const historyJSON = formData.get('history') || '[]'
    const file = formData.get('file')
    const history = JSON.parse(historyJSON)

    let imageDataURL = null
    let isImage = false

    if (file && file.type.startsWith('image/')) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const base64 = buffer.toString('base64')
      imageDataURL = `data:${file.type};base64,${base64}`
      isImage = true
    }

    const model = isImage
      ? 'meta-llama/llama-4-maverick:free'
      : 'meta-llama/llama-3.3-70b-instruct:free'

    const apiKey =
      model.includes('llama-4') ? process.env.LLAMA4_API_KEY : process.env.LLAMA3_API_KEY

    const userMessage = isImage
      ? [
          { type: 'text', text: message || 'Describe this image.' },
          { type: 'image_url', image_url: { url: imageDataURL } }
        ]
      : message

    history.push({ role: 'user', content: userMessage })

    const response = await fetch(process.env.OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Chat With Image',
      },
      body: JSON.stringify({
        model,
        messages: history,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('OpenRouter API error:', data)
      return NextResponse.json({
        reply: 'OpenRouter API error: ' + (data.error?.message || 'Unknown error'),
      })
    }

    const reply = data.choices?.[0]?.message
    return NextResponse.json({
      reply: reply?.content || 'No response from model.',
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      reply: 'Server error. Try again later.',
    })
  }
}
