'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import VerifiedBadge from '@/components/VerifiedBadge'
import TypewriterEffect from '@/components/TypewriterEffect'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

export default function MessageBubble({ msg, index, thumbs, handleThumb, isLast }) {
  const hasEboyHeader = msg.content.startsWith('**E-boy**')
  const sanitizedContent = msg.content.replace('**E-boy**', '').trim()

  return (
    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`relative group w-fit max-w-full break-words p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-white border'}`}>
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
              img({ node, ...props }) {
                if (!props.src) return null
                return <img {...props} alt={props.alt || ''} />
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
