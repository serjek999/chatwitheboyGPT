'use client'

import MessageBubble from './MessageBubble'
import { Skeleton } from '@/components/ui/skeleton'

export default function ChatMessages({ messages, loading, thumbs, handleThumb, chatEndRef }) {
  return (
    <div className="p-4 h-[60vh] overflow-y-auto space-y-4 bg-white border rounded">
      {messages
        ?.filter((msg) => msg && typeof msg === 'object' && msg.content)
        .map((msg, i) => (
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
          <div className="flex flex-col space-y-1">
            <Skeleton className="h-3 w-[100px] rounded-full bg-gray-300" />
            <Skeleton className="h-3 w-[80px] rounded-full bg-gray-300" />
            <Skeleton className="h-3 w-[50px] rounded-full bg-gray-300" />
          </div>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>
  )
}
