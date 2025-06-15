'use client'

import { useEffect, useState } from 'react'

export default function TypewriterEffect({ text, speed = 25 }) {
  const [displayed, setDisplayed] = useState('')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setDisplayed('')
    setIndex(0)
  }, [text]) // Reset when text changes

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayed((prev) => prev + text.charAt(index))
        setIndex((prev) => prev + 1)
      }, text.charAt(index) === ' ' ? 10 : speed)
      return () => clearTimeout(timeout)
    }
  }, [index, text, speed])

  return (
    <div className="whitespace-pre-wrap font-mono">
      {displayed}
      <span className="animate-pulse">▋</span> {/* blinking cursor */}
    </div>
  )
}
