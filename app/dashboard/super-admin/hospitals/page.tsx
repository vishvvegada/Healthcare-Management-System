import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { HospitalList } from '@/components/dashboard/super-admin/HospitalList'

export default async function HospitalsPage() {
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

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 h-64 w-64 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors duration-700" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hospitals Directory</h1>
          <p className="text-slate-500 font-medium mt-1">Manage hospital networks and their configurations</p>
        </div>
        <Link href="/dashboard/super-admin/hospitals/new" className="relative z-10">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all active:scale-95">
            <Plus className="h-5 w-5 mr-2" />
            Add New Hospital
          </Button>
        </Link>
      </div>

      {/* Hospital List Section */}
      <div className="space-y-6">
        <HospitalList initialHospitals={hospitals || []} />
      </div>
    </div>
  )
}
