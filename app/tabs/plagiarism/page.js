'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function PlagiarismCheckerPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const handlePlagiarismCheck = () => {
    const isPlagiarized = input.includes('Wikipedia') || input.includes('copied')
    setOutput(isPlagiarized ? 'Possible Plagiarism Detected' : 'Text appears original')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Plagiarism Checker</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="aspect-square p-4 flex flex-col">
          <h2 className="font-semibold mb-2">Text to Check</h2>
          <Textarea className="flex-1" value={input} onChange={(e) => setInput(e.target.value)} />
        </Card>
        <Card className="aspect-square p-4 flex flex-col">
          <h2 className="font-semibold mb-2">Result</h2>
          <Textarea className="flex-1" value={output} readOnly />
        </Card>
      </div>
      <div className="mt-4">
        <Button onClick={handlePlagiarismCheck}>Check Plagiarism</Button>
      </div>
    </div>
  )
}
