'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { registerPatient } from '@/app/signup/actions'
import { User, Mail, Lock, Calendar, Users as UsersIcon, Phone } from 'lucide-react'

export function SignupForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    try {
      await registerPatient(formData)
    } catch (err: any) {
      if (err.message && err.message !== 'NEXT_REDIRECT') {
        setError(err.message || 'An unexpected error occurred during registration')
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
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none block w-full pl-12 pr-5 py-3.5 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none block w-full pl-12 pr-5 py-3.5 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none block w-full pl-12 pr-5 py-3.5 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="appearance-none block w-full pl-12 pr-5 py-3.5 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="age" className="block text-sm font-semibold text-slate-700">Age</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="1"
                  max="150"
                  required
                  className="appearance-none block w-full pl-12 pr-5 py-3.5 border border-slate-200 bg-slate-50 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                  placeholder="25"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="gender" className="block text-sm font-semibold text-slate-700">Gender</label>
              <div className="relative">
                <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <select
                  id="gender"
                  name="gender"
                  required
                  className="appearance-none block w-full pl-12 pr-5 py-3.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-base font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
        >
          {loading ? 'Creating Account...' : 'Register as Patient'}
        </Button>
      </form>
    </div>
  )
}
