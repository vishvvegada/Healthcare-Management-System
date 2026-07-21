import { LoginForm } from '@/components/auth/LoginForm'
import { Activity, ShieldCheck, UserCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string, message?: string }> }) {
  const searchParams = await props.searchParams

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left Branding/Info Section */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 mix-blend-overlay" />
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-indigo-500/30 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
        
        <div className="relative z-10 w-full max-w-lg space-y-8 text-white">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform">
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
            <span className="font-extrabold text-3xl tracking-tight">Kanbuvar</span>
          </Link>
          
          <div className="space-y-4 pt-8">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Welcome back to your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Intelligent Health Portal</span>
            </h1>
            <p className="text-lg text-blue-100/80 font-medium leading-relaxed max-w-md">
              Securely access your medical records, manage appointments, and connect with your healthcare team.
            </p>
          </div>

          <div className="pt-8 grid grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              <span className="text-sm font-semibold text-blue-50">Bank-Grade <br/>Security</span>
            </div>
            <div className="flex items-center gap-3">
              <UserCircle2 className="w-8 h-8 text-blue-400" />
              <span className="text-sm font-semibold text-blue-50">Unified <br/>Patient Record</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="absolute inset-0 bg-slate-50 lg:hidden" />
        
        <div className="w-full max-w-md relative z-10 space-y-8">
          <div className="lg:hidden flex flex-col items-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3 group">
              <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="font-extrabold text-3xl tracking-tight text-slate-900">Kanbuvar</span>
            </Link>
          </div>

          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign in to Kanbuvar
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Enter your email and password to access your account.
            </p>
          </div>
          
          {searchParams?.error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center animate-in fade-in slide-in-from-top-2">
              <span className="block w-1.5 h-1.5 rounded-full bg-red-600 mr-3 shrink-0" />
              {searchParams.error}
            </div>
          )}
          {searchParams?.message && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-medium border border-emerald-100 flex items-center animate-in fade-in slide-in-from-top-2">
              <span className="block w-1.5 h-1.5 rounded-full bg-emerald-600 mr-3 shrink-0" />
              {searchParams.message}
            </div>
          )}

          <LoginForm />

          <div className="text-center text-sm font-medium text-slate-500 mt-6 pt-6 border-t border-slate-100">
            New to Kanbuvar?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 transition-colors font-semibold">
              Create a patient account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
