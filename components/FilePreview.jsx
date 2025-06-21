'use client'

import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export default function FilePreview({ previewURL, onClear }) {
  if (!previewURL) return null

  return (
    <div className="relative flex justify-start mt-2">
      <img src={previewURL} alt="Preview" className="max-h-24 rounded shadow" />
      <Button size="icon" variant="ghost" className="absolute top-0 right-0" onClick={onClear}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}
