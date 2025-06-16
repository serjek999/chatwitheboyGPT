'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Menu, Trash2 } from 'lucide-react'

export default function ChatSidebar({
  chats = [],
  setChats = () => {},
  currentChatId,
  onSelectChat = () => {},
  onNewChat = () => {},
}) {
  const [open, setOpen] = useState(false)

  const handleNewChat = () => {
    const newId = Date.now()
    const newChat = {
      id: newId,
      title: 'New Conversation',
      messages: [
        {
          role: 'assistant',
          content: `**E-boy**\n\nHello! I’m E-boy, how can I help you today?`,
        },
      ],
    }
    setChats([newChat, ...chats])
    onSelectChat(newId)
    setOpen(false)
  }

  const handleDeleteChat = (chatId) => {
    const confirmDelete = window.confirm('Delete this conversation?')
    if (!confirmDelete) return
    const updatedChats = chats.filter((c) => c.id !== chatId)
    setChats(updatedChats)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="w-6 h-6 text-black" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-4">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">Conversations</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <Button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>

          <ScrollArea className="h-[calc(100vh-200px)] pr-2">
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-center justify-between gap-2 group"
                >
                  <Button
                    variant={chat.id === currentChatId ? 'secondary' : 'ghost'}
                    className="flex-1 justify-start text-left truncate"
                    onClick={() => {
                      onSelectChat(chat.id)
                      setOpen(false)
                    }}
                  >
                    {chat.title || `Chat ${chat.id}`}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="invisible group-hover:visible text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteChat(chat.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
