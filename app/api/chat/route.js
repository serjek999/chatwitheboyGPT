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

    const isTechnical = (text) => {
      const keywords = [
        'equation', 'solve', 'calculate', 'formula', 'physics',
        'chemistry', 'biology', 'integral', 'derivative', 'explain why',
        'prove', 'program', 'code', 'algorithm', 'debug', 'function', 'loop',
        'array', 'syntax', 'runtime', 'logic', 'reasoning'
      ]
      const lowerText = text.toLowerCase()
      return keywords.some(keyword => lowerText.includes(keyword))
    }

    const getModelAndApiKey = (isImage, fallbackToLlama4 = false, usePhi4 = false) => {
      if (isImage || fallbackToLlama4) {
        return {
          model: 'meta-llama/llama-4-maverick:free',
          apiKey: process.env.LLAMA4_API_KEY,
        }
      }
      if (usePhi4) {
        return {
          model: 'microsoft/phi-4-reasoning-plus:free',
          apiKey: process.env.PHI4_API_KEY,
        }
      }
      return {
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        apiKey: process.env.LLAMA3_API_KEY,
      }
    }

    const buildUserMessage = () => {
      return isImage
        ? [
            { type: 'text', text: message || 'Describe this image.' },
            { type: 'image_url', image_url: { url: imageDataURL } },
          ]
        : message
    }

    const trySendRequest = async ({ model, apiKey }) => {
      const userMessage = buildUserMessage()
      const messages = [...history, { role: 'user', content: userMessage }]

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
          messages,
        }),
      })

      let data
      try {
        data = await response.json()
      } catch (err) {
        const text = await response.text()
        return {
          success: false,
          error: `OpenRouter server error (${response.status}): ${text}`,
        }
      }

      if (!response.ok) {
        const errMsg = data.error?.message || ''
        const isCreditError =
          errMsg.includes('quota') ||
          errMsg.includes('usage limit') ||
          errMsg.includes('no credits') ||
          errMsg.includes('insufficient credits')

        return {
          success: false,
          isCreditError,
          error: errMsg,
        }
      }

      return {
        success: true,
        reply: data.choices?.[0]?.message?.content || 'No response from model.',
      }
    }

    // Handle image prompt (always LLaMA 4)
    if (isImage) {
      const attempt = await trySendRequest(getModelAndApiKey(true))
      return NextResponse.json({
        reply: attempt.success ? attempt.reply : attempt.error,
      })
    }

    // Detect if technical question → try Phi-4
    if (isTechnical(message)) {
      const phiAttempt = await trySendRequest(getModelAndApiKey(false, false, true))
      if (phiAttempt.success) {
        return NextResponse.json({ reply: phiAttempt.reply })
      }
      // fallback to llama-3 if Phi fails (optional)
    }

    // Try LLaMA 3
    const llama3Attempt = await trySendRequest(getModelAndApiKey(false))
    if (llama3Attempt.success) {
      return NextResponse.json({ reply: llama3Attempt.reply })
    }

    // If quota issue → fallback to LLaMA 4
    if (llama3Attempt.isCreditError) {
      const fallbackAttempt = await trySendRequest(getModelAndApiKey(false, true))
      if (fallbackAttempt.success) {
        return NextResponse.json({ reply: fallbackAttempt.reply })
      }
    }

    // If all failed
    return NextResponse.json({
      reply: 'All model attempts failed: ' + (llama3Attempt.error || 'Unknown error.'),
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      reply: 'Server error. Try again later.',
    })
  }
}
