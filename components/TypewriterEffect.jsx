'use client'

import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function TypewriterEffect({ text, speed = 10 }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)
  const timeoutRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    setDisplayed('')
    indexRef.current = 0

    const typeNext = () => {
      const nextChar = text.charAt(indexRef.current)
      setDisplayed((prev) => prev + nextChar)
      indexRef.current += 1

      if (indexRef.current < text.length) {
        timeoutRef.current = setTimeout(typeNext, speed)
      }
    }

    typeNext() // start typing immediately

    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [text, speed])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [displayed])

  return (
    <div className="whitespace-pre-wrap overflow-hidden">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {displayed}
      </ReactMarkdown>
      <div ref={scrollRef} />
    </div>
  )
}
