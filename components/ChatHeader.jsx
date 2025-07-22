'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LayoutGrid } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ChatHeader({ user, onLogout }) {
  const router = useRouter()

  return (
    <div className="flex justify-between items-center sticky-mobile-header">
      <h1 className="text-2xl font-bold">E-boy GPT</h1>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-right">
          <p className="font-semibold">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <Avatar>
          <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=User" />
          <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon" className="text-black" onClick={() => router.push('/tabs')}>
          <LayoutGrid className="w-5 h-5" />
        </Button>
        {user.name === 'Guest' ? (
          <Button variant="outline" onClick={() => router.push('/login')}>Login</Button>
        ) : (
          <Button variant="outline" onClick={onLogout}>Logout</Button>
        )}
      </div>
    </div>
  )
}
