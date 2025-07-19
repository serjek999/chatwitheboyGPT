'use client'

import { useEffect, useState } from 'react'
import { ThumbsUp, ThumbsDown, Copy } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import vscDarkPlus from 'react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus'
import VerifiedBadge from '@/components/VerifiedBadge'
import TypewriterEffect from '@/components/TypewriterEffect'

export default function MessageBubble({ msg, index, thumbs, handleThumb, isLast }) {
  const [copied, setCopied] = useState(null)
  const [hasTyped, setHasTyped] = useState(false)

  useEffect(() => {
    if (isLast && msg.role === 'assistant') {
      setHasTyped(true)
    }
  }, [isLast, msg.role])

  if (!msg || !msg.role || !msg.content) return null

  const hasEboyHeader = msg.content.startsWith('**E-boy**')
  const isWebSearchResult = msg.content.startsWith('**[web]**')

  let sanitizedContent = msg.content
  if (hasEboyHeader) sanitizedContent = sanitizedContent.replace('**E-boy**', '')
  if (isWebSearchResult) sanitizedContent = sanitizedContent.replace('**[web]**', '')
  sanitizedContent = sanitizedContent.trim()

  const parseMarkdownToBlocks = (markdown) => {
    const lines = markdown.split('\n')
    const blocks = []
    let current = { type: 'text', content: '' }
    let inCode = false
    let codeLang = ''
    let codeBuffer = []

    for (let line of lines) {
      if (line.startsWith('```')) {
        if (inCode) {
          blocks.push({ type: 'code', lang: codeLang, content: codeBuffer.join('\n') })
          codeBuffer = []
          inCode = false
          codeLang = ''
          current = { type: 'text', content: '' }
        } else {
          inCode = true
          codeLang = line.slice(3).trim()
          if (current.content) blocks.push(current)
          codeBuffer = []
        }
      } else {
        if (inCode) {
          codeBuffer.push(line)
        } else {
          current.content += line + '\n'
        }
      }
    }

    if (current.content.trim()) blocks.push(current)
    return blocks
  }

  const blocks = parseMarkdownToBlocks(sanitizedContent)

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(index)
    setTimeout(() => setCopied(null), 1500)
  }

  const isUser = msg.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
      <div
        className={`relative max-w-[80%] break-words rounded-xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : sanitizedContent.includes('```')
            ? 'bg-zinc-900 text-white rounded-bl-none'
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        }`}
        style={{
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
        }}
      >
        {/* Label for "E-boy" or Web Search */}
        {msg.role === 'assistant' && (
          <div className="mb-2 flex items-center gap-2">
            {hasEboyHeader && (
              <>
                <strong className="text-sm font-semibold">E-boy</strong>
                <VerifiedBadge />
              </>
            )}
            {isWebSearchResult && (
              <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                🌐 Web Search
              </span>
            )}
          </div>
        )}

        {/* Typewriter or Rendered Markdown */}
        {msg.role === 'assistant' && isLast && !hasTyped ? (
          <TypewriterEffect blocks={blocks} speed={8} />
        ) : (
          <div className="prose prose-sm max-w-full dark:prose-invert whitespace-pre-wrap">
            {blocks.map((block, i) =>
              block.type === 'code' ? (
                <div key={i} className="relative my-3 overflow-x-auto rounded-md">
                  <SyntaxHighlighter
                    language={block.lang || ''}
                    style={vscDarkPlus}
                    customStyle={{
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      backgroundColor: '#1e1e1e',
                      fontSize: '0.9rem',
                      margin: 0,
                      maxHeight: '320px',
                    }}
                  >
                    {block.content}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <p key={i} className="my-2 leading-relaxed">
                  {block.content}
                </p>
              )
            )}
          </div>
        )}

        {/* Feedback + Copy Buttons */}
        {msg.role === 'assistant' && (
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
            <button
              onClick={() => handleThumb(index, 'up')}
              className={`hover:text-green-500 ${thumbs[index] === 'up' ? 'text-green-600' : ''}`}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleThumb(index, 'down')}
              className={`hover:text-red-500 ${thumbs[index] === 'down' ? 'text-red-600' : ''}`}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleCopy(sanitizedContent)}
              className="ml-auto flex items-center gap-1 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded"
            >
              {copied === index ? 'Copied!' : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
