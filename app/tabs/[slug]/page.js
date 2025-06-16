'use client'

import { useParams } from 'next/navigation'

export default function ToolPage() {
  const { slug } = useParams()

  const titles = {
    'grammar-checker': 'Grammar Checker',
    'summarize': 'Summarize',
    'ai-detection': 'AI Detection',
    'paraphrasing-tool': 'Paraphrasing Tool',
    'plagiarism-checker': 'Plagiarism Checker',
    'writing-style': 'Writing Style'
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{titles[slug] || 'Tool'}</h1>
      <p className="text-gray-500">This is the page for <strong>{titles[slug] || slug}</strong>.</p>
    </div>
  )
}
