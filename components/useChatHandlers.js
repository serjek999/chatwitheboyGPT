'use client'

import { useEffect, useRef, useState } from 'react'

export default function useChatHandlers() {
  const [chats, setChats] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [input, setInput] = useState('')
  const [file, setFile] = useState(null)
  const [previewURL, setPreviewURL] = useState(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState({ name: 'Guest', email: 'guest@local' })
  const [thumbs, setThumbs] = useState({})
  const [commandCount, setCommandCount] = useState(0)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)

  const fileInputRef = useRef()
  const imageInputRef = useRef()
  const cameraInputRef = useRef()
  const chatEndRef = useRef()
  const controllerRef = useRef(null)

  // Load user info on mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('auth') === 'true'
    const expiry = parseInt(localStorage.getItem('auth_expiry') || '0', 10)
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
    if (isLoggedIn && Date.now() < expiry) {
      setUser(userInfo)
      fetchChats(userInfo.email)
    } else {
      loadGuestChats()
    }
  }, [])

  // Load guest chats from localStorage
  const loadGuestChats = () => {
    const savedChats = JSON.parse(localStorage.getItem('chats_guest')) || []
    if (savedChats.length > 0) {
      setChats(savedChats)
      setCurrentChatId(savedChats[0].id)
    } else {
      const initialChat = createDefaultChat()
      setChats([initialChat])
      setCurrentChatId(initialChat.id)
    }
  }

  // Load chats from PHP backend
  const fetchChats = async (email) => {
    try {
      const res = await fetch(`http://localhost/chat/get_chats.php?email=${email}`)
      const data = await res.json()
      const chatList = data.chats || []

      if (chatList.length === 0) {
        const initialChat = createDefaultChat()
        setChats([initialChat])
        setCurrentChatId(initialChat.id)
      } else {
        setChats(chatList)
        setCurrentChatId(chatList[0].id)
      }
    } catch (err) {
      console.error('Failed to load chats:', err)
      loadGuestChats()
    }
  }

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, loading])

  // Save guest chats to localStorage
  useEffect(() => {
    if (user.email === 'guest@local') {
      localStorage.setItem('chats_guest', JSON.stringify(chats))
    }
  }, [chats, user.email])

  const incrementCommandCount = () => {
    setCommandCount(prev => {
      const next = prev + 1
      const feedbackGiven = sessionStorage.getItem('feedback_given') === 'true'
      if (next >= 5 && !feedbackGiven) {
        setShowFeedbackDialog(true)
        sessionStorage.setItem('feedback_given', 'true')
        return 0
      }
      return next
    })
  }

  const createDefaultChat = () => ({
    id: Date.now(),
    title: 'New Conversation',
    messages: [{ role: 'assistant', content: `**E-boy**\n\nHello! I'm E-boy, how can I help you today?` }]
  })

  const createNewChat = () => {
    const newId = Date.now()
    const newChat = createDefaultChat()
    newChat.id = newId
    setChats([newChat, ...chats])
    setCurrentChatId(newId)
    incrementCommandCount()
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
    setUser({ name: 'Guest', email: 'guest@local' })
    loadGuestChats()
  }

  const handleSend = async () => {
    const isLoggedIn = localStorage.getItem('auth') === 'true'

    if (!input.trim() && !file) return

    if (!isLoggedIn) {
      const usage = parseInt(localStorage.getItem('guest_usage_count') || '0', 1000)
      if (usage >= 10) {
        alert("You've reached the guest limit. Please log in to continue.")
        return
      }
      localStorage.setItem('guest_usage_count', (usage + 1).toString())
    }

    const isImage = file?.type?.startsWith('image/')
    const shouldDescribe = !!file && !input.trim()
    const userMessage = shouldDescribe
      ? isImage ? 'Describe this image.' : 'Describe this file.'
      : input

    const newUserMessage = {
      role: 'user',
      content: previewURL ? `![Uploaded Image](${previewURL})` : userMessage
    }

    const updatedChats = chats.map(chat => {
      if (chat.id !== currentChatId) return chat
      const isNew = chat.title === 'New Conversation' || !chat.title
      const firstUserMessage = userMessage.slice(0, 30)
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
    formData.append('message', userMessage)
    formData.append('history', JSON.stringify(history))
    if (file) formData.append('file', file)

    controllerRef.current = new AbortController()

    let reply = ''
    try {
      if (userMessage.toLowerCase().includes('developer')) {
        reply = '**E-boy**\n\nFrancis Jake Roaya from PHINMA Cagayan de Oro College.'
      } else {
        const res = await fetch('/api/chat', {
          method: 'POST',
          body: formData,
          signal: controllerRef.current.signal
        })
        const data = await res.json()
        reply = data.reply || "Sorry, I didn't understand that."
      }

      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, { role: 'assistant', content: reply }] }
            : chat
        )
      )

      // ✅ Save to backend MySQL if logged in
      if (user.email !== 'guest@local') {
        fetch('http://localhost/chat/save_chat.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, chat: currentChat })
        }).catch(err => console.warn('Failed to save chat:', err))
      }
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
      incrementCommandCount()
    }
  }

  const handleStop = () => {
    if (controllerRef.current) {
      controllerRef.current.abort()
    }
    incrementCommandCount()
  }

  const handleThumb = (msgIndex, type) => {
    setThumbs(prev => {
      if (prev[msgIndex] === type) return { ...prev, [msgIndex]: null }
      saveFeedbackToGoogleSheet(msgIndex, type)
      return { ...prev, [msgIndex]: type }
    })
  }

  const saveFeedbackToGoogleSheet = async (msgIndex, type) => {
    const currentChat = chats.find(c => c.id === currentChatId)
    const message = currentChat?.messages?.[msgIndex]?.content || ''
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
    const rating = type === 'up' ? '👍' : '👎'

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'rating',
          message,
          rating,
          timestamp,
          user: user?.email || 'Guest'
        })
      })

      const data = await res.json()
      if (data.status !== 'success') {
        throw new Error('Feedback failed')
      }
    } catch (error) {
      console.warn('Feedback error:', error)
    }
  }

  return {
    chats,
    setChats,
    currentChatId,
    setCurrentChatId,
    input,
    setInput,
    file,
    previewURL,
    setPreviewURL,
    loading,
    user,
    thumbs,
    fileInputRef,
    imageInputRef,
    cameraInputRef,
    chatEndRef,
    handleSend,
    handleStop,
    handleThumb,
    handleLogout,
    handleFileChange,
    createNewChat,
    showFeedbackDialog,
    setShowFeedbackDialog,
  }
}
