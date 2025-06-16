'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function ParaphrasingPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const handleParaphrase = () => {
    const paraphrased = input.replace(/very/g, 'extremely').replace(/good/g, 'excellent')
    setOutput(paraphrased || 'No input provided.')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Paraphrasing Tool</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="aspect-square p-4 flex flex-col">
          <h2 className="font-semibold mb-2">Original</h2>
          <Textarea className="flex-1" value={input} onChange={(e) => setInput(e.target.value)} />
        </Card>
        <Card className="aspect-square p-4 flex flex-col">
          <h2 className="font-semibold mb-2">Paraphrased</h2>
          <Textarea className="flex-1" value={output} readOnly />
        </Card>
      </div>
      <div className="mt-4">
        <Button onClick={handleParaphrase}>Paraphrase</Button>
      </div>
    </div>
  )
}
