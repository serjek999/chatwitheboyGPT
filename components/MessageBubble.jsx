'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import VerifiedBadge from '@/components/VerifiedBadge'
import TypewriterEffect from '@/components/TypewriterEffect'
import { ThumbsUp, ThumbsDown, Copy } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import vscDarkPlus from 'react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus'
import { useState } from 'react'

export default function MessageBubble({ msg, index, thumbs, handleThumb, isLast }) {
  const [copied, setCopied] = useState(null)

  const hasEboyHeader = msg.content.startsWith('**E-boy**')
  const sanitizedContent = msg.content.replace('**E-boy**', '').trim()
  const isCodeReply = sanitizedContent.includes('```')

  const baseStyle = 'relative group w-fit max-w-full break-words text-sm'
  const userStyle = 'bg-blue-100 text-blue-800 p-3 rounded-lg'
  const assistantTextStyle = 'text-gray-800'
  const assistantCardStyle = 'bg-gray-900 text-white p-3 rounded-lg'

  const handleCopy = (code, idx) => {
    navigator.clipboard.writeText(code)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`${baseStyle} ${
          msg.role === 'user'
            ? userStyle
            : isCodeReply
            ? assistantCardStyle
            : assistantTextStyle
        }`}
      >
        {msg.role === 'assistant' && hasEboyHeader && (
          <div className="mb-1 flex items-center space-x-2">
            <strong className="font-bold">E-boy</strong>
            <VerifiedBadge />
          </div>
        )}

        {isLast && msg.role === 'assistant' ? (
          <TypewriterEffect text={sanitizedContent} speed={5} />
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // ✅ Code Block with Syntax Highlight + Copy
              code({ inline, className, children, ...props }) {
                const code = String(children).replace(/\n$/, '')
                const match = /language-(\w+)/.exec(className || '')
                const lang = match?.[1] || ''

                return !inline ? (
                  <div className="relative my-3">
                    <button
                      onClick={() => handleCopy(code, index)}
                      className="absolute top-2 right-2 text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded"
                    >
                      {copied === index ? 'Copied!' : <Copy className="w-4 h-4" />}
                    </button>
                    <SyntaxHighlighter
                      language={lang}
                      style={vscDarkPlus}
                      customStyle={{
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        backgroundColor: '#1e1e1e',
                        fontSize: '0.9rem',
                      }}
                      {...props}
                    >
                      {code}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="bg-gray-200 text-black px-1 py-0.5 rounded">
                    {code}
                  </code>
                )
              },

              // ✅ Links
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:opacity-80"
                  >
                    {children}
                  </a>
                )
              },

              // ✅ Images
              img({ src, alt }) {
                return (
                  <img
                    src={src}
                    alt={alt}
                    className="max-w-full rounded-lg my-2"
                  />
                )
              },

              // ✅ Tables
              table({ children }) {
                return (
                  <div className="overflow-auto my-3 border rounded-md">
                    <table className="min-w-full text-sm border-collapse">
                      {children}
                    </table>
                  </div>
                )
              },
              th({ children }) {
                return (
                  <th className="border px-3 py-2 text-left font-medium bg-gray-100 dark:bg-gray-800 dark:text-white">
                    {children}
                  </th>
                )
              },
              td({ children }) {
                return (
                  <td className="border px-3 py-2 dark:text-white">
                    {children}
                  </td>
                )
              },
            }}
          >
            {sanitizedContent}
          </ReactMarkdown>
        )}

        {msg.role === 'assistant' && (
          <div className="mt-2 flex items-center gap-2 text-gray-500">
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
          </div>
        )}
      </div>
    </div>
  )
}
