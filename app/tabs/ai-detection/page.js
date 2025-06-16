'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Copy } from 'lucide-react'

export default function AIDetectionPage() {
  const [input, setInput] = useState('')
  const [scores, setScores] = useState(null)
  const [paraphrased, setParaphrased] = useState('')
  const [copied, setCopied] = useState(false)

  const detectAI = () => {
    if (!input.trim()) return

    // Simulate AI detection percentages
    const aiGenerated = Math.floor(Math.random() * 30 + 40)
    const aiRefined = Math.floor(Math.random() * 20)
    const humanRefined = Math.floor(Math.random() * 10)
    const total = aiGenerated + aiRefined + humanRefined
    const humanWritten = Math.max(0, 100 - total)

    setScores({
      'AI-generated': aiGenerated,
      'AI-generated & AI-refined': aiRefined,
      'Human-written & AI-refined': humanRefined,
      'Human-written': humanWritten,
    })

    // Simulate paraphrasing
    const rephrased = input
      .replace(/\bimportant\b/gi, 'crucial')
      .replace(/\buse\b/gi, 'utilize')
      .replace(/\bget\b/gi, 'obtain')
      .replace(/\bmake\b/gi, 'create')
      .replace(/\bthink\b/gi, 'consider')
      .replace(/\bhelp\b/gi, 'assist')
      .replace(/\bstart\b/gi, 'commence')
      .replace(/\bend\b/gi, 'conclude')

    setParaphrased(rephrased || input)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(paraphrased)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">AI Detection</h1>

      {/* Score Card */}
      {scores && (
        <Card className="p-4">
          <h2 className="text-lg font-medium mb-2">Detection Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(scores).map(([label, percent]) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{label}</span>
                  <span>{percent}%</span>
                </div>
                <Progress value={percent} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Input & Result Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Card */}
        <Card className="p-4 flex flex-col">
          <Textarea
            placeholder="Paste your content here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-[250px] mb-4 resize-none"
          />
          <Button onClick={detectAI}>Check AI</Button>
        </Card>

        {/* Result Card */}
        <Card className="p-4 relative flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Rephrased Result</span>
            {paraphrased && (
              <button onClick={handleCopy} className="text-xs text-blue-500 flex items-center gap-1">
                <Copy className="w-4 h-4" />
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          <Textarea
            readOnly
            className="h-[250px] resize-none"
            value={paraphrased}
          />
        </Card>
      </div>
    </div>
  )
}
