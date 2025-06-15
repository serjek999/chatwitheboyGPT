'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', robot: false })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleLogin = async () => {
    if (!form.robot) {
      return setError('Please verify you are not a robot.')
    }

    try {
      const res = await fetch('http://localhost/chat/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })

      const data = await res.json()

      if (data.success) {
        const expiryTime = Date.now() + 1000 * 60 * 60 // 1 hour
        localStorage.setItem('auth', 'true')
        localStorage.setItem('auth_expiry', expiryTime.toString())
        localStorage.setItem('user', JSON.stringify({ name: 'User', email: form.email }))

        setSuccess(true)

        setTimeout(() => {
          router.push('/chat')
        }, 300)
      } else {
        setError(data.message || 'Invalid credentials.')
      }
    } catch (err) {
      console.error(err)
      setError('Server error. Please try again later.')
    }
  }

  useEffect(() => {
    try {
      const isLoggedIn = localStorage.getItem('auth') === 'true'
      const expiry = parseInt(localStorage.getItem('auth_expiry') || '0', 10)
      if (isLoggedIn && Date.now() < expiry) {
        router.replace('/chat')
      }
    } catch (e) {
      console.error('Session check error:', e)
    }
  }, [router]) // ✅ Added router

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md space-y-4">
        <h1 className="text-xl font-bold">Login</h1>
        <Input
          type="email"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <div className="flex items-center gap-2">
          <Checkbox id="robot" onCheckedChange={(v) => setForm({ ...form, robot: v })} />
          <label htmlFor="robot" className="text-sm">I&#39;m not a robot</label>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Successfully logged in! Redirecting...</p>}
        <Button onClick={handleLogin}>Login</Button>
        <p className="text-sm">
          Don&#39;t have an account? <a href="/register" className="text-blue-600">Register</a>
        </p>
      </div>
    </div>
  )
}
