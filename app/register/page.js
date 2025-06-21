'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', email: '', password: '', robot: false })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleRegister = async () => {
    if (!form.robot) return setError('Please verify you are not a robot.')

    try {
      const res = await fetch('http://localhost/chat/register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password
        })
      })

      const data = await res.json()

      if (data.success) {
        router.push('/login')
      } else {
        setError(data.message || 'Registration failed.')
      }
    } catch (err) {
      console.error('Register error:', err)
      setError('Server error. Please try again later.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md space-y-4">
        <h1 className="text-xl font-bold">Create Account</h1>
        <Input
          placeholder="Username"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <Input
          type="email"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="robot" onCheckedChange={(v) => setForm({ ...form, robot: v })} />
          <label htmlFor="robot" className="text-sm">I&#39;m not a robot</label>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button onClick={handleRegister}>Register</Button>
        <p className="text-sm">
          Already have an account? <a href="/login" className="text-blue-600">Login</a>
        </p>
      </div>
    </div>
  )
}
