'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Plus, Send, Menu, Copy, Square } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import TypewriterEffect from '@/components/TypewriterEffect'
import VerifiedBadge from '@/components/VerifiedBadge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function ChatPage() {
  const router = useRouter()
  const [chats, setChats] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [input, setInput] = useState('')
  const [file, setFile] = useState(null)
  const [previewURL, setPreviewURL] = useState(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState({ name: 'Guest', email: 'Guest mode' })
  const fileInputRef = useRef()
  const imageInputRef = useRef()
  const cameraInputRef = useRef()
  const chatEndRef = useRef()
  const controllerRef = useRef(null)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('auth') === 'true'
    const expiry = parseInt(localStorage.getItem('auth_expiry') || '0', 10)
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
    if (isLoggedIn && Date.now() < expiry) setUser(userInfo)
  }, [])

  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem('chats')) || []
    if (savedChats.length > 0) {
      setChats(savedChats)
      setCurrentChatId(savedChats[0].id)
    } else {
      const initialChat = {
        id: Date.now(),
        title: 'New Conversation',
        messages: [{ role: 'assistant', content: `**E-boy**\n\nHello! I’m E-boy, how can I help you today?` }]
      }
      setChats([initialChat])
      setCurrentChatId(initialChat.id)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats))
  }, [chats])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, loading])

  const handleSend = async () => {
    const isLoggedIn = localStorage.getItem('auth') === 'true'
    if (!isLoggedIn) {
      const usage = parseInt(localStorage.getItem('guest_usage_count') || '0', 10)
      if (usage >= 50) {
        alert('You’ve reached the guest limit. Please log in to continue.')
        return
      }
      localStorage.setItem('guest_usage_count', (usage + 1).toString())
    }

    if (!input.trim() && !file) return

    const newUserMessage = {
      role: 'user',
      content: previewURL ? `![Uploaded Image](${previewURL})` : input
    }

    const updatedChats = chats.map(chat =>
      chat.id === currentChatId
        ? {
            ...chat,
            messages: [...chat.messages, newUserMessage],
            title: chat.messages.length === 0 ? input.slice(0, 30) || 'New Conversation' : chat.title
          }
        : chat
    )
    setChats(updatedChats)
    setInput('')
    setFile(null)
    setPreviewURL(null)
    setLoading(true)

    const formData = new FormData()
    formData.append('message', input)
    if (file) formData.append('file', file)

    controllerRef.current = new AbortController()

    let reply = ''
    try {
      if (input.toLowerCase().includes('developer')) {
        reply = '**E-boy**\n\nFrancis Jake Roaya from PHINMA Cagayan de Oro College.'
      } else {
        const res = await fetch('/api/chat', {
          method: 'POST',
          body: formData,
          signal: controllerRef.current.signal
        })
        const data = await res.json()
        reply = data.reply || 'Sorry, I didn’t understand that.'
      }

      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, { role: 'assistant', content: reply }] }
            : chat
        )
      )
    } catch (error) {
      if (error.name === 'AbortError') {
        reply = '**E-boy**\n\nMessage generation stopped.'
        setChats(prevChats =>
          prevChats.map(chat =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages, { role: 'assistant', content: reply }] }
              : chat
          )
        )
      } else {
        console.error('Error:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStop = () => {
    if (controllerRef.current) {
      controllerRef.current.abort()
    }
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      if (selected.type.startsWith('image/')) {
        const url = URL.createObjectURL(selected)
        setPreviewURL(url)
      } else {
        setPreviewURL(null)
      }
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    setUser({ name: 'Guest', email: 'Guest mode' })
  }

  const createNewChat = () => {
    const newId = Date.now()
    const newChat = {
      id: newId,
      title: 'New Conversation',
      messages: [{ role: 'assistant', content: `**E-boy**\n\nHello! I’m E-boy, how can I help you today?` }]
    }
    setChats([newChat, ...chats])
    setCurrentChatId(newId)
  }

  const currentChat = chats.find(c => c.id === currentChatId)
  const lastAssistantIndex = currentChat?.messages?.map((msg, i) => msg.role === 'assistant' ? i : null).filter(i => i !== null).pop()
  const lastAssistantContent = currentChat?.messages?.[lastAssistantIndex]?.content || ''

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-4 space-y-4">
                <Button className="w-full" onClick={createNewChat}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Chat
                </Button>
                <div className="border rounded p-2 h-[70vh] overflow-y-auto space-y-2">
                  {chats.map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => setCurrentChatId(chat.id)}
                      className={`cursor-pointer p-2 rounded hover:bg-gray-200 ${chat.id === currentChatId ? 'bg-gray-300' : ''}`}
                    >
                      <span className="truncate w-full text-sm font-medium">
                        {chat.title}
                      </span>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-2xl font-bold">E-boy GPT</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-right">
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=User" alt="User" />
              <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            {user.name === 'Guest' ? (
              <Button variant="outline" onClick={() => router.push('/login')}>Login</Button>
            ) : (
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            )}
          </div>
        </div>

        <Card className="p-4 h-[60vh] overflow-y-auto space-y-4">
          {currentChat?.messages.map((msg, i) => {
            const isLastAssistant = i === lastAssistantIndex
            const hasEboyHeader = msg.content.startsWith('**E-boy**')
            const contentWithoutHeader = msg.content.replace('**E-boy**', '').trim()

            return (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative group w-fit max-w-full break-words p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-white border border-gray-300'}`}>
                  {msg.role === 'assistant' && hasEboyHeader && (
                    <div className="mb-1 flex items-center space-x-2">
                      <strong className="font-bold">E-boy</strong>
                      <VerifiedBadge />
                    </div>
                  )}

                  {isLastAssistant && msg.role === 'assistant' ? (
                    <TypewriterEffect text={contentWithoutHeader} onDone={() => setLoading(false)} />
                  ) : (
                    <ReactMarkdown>{contentWithoutHeader}</ReactMarkdown>
                  )}

                  {msg.role === 'assistant' && (
                    <button
                      className="absolute top-1 right-1 hidden group-hover:block text-gray-400 hover:text-black"
                      onClick={() => copyToClipboard(msg.content)}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {loading && (
            <div className="flex justify-start">
              <div className="space-y-2 bg-gray-100 p-3 rounded-lg max-w-[80%]">
                <Skeleton className="h-5 w-[80px]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </Card>

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
                <Button
                  size="icon"
                  onClick={loading ? handleStop : handleSend}
                  className="absolute right-2 bottom-2"
                >
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
      </div>
    </div>
  )
}
