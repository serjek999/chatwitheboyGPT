'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Plus, Send, Square } from 'lucide-react'

export default function ChatInput({
  input, setInput, loading, handleSend, handleStop,
  fileInputRef, imageInputRef, cameraInputRef, handleFileChange
}) {
  return (
    <div className="relative flex items-end gap-2 mt-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon" variant="ghost" className="absolute left-2 bottom-2">
            <Plus className="w-5 h-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 space-y-2">
          <Button variant="ghost" className="w-full justify-start" onClick={() => fileInputRef.current?.click()}>
            Upload File
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => imageInputRef.current?.click()}>
            Upload Photo
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => cameraInputRef.current?.click()}>
            Use Camera
          </Button>
        </PopoverContent>
      </Popover>

      <Textarea
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
          }
        }}
        className="resize-none pl-10"
      />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" onClick={loading ? handleStop : handleSend} className="absolute right-2 bottom-2">
              {loading ? <Square className="w-4 h-4 text-red-500" /> : <Send className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{loading ? 'Stop Generation' : 'Send Message'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <input type="file" hidden ref={fileInputRef} accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
      <input type="file" hidden ref={imageInputRef} accept="image/*" onChange={handleFileChange} />
      <input type="file" hidden ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleFileChange} />
    </div>
  )
}
