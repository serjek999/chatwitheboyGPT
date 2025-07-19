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
        'equation', 'solve', 'calculate', 'formula', 'physics', 'chemistry',
        'biology', 'integral', 'derivative', 'explain why', 'prove', 'program',
        'code', 'algorithm', 'debug', 'function', 'loop', 'array', 'syntax',
        'runtime', 'logic', 'reasoning'
      ]
      return keywords.some(k => text.toLowerCase().includes(k))
    }

    const isWebSearchQuery = (text) => {
      const patterns = [
        'who is', 'what is', 'when is', 'how to', 'top 10', 'best way to',
        'latest', 'news about', 'recent', 'define', 'summary of', 'review of',
        'compare', 'vs', 'is it true that', 'should i'
      ]
      return patterns.some(p => text.toLowerCase().includes(p))
    }

    const getModelAndApiKey = (isImage, useLlama4 = false, useDeepSeek = false) => {
      if (isImage || useLlama4) {
        return {
          model: 'meta-llama/llama-4-maverick:free',
          apiKey: process.env.LLAMA4_API_KEY,
        }
      }
      if (useDeepSeek) {
        return {
          model: 'deepseek/deepseek-r1-0528:free',
          apiKey: process.env.DEEPSEEK_API_KEY,
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
          {
            type: 'text',
            text: message || 'Describe this image in full detail.',
          },
          { type: 'image_url', image_url: { url: imageDataURL } },
        ]
      }

      const lower = message.toLowerCase()
      if (
        lower.startsWith('how to') || lower.startsWith('how do i') ||
        lower.startsWith('how can i') || lower.includes('make') ||
        lower.includes('recipe')
      ) {
        return `Please give a full, step-by-step guide for: ${message}`
      }

      return message
    }

    const trySendRequest = async ({ model, apiKey }) => {
      const userMessage = buildUserMessage()
      const messages = [
        { role: 'system', content: 'Answer with complete, detailed information. No summaries.' },
        ...history
      ]

      messages.push({ role: 'user', content: userMessage })

      try {
        const response = await fetch(process.env.OPENROUTER_BASE_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'AI Assistant',
          },
          body: JSON.stringify({ model, messages }),
        })

        const raw = await response.text()

        let data
        try {
          data = JSON.parse(raw)
        } catch {
          return { success: false, error: `Failed to parse model response: ${raw}` }
        }

        if (!response.ok) {
          const errMsg = data.error?.message || 'Unknown model error'
          const isCreditError = errMsg.includes('quota') || errMsg.includes('credits')
          return { success: false, isCreditError, error: errMsg }
        }

        const msg = data.choices?.[0]?.message

        if (msg?.content) return { success: true, reply: msg.content }
        if (msg?.function_call) {
          return {
            success: true,
            reply: `🔧 Function call: ${msg.function_call.name}\n📥 Args:\n${msg.function_call.arguments}`
          }
        }

        const tool = msg?.tool_calls?.[0]?.function
        if (tool) {
          return {
            success: true,
            reply: `🛠 Tool call: ${tool.name}\n📥 Args:\n${tool.arguments}`
          }
        }

        return {
          success: false,
          error: `❌ Model returned no useful response:\n\`\`\`json\n${JSON.stringify(msg, null, 2)}\n\`\`\``,
        }

      } catch (err) {
        return { success: false, error: `❌ Network/server error: ${err.message}` }
      }
    }

    const searchWebAndSummarize = async (query, model, apiKey) => {
      try {
        const res = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&num=5&api_key=${process.env.SERPAPI_KEY}`)
        const data = await res.json()

        const results = (data.organic_results || [])
          .filter(r => r.title && r.snippet)
          .map(r => `- ${r.title.trim()}: ${r.snippet.trim()}`)

        const snippets = results.join('\n')
        if (results.length < 2) return '❌ Not enough data from web search.'

        const prompt = `Using the following results for "${query}", explain in full:\n\n${snippets}`

        const summaryRes = await fetch(process.env.OPENROUTER_BASE_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Web Search',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: 'Explain in full detail using the search data.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 2048
          }),
        })

        const json = await summaryRes.json()
        const reply = json.choices?.[0]?.message?.content

        return reply?.length > 10 ? reply : '❌ Summary too short.'

      } catch (err) {
        console.error('🌐 Web search error:', err)
        return '❌ Web search failed.'
      }
    }

    const useDeepSeek = isTechnical(message)
    const needsWebSearch = isWebSearchQuery(message)

    if (needsWebSearch && !isImage) {
      const { model, apiKey } = getModelAndApiKey(false, true, false)
      const reply = await searchWebAndSummarize(message, model, apiKey)

      if (reply.startsWith('❌')) {
        const fallback = await trySendRequest({ model, apiKey })
        return NextResponse.json({
          reply: fallback.success
            ? fallback.reply
            : `❌ Fallback model failed:\n${fallback.error}`,
        })
      }

      return NextResponse.json({ reply: `**[web]**\n${reply}` })
    }

    const attemptOrder = isImage
      ? [getModelAndApiKey(true)]
      : useDeepSeek
        ? [
            getModelAndApiKey(false, false, true), // deepseek
            getModelAndApiKey(false, true, false), // llama4 fallback
            getModelAndApiKey(false, false, false), // scout
          ]
        : [
            getModelAndApiKey(false, false, false), // scout
            getModelAndApiKey(false, true, false), // llama4 fallback
            getModelAndApiKey(false, false, true), // deepseek
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
      reply: finalReply || `❌ All models failed. Last error:\n${lastError}`,
    })

  } catch (err) {
    console.error('🔥 Server error:', err)
    return NextResponse.json({
      reply: '❌ Unexpected server error. Please try again later.',
    })
  }
}
