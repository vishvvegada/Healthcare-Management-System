import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Building, Users, UserCircle, Activity } from 'lucide-react'
import Link from 'next/link'

export default async function SuperAdminDashboard() {
  const supabase = await createClient()
  
  // Authorization check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
    
  const { data: userData } = await supabase
    .from('users')
    .select('roles(name)')
    .eq('id', user.id)
    .single()
    
  if ((userData?.roles as any)?.name !== 'super_admin') {
    redirect('/dashboard') // unauthorized
  }

  // Fetch all hospitals
  const { data: hospitals } = await supabase
    .from('hospitals')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch stats for the dashboard
  const { count: doctorCount } = await supabase.from('doctors').select('*', { count: 'exact', head: true })
  const { count: patientCount } = await supabase.from('patients').select('*', { count: 'exact', head: true })
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 h-64 w-64 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors duration-700" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Control</h1>
          <p className="text-slate-500 font-medium mt-1">Global management of hospitals and medical infrastructure</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40 hover:scale-[1.02] transition-transform">
          <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Building className="h-7 w-7" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Hospitals</p>
          <h3 className="text-3xl font-black text-slate-900">{hospitals?.length || 0}</h3>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40 hover:scale-[1.02] transition-transform">
          <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <UserCircle className="h-7 w-7" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Medical Staff</p>
          <h3 className="text-3xl font-black text-slate-900">{doctorCount || 0}</h3>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40 hover:scale-[1.02] transition-transform">
          <div className="h-14 w-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Users className="h-7 w-7" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Patients</p>
          <h3 className="text-3xl font-black text-slate-900">{patientCount || 0}</h3>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-transform relative overflow-hidden">
          <Activity className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10 rotate-12" />
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Users</p>
            <h3 className="text-3xl font-black">{userCount || 0}</h3>
            <p className="text-xs text-slate-400 mt-2 font-bold flex items-center">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              System Online
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
