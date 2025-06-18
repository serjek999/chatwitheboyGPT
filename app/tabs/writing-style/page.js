'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Copy, Loader2, RefreshCcw } from 'lucide-react'
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip'

// Word counter helper
const countWords = (text) => {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export default function WritingStylePage() {
  const [input, setInput] = useState('')
  const [style, setStyle] = useState('friendly')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const wordLimit = 500

  const handleParaphrase = async () => {
    if (!input.trim() || countWords(input) > wordLimit) return
    setLoading(true)
    setResult('')
    setCopied(false)

    try {
      const res = await fetch('/api/paraphrase', {
        method: 'POST',
        body: JSON.stringify({ input, style }),
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await res.json()
      setResult(data.result || 'The system did not return any output. Please try again.')
    } catch (err) {
      setResult('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Writing Style Paraphraser</h1>

      <ToggleGroup
        type="single"
        value={style}
        onValueChange={(val) => val && setStyle(val)}
        className="gap-2 mb-4"
      >
        <ToggleGroupItem value="friendly">Friendly</ToggleGroupItem>
        <ToggleGroupItem value="professional">Professional</ToggleGroupItem>
        <ToggleGroupItem value="concise">Concise</ToggleGroupItem>
      </ToggleGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="p-4 h-[300px]">
          <h2 className="text-lg font-semibold mb-2">Input</h2>
          <Textarea
            className="h-full resize-none"
            placeholder="Write your message..."
            value={input}
            onChange={(e) => {
              const text = e.target.value
              if (countWords(text) <= wordLimit) {
                setInput(text)
              }
            }}
          />
          <p className="text-sm text-muted-foreground mt-2">
            {countWords(input)} / {wordLimit} words
          </p>
        </Card>

        <Card className="p-4 h-[300px] relative">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Result ({style})</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    disabled={!result}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{copied ? 'Copied!' : 'Copy result'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Textarea
            className="h-full resize-none"
            value={loading ? 'Paraphrasing...' : result}
            readOnly
          />
        </Card>
      </div>

      <Button
        onClick={handleParaphrase}
        disabled={!input.trim() || loading || countWords(input) > wordLimit}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <RefreshCcw className="w-4 h-4 mr-2" />
        )}
        Paraphrase
      </Button>
    </div>
  )
}
