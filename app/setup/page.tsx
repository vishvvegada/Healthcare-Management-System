import { Button } from '@/components/ui/button'
import { Activity, ShieldAlert } from 'lucide-react'
import { createSuperAdmin } from './actions'

export default async function SetupPage(props: { searchParams: Promise<{ error?: string, success?: string }> }) {
  const searchParams = await props.searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900">
            System Setup
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Create the first Super Admin account
          </p>
        </div>
        
        {searchParams?.error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm border border-red-100 break-words">
            {searchParams.error}
          </div>
        )}

        <form className="mt-8 space-y-6" action={createSuperAdmin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none block w-full px-4 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                placeholder="Admin Name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none block w-full px-4 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                placeholder="admin@kanbuvar.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="appearance-none block w-full px-4 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                placeholder="Secure password"
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base rounded-lg">
              Create Super Admin
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
