'use client'

import { ThumbsUp, ThumbsDown } from 'lucide-react'

export default function MessageFeedback({ index, thumbs, handleThumb }) {
  return (
    <div className="mt-2 flex items-center gap-2 text-gray-500">
      <button onClick={() => handleThumb(index, 'up')} className={`hover:text-green-500 ${thumbs[index] === 'up' ? 'text-green-600' : ''}`}>
        <ThumbsUp className="w-4 h-4" />
      </button>
      <button onClick={() => handleThumb(index, 'down')} className={`hover:text-red-500 ${thumbs[index] === 'down' ? 'text-red-600' : ''}`}>
        <ThumbsDown className="w-4 h-4" />
      </button>
    </div>
  )
}
