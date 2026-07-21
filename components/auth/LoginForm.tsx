'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { login } from '@/app/login/actions'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    try {
      // We can still call the server action directly
      await login(formData)
    } catch (err: any) {
      // In Next.js, redirect() throws an error, so we need to be careful here.
      // But if it's a real error, we catch it.
      if (err.message && err.message !== 'NEXT_REDIRECT') {
        setError(err.message || 'An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white lg:bg-transparent lg:shadow-none lg:border-none p-8 lg:p-0 rounded-[2rem] shadow-xl border border-slate-100">
      <form className="space-y-6" action={handleSubmit}>
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}
        
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email or Phone Number</label>
            <input
              id="email"
              name="email"
              type="text"
              autoComplete="username"
              required
              className="appearance-none block w-full px-5 py-3.5 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
              placeholder="Email or Phone number"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
              <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="appearance-none block w-full px-5 py-3.5 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
              placeholder="••••••••"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-base font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
        >
          {loading ? 'Signing in...' : 'Sign in to your account'}
        </Button>
      </form>
    </div>
  )
}
