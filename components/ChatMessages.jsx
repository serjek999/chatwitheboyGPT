'use client'

import MessageBubble from './MessageBubble'
import { Skeleton } from '@/components/ui/skeleton'

export default function ChatMessages({ messages, loading, thumbs, handleThumb, chatEndRef }) {
  return (
    <div className="p-4 h-[60vh] overflow-y-auto space-y-4 bg-white border rounded">
      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          msg={msg}
          index={i}
          thumbs={thumbs}
          handleThumb={handleThumb}
          isLast={i === messages.length - 1}
        />
      ))}
      {loading && (
        <div className="flex justify-start">
          <div className="space-y-2 bg-gray-100 p-3 rounded-lg max-w-[80%]">
            <Skeleton className="h-5 w-[80px]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  )
}
