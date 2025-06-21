'use client'

import { useState, useRef } from 'react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Menu, Trash2 } from 'lucide-react'

export default function ChatSidebar({
  chats = [],
  setChats = () => {},
  currentChatId,
  onSelectChat = () => {},
  onNewChat = () => {},
  user = {}, // ✅ added user for email
}) {
  const [open, setOpen] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

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

  const handleDeleteChat = async (chatId) => {
    try {
      const res = await fetch('http://localhost/chat/delete_chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || 'Guest',
          chat_id: chatId,
        }),
      })

      const data = await res.json()

      if (data.status === 'success') {
        const updatedChats = chats.filter((c) => c.id !== chatId)
        setChats(updatedChats)

        // Reset current chat if deleted
        if (chatId === currentChatId) {
          const next = updatedChats.length > 0 ? updatedChats[0].id : null
          onSelectChat(next)
        }
      } else {
        console.warn('Delete failed:', data.error || data.message)
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX
  }

  const handleTouchEnd = (chatId) => (e) => {
    touchEndX.current = e.changedTouches[0].screenX
    if (touchStartX.current - touchEndX.current > 50) {
      setSelectedChatId(chatId)
      document.getElementById(`delete-dialog-${chatId}`)?.click()
    }
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
                  className="flex items-center justify-between gap-2 px-1"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd(chat.id)}
                >
                  <Button
                    variant={chat.id === currentChatId ? 'secondary' : 'ghost'}
                    className="max-w-[200px] truncate justify-start text-left"
                    onClick={() => {
                      onSelectChat(chat.id)
                      setOpen(false)
                    }}
                  >
                    {chat.title || `Chat ${chat.id}`}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        id={`delete-dialog-${chat.id}`}
                        aria-label="Delete chat"
                        onClick={() => setSelectedChatId(chat.id)}
                        className="shrink-0 hover:bg-transparent"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-500" />
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete this conversation?
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteChat(selectedChatId)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
