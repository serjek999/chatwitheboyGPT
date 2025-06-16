'use client'

import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'

export default function SummarizePage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [mode, setMode] = useState('paragraph')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!input.trim()) {
      setResult('')
      return
    }

    if (mode === 'paragraph') {
      setResult(`Summarized (Paragraph): ${input.slice(0, 100)}...`)
    } else if (mode === 'bullets') {
      const bullets = input
        .split('.')
        .filter(Boolean)
        .map(s => `• ${s.trim()}`)
        .join('\n')
      setResult(`Summarized (Bullet Points):\n${bullets}`)
    }
  }, [input, mode])

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Summarize Tool</h1>

      <div className="mb-6">
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(val) => val && setMode(val)}
        >
          <ToggleGroupItem value="paragraph">Paragraph</ToggleGroupItem>
          <ToggleGroupItem value="bullets">Bullet Points</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="p-4 h-[300px]">
          <h2 className="text-lg font-semibold mb-2">Input</h2>
          <Textarea
            placeholder="Enter text to summarize..."
            className="h-full resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </Card>

        <Card className="p-4 h-[300px] relative">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Result</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {copied ? 'Copied!' : 'Copy to clipboard'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Textarea
            className="h-full resize-none"
            value={result}
            readOnly
          />
        </Card>
      </div>
    </div>
  )
}
