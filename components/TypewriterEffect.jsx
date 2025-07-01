'use client'

import { useEffect, useState, useRef } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import vscDarkPlus from 'react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus'

export default function TypewriterEffect({ blocks, speed = 10 }) {
  const [displayedBlocks, setDisplayedBlocks] = useState([])
  const blockIndexRef = useRef(0)
  const charIndexRef = useRef(0)
  const currentTextRef = useRef('')
  const timeoutRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!Array.isArray(blocks) || blocks.length === 0) return

    setDisplayedBlocks([])
    blockIndexRef.current = 0
    charIndexRef.current = 0
    currentTextRef.current = ''

    const firstBlock = blocks[0]
    if (!firstBlock || !firstBlock.type) return

    const initial = firstBlock.type === 'text'
      ? { ...firstBlock, content: '' }
      : firstBlock

    setDisplayedBlocks([initial])

    const typeNext = () => {
      const block = blocks[blockIndexRef.current]
      if (!block || !block.type) return

      if (block.type === 'text') {
        const nextChar = block.content.charAt(charIndexRef.current)
        currentTextRef.current += nextChar
        charIndexRef.current++

        const updatedBlocks = [...displayedBlocks]
        updatedBlocks[blockIndexRef.current] = {
          ...block,
          content: currentTextRef.current,
        }
        setDisplayedBlocks(updatedBlocks)

        if (charIndexRef.current < block.content.length) {
          timeoutRef.current = setTimeout(typeNext, speed)
        } else {
          blockIndexRef.current++
          charIndexRef.current = 0
          currentTextRef.current = ''

          const nextBlock = blocks[blockIndexRef.current]
          if (nextBlock) {
            const formattedNext =
              nextBlock.type === 'text'
                ? { ...nextBlock, content: '' }
                : nextBlock

            setDisplayedBlocks((prev) => [...prev, formattedNext])
            timeoutRef.current = setTimeout(typeNext, speed)
          }
        }
      } else if (block.type === 'code') {
        // Add the code block fully
        setDisplayedBlocks((prev) => [...prev, block])
        blockIndexRef.current++
        timeoutRef.current = setTimeout(typeNext, 300)
      }
    }

    timeoutRef.current = setTimeout(typeNext, speed)

    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [blocks, speed])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [displayedBlocks])

  return (
    <div className="prose prose-sm max-w-full dark:prose-invert whitespace-pre-wrap">
      {displayedBlocks.map((block, i) => {
        if (!block || !block.type) return null

        if (block.type === 'text') {
          return <p key={i}>{block.content}</p>
        }

        if (block.type === 'code') {
          return (
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
          )
        }

        return null
      })}
      <div ref={scrollRef} />
    </div>
  )
}
