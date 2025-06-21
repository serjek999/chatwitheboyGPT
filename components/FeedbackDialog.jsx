'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function FeedbackDialog({ open, setOpen }) {
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Manila',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })

    try {
      await fetch('https://script.google.com/macros/s/AKfycbyE00Gq1e8Hcz-MFNOvTWzB0_Ou7K2U3pIqRvg8H2xcGB2Xg9a88GNsw1iwhpO06QJPuA/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feedback',
          feedback,
          user: typeof window !== 'undefined' ? localStorage.getItem('user') || 'Guest' : 'Guest',
          timestamp,
        })
      })
      alert('Thank you for your feedback!')
      setFeedback('')
      setOpen(false)
    } catch (err) {
      console.error('Failed to send feedback:', err)
      alert('Error sending feedback.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>We value your feedback!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Label htmlFor="feedback">How was your experience?</Label>

          {/* Emoji quick rating */}
          <div className="flex gap-4">
            <button
              className={`text-2xl transition-opacity ${
                feedback === '😊' ? 'opacity-100' : 'opacity-50'
              }`}
              onClick={() => setFeedback('😊')}
              type="button"
            >
              😊
            </button>
            <button
              className={`text-2xl transition-opacity ${
                feedback === '😞' ? 'opacity-100' : 'opacity-50'
              }`}
              onClick={() => setFeedback('😞')}
              type="button"
            >
              😞
            </button>
          </div>

          {/* Optional detailed message */}
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Let us know how we did."
          />

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Sending...' : 'Submit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
