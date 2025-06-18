'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Plus, Send, Copy, Square, LayoutGrid, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import TypewriterEffect from '@/components/TypewriterEffect'
import VerifiedBadge from '@/components/VerifiedBadge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import ChatSidebar from '@/components/ChatSidebar'
import Footer from '@/components/Footer'


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
        messages: [
          {
            role: 'assistant',
            content: `**E-boy**\n\nHello! I'm E-boy, how can I help you today?`
          }
        ]
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
      const usage = parseInt(localStorage.getItem('guest_usage_count') || '0', 100)
      if (usage >= 200) {
        alert("You've reached the guest limit. Please log in to continue.")
        return
      }
      localStorage.setItem('guest_usage_count', (usage + 1).toString())
    }

    if (!input.trim() && !file) return

    const isImage = file && file.type?.startsWith('image/')
    const newUserMessage = {
      role: 'user',
      content: input || (isImage ? 'Sent an image.' : 'Sent a file.'),
      fileUrl: isImage ? URL.createObjectURL(file) : null,
      fileName: file?.name || null
    }

    const updatedChats = chats.map(chat => {
      if (chat.id !== currentChatId) return chat
      const isNew = chat.title === 'New Conversation' || !chat.title
      const firstUserMessage = input.trim().slice(0, 30)
      return {
        ...chat,
        messages: [...chat.messages, newUserMessage],
        title: isNew && firstUserMessage ? firstUserMessage : chat.title,
      }
    })

    setChats(updatedChats)
    setInput('')
    setFile(null)
    setPreviewURL(null)
    setLoading(true)

    const currentChat = updatedChats.find(c => c.id === currentChatId)
    const history = currentChat ? currentChat.messages : []

    const formData = new FormData()
    formData.append('message', input)
    formData.append('history', JSON.stringify(history))
    if (file) formData.append('file', file)

    controllerRef.current = new AbortController()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
        signal: controllerRef.current.signal
      })

      const data = await res.json()

      let replyContent = ''
      if (Array.isArray(data.reply)) {
        replyContent = data.reply.map(part =>
          part.type === 'text' ? part.text : ''
        ).join('\n')
      } else {
        replyContent = data.reply || "Sorry, I didn't understand that."
      }

      const modelUsed = file && file.type?.startsWith('image/')
        ? 'LLaMA-4 Maverick (Image + Text)'
        : 'LLaMA-3-70B Instruct (Text only)'
      console.log(`Model used: ${modelUsed}`)

      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, { role: 'assistant', content: replyContent }]
              }
            : chat
        )
      )
    } catch (error) {
      if (error.name === 'AbortError') {
        const reply = '**E-boy**\n\nMessage generation stopped.'
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
    if (controllerRef.current) controllerRef.current.abort()
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile)
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
      messages: [
        {
          role: 'assistant',
          content: `**E-boy**\n\nHello! I'm E-boy, how can I help you today?`
        }
      ]
    }
    setChats([newChat, ...chats])
    setCurrentChatId(newId)
  }

  const currentChat = chats.find(c => c.id === currentChatId)
  const lastAssistantIndex = currentChat?.messages?.map((msg, i) => msg.role === 'assistant' ? i : null).filter(i => i !== null).pop()
  const lastAssistantContent = currentChat?.messages?.[lastAssistantIndex]?.content || ''

  const copyToClipboard = (text) => navigator.clipboard.writeText(text)

  return (
    <div className="min-h-screen bg-background text-foreground p-4 flex gap-4">
      <ChatSidebar
        chats={chats}
        setChats={setChats}
        currentChatId={currentChatId}
        onNewChat={createNewChat}
        onSelectChat={setCurrentChatId}
      />

      <div className="flex-1 space-y-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">E-boy GPT</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-right">
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=User" alt="User" />
              <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={() => router.push('/tabs')}>
              <LayoutGrid className="w-5 h-5" />
            </Button>
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
            const sanitizedContent = msg.content.replace('**E-boy**', '').trim()

            return (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative group w-fit max-w-full break-words p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-white border border-gray-300'}`}>
                  {msg.fileUrl && (
                    <img src={msg.fileUrl} alt={msg.fileName || "Uploaded image"} className="mb-2 rounded-lg max-w-full max-h-64" />
                  )}
                  {msg.fileName && !msg.fileUrl && (
                    <div className="mb-2 text-sm text-gray-500 italic">{msg.fileName}</div>
                  )}
                  {msg.role === 'assistant' && hasEboyHeader && (
                    <div className="mb-1 flex items-center space-x-2">
                      <strong className="font-bold">E-boy</strong>
                      <VerifiedBadge />
                    </div>
                  )}
                  {isLastAssistant && msg.role === 'assistant' ? (
                    <TypewriterEffect text={sanitizedContent} onDone={() => setLoading(false)} />
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: ({ node, ...props }) => {
                          if (!props.src) return null
                          return <img {...props} alt={props.alt || 'Image'} className="max-w-xs rounded shadow" />
                        }
                      }}
                    >
                      {sanitizedContent}
                    </ReactMarkdown>
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

        {previewURL && (
          <div className="relative flex justify-start mt-2">
            <img src={previewURL} alt="Preview" className="max-h-24 rounded shadow" />
            <Button size="icon" variant="ghost" className="absolute top-0 right-0" onClick={() => {
              setPreviewURL(null)
              setFile(null)
            }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="relative flex items-end gap-2 mt-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" className="absolute left-2 bottom-2">
                <Plus className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => fileInputRef.current?.click()}>Upload File</Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => imageInputRef.current?.click()}>Upload Photo</Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => cameraInputRef.current?.click()}>Use Camera</Button>
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
        <Footer />
      </div>
  
    </div>
  )
}
