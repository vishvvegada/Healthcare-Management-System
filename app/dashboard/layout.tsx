import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Activity, LogOut, UserCircle } from 'lucide-react'
import { SidebarNav } from '@/components/dashboard/SidebarNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select(`
      name,
      roles ( name )
    `)
    .eq('id', user.id)
    .maybeSingle()

  const roleName = (userData?.roles as any)?.name

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r flex flex-col hidden lg:flex shadow-xl shadow-slate-200/50 z-20">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tight text-slate-900">Kanbuvar</span>
          </Link>
        </div>
        
        <div className="p-6">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {userData?.name?.charAt(0) || user.email?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 truncate text-sm">{userData?.name || user.email}</p>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">{roleName?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-8">
          <div>
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
            <SidebarNav roleName={roleName as string} />
          </div>
          
          <div>
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Account</p>
            <ul className="space-y-1.5">
              <li>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 transition-all hover:text-blue-600 hover:bg-blue-50 group"
                >
                  <UserCircle className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  My Profile
                </Link>
              </li>
              <li>
                <form action="/auth/signout" method="post">
                  <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 transition-all hover:text-red-600 hover:bg-red-50 group">
                    <LogOut className="h-5 w-5 text-slate-400 group-hover:text-red-600 transition-colors" />
                    Sign Out
                  </button>
                </form>
              </li>
            </ul>
          </div>
        </nav>

        <div className="p-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-200 overflow-hidden relative">
            <Activity className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10 rotate-12" />
            <p className="font-bold text-sm relative z-10">Premium Support</p>
            <p className="text-[10px] text-blue-100 mt-1 relative z-10">24/7 dedicated helpdesk</p>
            <button className="mt-4 w-full py-2 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-colors relative z-10">Contact Help</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-16 border-b bg-white flex items-center px-6 md:hidden">
          <span className="font-bold">Kanbuvar Dashboard</span>
        </div>
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
