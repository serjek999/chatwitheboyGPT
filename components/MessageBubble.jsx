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


  // ⛏️ Markdown block parser
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
  const baseStyle = 'relative group w-fit break-words text-sm max-w-full'
  const userStyle = 'bg-blue-100 text-blue-800 p-3 rounded-lg'
  const assistantTextStyle = 'text-gray-800'
  const assistantCardStyle = 'bg-gray-900 text-white p-3 rounded-lg'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`${baseStyle} ${
          isUser
            ? userStyle
            : sanitizedContent.includes('```')
            ? assistantCardStyle
            : assistantTextStyle
        }`}
        style={{
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          maxWidth: '80%',
          overflowX: 'auto',
        }}
      >
        {/* ✅ E-boy label */}
        {msg.role === 'assistant' && (
  <div className="mb-1 flex items-center space-x-2">
    {hasEboyHeader && (
      <>
        <strong className="font-bold">E-boy</strong>
        <VerifiedBadge />
      </>
    )}
    {isWebSearchResult && (
      <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
        🌐 Web Search
      </span>
    )}
  </div>
)}


        {/* ✅ Typing effect only once on the latest assistant message */}
        {msg.role === 'assistant' && isLast && !hasTyped ? (
          <TypewriterEffect blocks={blocks} speed={8} />
        ) : (
          <div className="prose prose-sm max-w-full dark:prose-invert whitespace-pre-wrap">
            {blocks.map((block, i) =>
              block.type === 'code' ? (
                <div key={i} className="relative my-3 overflow-x-auto max-w-full rounded">
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
                      overflowX: 'auto',
                    }}
                  >
                    {block.content}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <p key={i}>{block.content}</p>
              )
            )}
          </div>
        )}

        {/* ✅ Feedback and copy icons */}
        {msg.role === 'assistant' && (
          <div className="mt-2 flex items-center gap-3 text-gray-500">
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
              className="ml-auto text-xs hover:text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded"
            >
              {copied === index ? 'Copied!' : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
