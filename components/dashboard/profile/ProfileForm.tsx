'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { User, Phone, Mail, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { updateProfile } from '@/app/dashboard/profile/actions'

interface ProfileFormProps {
  initialData: {
    name: string | null
    email: string | null
    phone: string | null
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await updateProfile(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    } catch (err: any) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={initialData.name || ''}
                required
                className="w-full pl-12 pr-5 py-4 border border-slate-200 rounded-2xl text-slate-900 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all bg-slate-50/50 font-bold outline-none"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={initialData.phone || ''}
                className="w-full pl-12 pr-5 py-4 border border-slate-200 rounded-2xl text-slate-900 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all bg-slate-50/50 font-bold outline-none"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          {/* Email (Disabled) */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="email" className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Email Address (Read-only)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <input
                id="email"
                type="email"
                defaultValue={initialData.email || ''}
                disabled
                className="w-full pl-12 pr-5 py-4 border border-slate-100 rounded-2xl text-slate-400 bg-slate-50 cursor-not-allowed font-medium outline-none"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1 px-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Email verification is required for changes. Please contact support.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center animate-in slide-in-from-bottom">
            <AlertCircle className="h-5 w-5 mr-3 shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex items-center animate-in slide-in-from-bottom">
            <CheckCircle2 className="h-5 w-5 mr-3 shrink-0" />
            <p className="font-bold">Profile updated successfully!</p>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-12 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
