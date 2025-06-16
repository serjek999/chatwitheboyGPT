'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Copy } from 'lucide-react'
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip'

export default function WritingStylePage() {
  const [input, setInput] = useState('')
  const [style, setStyle] = useState('friendly')
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)

  const styles = {
    friendly: (text) => `Hey there! 😊 ${text} Hope that helps!`,
    professional: (text) => `Dear Sir/Madam,\n\n${text}\n\nSincerely,\nYour Assistant`,
    concise: (text) => text.split('.').slice(0, 1).join('.') + '.'
  }

  useEffect(() => {
    if (!input.trim()) {
      setResult('')
      return
    }
    setResult(styles[style](input))
  }, [input, style])

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Writing Style</h1>

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
            onChange={(e) => setInput(e.target.value)}
          />
        </Card>

        <Card className="p-4 h-[300px] relative">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Result ({style})</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{copied ? 'Copied!' : 'Copy result'}</TooltipContent>
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
