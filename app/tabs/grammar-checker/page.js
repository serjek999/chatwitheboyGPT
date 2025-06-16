'use client'

import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'

export default function GrammarPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCheckGrammar = () => {
    if (!input.trim()) return
    // Simulated result — replace with your API call
    setResult(`Corrected: ${input.replace(/(\bi\b)/g, 'I')}`)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Grammar Checker</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="p-4 h-[300px]">
          <h2 className="text-lg font-semibold mb-2">Input</h2>
          <Textarea
            placeholder="Enter text with grammar issues..."
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

      <Button onClick={handleCheckGrammar}>Grammar Check</Button>
    </div>
  )
}
