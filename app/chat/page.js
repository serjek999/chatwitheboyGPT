'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

import ChatSidebar from '@/components/ChatSidebar'
import ChatHeader from '@/components/ChatHeader'
import ChatInput from '@/components/ChatInput'
import FilePreview from '@/components/FilePreview'
import Footer from '@/components/Footer'

import useChatHandlers from '@/components/useChatHandlers'

const ChatMessages = dynamic(() => import('@/components/ChatMessages'), {
  loading: () => <p className="text-sm text-gray-400">Loading messages...</p>
})

export default function ChatPage() {
  const {
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
    createNewChat
  } = useChatHandlers()

  const currentChat = chats.find(c => c.id === currentChatId)

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex gap-4">
      <ChatSidebar
        chats={chats}
        setChats={setChats}
        currentChatId={currentChatId}
        onNewChat={createNewChat}
        onSelectChat={setCurrentChatId}
      />

      <div className="flex-1 space-y-4 max-w-4xl mx-auto">
        <ChatHeader user={user} onLogout={handleLogout} />

        <Suspense fallback={<p className="text-sm text-gray-400">Loading chat...</p>}>
          <ChatMessages
            messages={currentChat?.messages || []}
            loading={loading}
            thumbs={thumbs}
            handleThumb={handleThumb}
            chatEndRef={chatEndRef}
          />
        </Suspense>

        <FilePreview
          previewURL={previewURL}
          onClear={() => {
            setPreviewURL(null)
            if (file) URL.revokeObjectURL(file)
          }}
        />

        <ChatInput
          input={input}
          setInput={setInput}
          loading={loading}
          handleSend={handleSend}
          handleStop={handleStop}
          fileInputRef={fileInputRef}
          imageInputRef={imageInputRef}
          cameraInputRef={cameraInputRef}
          handleFileChange={handleFileChange}
        />

        <Footer />
      </div>
    </div>
  )
}
