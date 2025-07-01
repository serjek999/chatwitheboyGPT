export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { Buffer } from 'buffer'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const message = formData.get('message')?.trim() || ''
    const historyJSON = formData.get('history') || '[]'
    const file = formData.get('file')
    const history = JSON.parse(historyJSON)

    let imageDataURL = null
    let isImage = false

    if (file && file.type?.startsWith('image/')) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const base64 = buffer.toString('base64')
      imageDataURL = `data:${file.type};base64,${base64}`
      isImage = true
    }

    if (!message && !isImage) {
      return NextResponse.json({ reply: '❌ No message or image provided.' })
    }

    const isTechnical = (text) => {
      const keywords = [
        'equation', 'solve', 'calculate', 'formula', 'physics',
        'chemistry', 'biology', 'integral', 'derivative', 'explain why',
        'prove', 'program', 'code', 'algorithm', 'debug', 'function', 'loop',
        'array', 'syntax', 'runtime', 'logic', 'reasoning'
      ]
      return keywords.some(keyword => text.toLowerCase().includes(keyword))
    }

    const isWebSearchQuery = (text) => {
      const commonSearchIntents = [
        'who is', 'what is', 'when is', 'how to', 'top 10', 'best way to',
        'latest', 'news about', 'recent', 'define', 'explain', 'summary of',
        'review of', 'compare', 'vs', 'is it true that', 'should i'
      ]
      return commonSearchIntents.some(p => text.toLowerCase().includes(p))
    }

    const getModelAndApiKey = (isImage, fallbackToLlama4 = false, useDolphin = false) => {
      if (isImage || fallbackToLlama4) {
        return {
          model: 'meta-llama/llama-4-maverick:free',
          apiKey: process.env.LLAMA4_API_KEY,
        }
      }
      if (useDolphin) {
        return {
          model: 'cognitivecomputations/dolphin3.0-mistral-24b:free',
          apiKey: process.env.DOLPHIN_API_KEY,
        }
      }
      return {
        model: 'meta-llama/llama-4-scout:free',
        apiKey: process.env.SCOUT_API_KEY,
      }
    }

    const buildUserMessage = () => {
      if (isImage) {
        return [
          { type: 'text', text: message || 'Describe this image.' },
          { type: 'image_url', image_url: { url: imageDataURL } },
        ]
      }
      return message
    }

    const trySendRequest = async ({ model, apiKey }) => {
      const userMessage = buildUserMessage()
      const messages = [...history]

      if (Array.isArray(userMessage)) {
        messages.push({ role: 'user', content: userMessage })
      } else {
        messages.push({ role: 'user', content: userMessage })
      }

      try {
        const response = await fetch(process.env.OPENROUTER_BASE_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Chat With Image',
          },
          body: JSON.stringify({ model, messages }),
        })

        const rawText = await response.text()

        let data
        try {
          data = JSON.parse(rawText)
        } catch (err) {
          return {
            success: false,
            error: `Failed to parse JSON: ${rawText}`,
          }
        }

        if (!response.ok) {
          const errMsg = data.error?.message || 'Unknown model error'
          const isCreditError = errMsg.includes('quota') || errMsg.includes('credits')
          return { success: false, isCreditError, error: errMsg }
        }

        const msg = data.choices?.[0]?.message
        if (msg?.content) {
          return { success: true, reply: msg.content }
        }

        if (msg?.function_call) {
          return {
            success: true,
            reply: `🔧 Function call: ${msg.function_call.name}\n📥 Args:\n${msg.function_call.arguments}`,
          }
        }

        const tool = msg?.tool_calls?.[0]?.function
        if (tool) {
          return {
            success: true,
            reply: `🛠 Tool call: ${tool.name}\n📥 Args:\n${tool.arguments}`,
          }
        }

        return {
          success: false,
          error: `❌ No usable content. Raw:\n\`\`\`json\n${JSON.stringify(msg, null, 2)}\n\`\`\``,
        }

      } catch (error) {
        return {
          success: false,
          error: `❌ Network or server error: ${error.message}`,
        }
      }
    }

    const searchWebAndSummarize = async (query, model, apiKey) => {
      try {
        const searchResponse = await fetch(
          `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&num=5&api_key=${process.env.SERPAPI_KEY}`
        )
        const data = await searchResponse.json()

        const usableResults = (data.organic_results || [])
          .filter(r => r.title && r.snippet)
          .map(r => `- ${r.title.trim()}: ${r.snippet.trim()}`)

        const snippets = usableResults.join('\n')

        if (!snippets || usableResults.length < 2) {
          return '❌ Not enough search data to summarize.'
        }

        const summaryPrompt = `Summarize the following search results for the query "${query}". Provide a clear and concise answer suitable for a general audience:\n\n${snippets}`

        const response = await fetch(process.env.OPENROUTER_BASE_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Web Search Summary',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: 'You are a helpful assistant that summarizes web search results accurately and clearly.' },
              { role: 'user', content: summaryPrompt },
            ]
          }),
        })

        const json = await response.json()
        const reply = json.choices?.[0]?.message?.content

        if (!reply || reply.length < 10) {
          return '❌ Summary was too short or missing.'
        }

        return reply
      } catch (err) {
        console.error('🌐 Web search error:', err)
        return '❌ Web search failed. Please try again.'
      }
    }

    const useDolphin = isTechnical(message)
    const needsWebSearch = isWebSearchQuery(message)

    if (needsWebSearch && !isImage) {
      const { model, apiKey } = getModelAndApiKey(false, true, false)
      const reply = await searchWebAndSummarize(message, model, apiKey)

      // Fallback to model if summary is bad
      if (reply.startsWith('❌')) {
        const result = await trySendRequest({ model, apiKey })
        return NextResponse.json({
          reply: result.success
            ? result.reply
            : `❌ Failed to get answer from model.\n\n${result.error}`,
        })
      }

      return NextResponse.json({
        reply: `**[web]**\n${reply}`,
      })
    }

    const attemptOrder = isImage
      ? [getModelAndApiKey(true)]
      : useDolphin
        ? [
            getModelAndApiKey(false, false, true),
            getModelAndApiKey(false, true, false),
            getModelAndApiKey(false, false, false),
          ]
        : [
            getModelAndApiKey(false, false, false),
            getModelAndApiKey(false, true, false),
            getModelAndApiKey(false, false, true),
          ]

    let finalReply = null
    let lastError = null

    for (const attempt of attemptOrder) {
      const result = await trySendRequest(attempt)
      if (result.success) {
        finalReply = result.reply
        break
      } else {
        lastError = result.error
      }
    }

    return NextResponse.json({
      reply: finalReply || `❌ All model attempts failed.\n\n${lastError}`,
    })

  } catch (error) {
    console.error('🔥 Chat API error:', error)
    return NextResponse.json({
      reply: '❌ Server error. Please try again later.',
    })
  }
}
