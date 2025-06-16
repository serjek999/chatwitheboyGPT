'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'

const tools = [
  {
    name: 'Grammar Checker',
    short: 'GC',
    description: 'Fix grammar and punctuation errors.',
    slug: 'grammar-checker'
  },
  {
    name: 'Summarize',
    short: 'SM',
    description: 'Get short summaries of long texts.',
    slug: 'summarize'
  },
  {
    name: 'AI Detection',
    short: 'AD',
    description: 'Detect AI-generated content.',
    slug: 'ai-detection'
  },
  {
    name: 'Paraphrasing Tool',
    short: 'PT',
    description: 'Rewrite text in different words.',
    slug: 'paraphrasing-tool'
  },
  {
    name: 'Plagiarism Checker',
    short: 'PC',
    description: 'Check for copied content.',
    slug: 'plagiarism-checker'
  },
  {
    name: 'Writing Style',
    short: 'WS',
    description: 'Analyze and improve your style.',
    slug: 'writing-style'
  }
]

export default function TabsPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Writing Assistant Tools</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tools.map((tool, index) => (
          <Link key={index} href={`/tabs/${tool.slug}`}>
            <Card className="aspect-square p-4 flex flex-col items-center justify-center text-center shadow hover:bg-gray-100 transition cursor-pointer">
              <div className="w-12 h-12 rounded-md bg-blue-200 text-blue-800 font-bold flex items-center justify-center mb-3">
                {tool.short}
              </div>
              <div className="font-semibold text-sm mb-1">{tool.name}</div>
              <p className="text-xs text-gray-500">{tool.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
