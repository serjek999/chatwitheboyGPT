'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Menu, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ChatSidebar({ selectedId, onSelectChat, chats, setChats }) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const createNewChat = () => {
    const newId = Date.now()
    const newChat = {
      id: newId,
      title: 'New Conversation',
      messages: [
        {
          role: 'assistant',
          content: `**Eboy**\n\nHello! I’m Eboy, how can I help you today?`
        }
      ]
    }
    setChats([newChat, ...chats])
    onSelectChat(newId)
    setOpen(false)
  }

  const deleteChat = (id) => {
    const updated = chats.filter((chat) => chat.id !== id)
    setChats(updated)
    if (selectedId === id) onSelectChat(null)
  }

  const filtered = chats.filter((chat) => {
    const title = chat.messages?.[0]?.content || chat.title
    return title.toLowerCase().includes(search.toLowerCase())
  })

  const handleSwipe = (e, id) => {
    if (e.changedTouches && e.changedTouches[0].clientX < 50) {
      deleteChat(id)
    }
  }

  return (
    <div className="relative">
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="m-2 lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-[300px] p-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5" />
              Chats
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4 flex flex-col gap-4">
            <Button onClick={createNewChat} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>

            <Input
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="space-y-2 mt-2">
                {filtered.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100 touch-pan-x',
                      selectedId === chat.id && 'bg-gray-200'
                    )}
                    onClick={() => {
                      onSelectChat(chat.id)
                      setOpen(false)
                    }}
                    onTouchEnd={(e) => handleSwipe(e, chat.id)}
                  >
                    <span className="truncate w-[85%] text-sm font-medium">
                      {chat.messages?.[0]?.content.slice(0, 30) ||
                        'New Conversation'}
                    </span>
                    <Trash2
                      className="h-4 w-4 text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteChat(chat.id)
                      }}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-[300px] border-r bg-white p-4 gap-4 min-h-[500px]">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <MessageSquare className="w-5 h-5" />
          Chats
        </div>

        <Button onClick={createNewChat} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>

        <Input
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-2 mt-2">
            {filtered.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  'flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100 touch-pan-x',
                  selectedId === chat.id && 'bg-gray-200'
                )}
                onClick={() => onSelectChat(chat.id)}
                onTouchEnd={(e) => handleSwipe(e, chat.id)}
              >
                <span className="truncate w-[85%] text-sm font-medium">
                  {chat.messages?.[0]?.content.slice(0, 30) ||
                    'New Conversation'}
                </span>
                <Trash2
                  className="h-4 w-4 text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteChat(chat.id)
                  }}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
