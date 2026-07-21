import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Users, Plus, UserPlus, Stethoscope, Calendar, ClipboardList, Activity } from 'lucide-react'
import Link from 'next/link'

export default async function HospitalAdminDashboard() {
  const supabase = await createClient()
  
  // Authorization check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
    
  const { data: userData } = await supabase
    .from('users')
    .select('*, roles(name)')
    .eq('id', user.id)
    .single()
    
  if ((userData?.roles as any)?.name !== 'hospital_admin') {
    redirect('/dashboard') // unauthorized
  }

  const hospitalId = userData.hospital_id || 0

  // Fetch staff for this hospital
  const { data: staff } = await supabase
    .from('users')
    .select('*, roles(name)')
    .eq('hospital_id', hospitalId)
    .not('id', 'eq', user.id) // exclude self
    .order('created_at', { ascending: false })

  // Fetch stats
  const doctorCount = staff?.filter(s => (s.roles as any)?.name === 'doctor').length || 0
  const receptionistCount = staff?.filter(s => (s.roles as any)?.name === 'receptionist').length || 0
  const { count: appointmentCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('doctors.hospital_id', hospitalId)

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 h-64 w-64 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors duration-700" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hospital Administration</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your facility's personnel and operations</p>
        </div>
        <Link href="/dashboard/hospital-admin/staff/new" className="relative z-10">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all active:scale-95">
            <UserPlus className="h-5 w-5 mr-2" />
            Add Staff Member
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40 hover:scale-[1.02] transition-transform">
          <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Stethoscope className="h-7 w-7" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Doctors</p>
          <h3 className="text-3xl font-black text-slate-900">{doctorCount}</h3>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40 hover:scale-[1.02] transition-transform">
          <div className="h-14 w-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Users className="h-7 w-7" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Receptionists</p>
          <h3 className="text-3xl font-black text-slate-900">{receptionistCount}</h3>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40 hover:scale-[1.02] transition-transform">
          <div className="h-14 w-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Calendar className="h-7 w-7" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Appointments</p>
          <h3 className="text-3xl font-black text-slate-900">{appointmentCount || 0}</h3>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200/50 hover:scale-[1.02] transition-transform relative overflow-hidden">
          <Activity className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10 rotate-12" />
          <div className="relative z-10">
            <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Facility Status</p>
            <h3 className="text-3xl font-black">Active</h3>
            <p className="text-xs text-blue-100 mt-2 font-bold">24/7 Operations</p>
          </div>
        </div>
      </div>

      {/* Staff Table Section */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-black text-slate-900 text-2xl tracking-tight">Staff Directory</h2>
          <span className="bg-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border text-slate-600 shadow-sm">
            {staff?.length || 0} Total Personnel
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 font-bold text-xs uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-10 py-5">Personnel</th>
                <th className="px-10 py-5">Contact Information</th>
                <th className="px-10 py-5">Designation</th>
                <th className="px-10 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staff?.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {member.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="font-black text-slate-900 text-lg">{member.name || 'Unnamed User'}</div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="font-bold text-slate-600">{member.email}</div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="inline-flex items-center rounded-xl bg-slate-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-700 border border-slate-200">
                      {(member.roles as any)?.name?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600 font-black rounded-xl">
                      Manage Profile
                    </Button>
                  </td>
                </tr>
              ))}
              
              {(!staff || staff.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center">
                    <div className="h-20 w-20 bg-slate-50 text-slate-200 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                      <Users className="h-10 w-10" />
                    </div>
                    <p className="text-slate-500 font-bold text-lg">No staff members found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
