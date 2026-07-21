import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Users as UsersIcon, UserCircle, Briefcase, Pill, FlaskConical, MapPin, Mail, Calendar, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { revokeStaff } from './actions'

export default async function HospitalDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const hospitalId = parseInt(params.id)
  
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

  // Fetch hospital
  const { data: hospital } = await supabase
    .from('hospitals')
    .select('*')
    .eq('id', hospitalId)
    .single()

  if (!hospital) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-black text-slate-900">Hospital not found</h2>
        <Link href="/dashboard/super-admin">
           <Button className="mt-4 bg-blue-600">Go Back</Button>
        </Link>
      </div>
    )
  }

  // Fetch staff for this hospital
  const { data: staffMembers } = await supabase
    .from('users')
    .select('id, name, email, created_at, roles(name)')
    .eq('hospital_id', hospitalId)
    .order('created_at', { ascending: false })

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'hospital_admin': return <Briefcase className="h-4 w-4 text-purple-600" />
      case 'doctor': return <UserCircle className="h-4 w-4 text-blue-600" />
      case 'pharmacy_manager': return <Pill className="h-4 w-4 text-green-600" />
      case 'lab_manager': return <FlaskConical className="h-4 w-4 text-orange-600" />
      default: return <UsersIcon className="h-4 w-4 text-slate-600" />
    }
  }

  const formatRoleName = (name: string) => {
    if (!name) return ''
    return name.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      {/* Premium Header */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 h-64 w-64 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/super-admin">
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-100 hover:bg-slate-50 shadow-sm">
                <ArrowLeft className="h-6 w-6 text-slate-600" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <ShieldCheck className="h-4 w-4 text-emerald-500" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Facility</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{hospital.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-500 font-medium">
                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1.5 text-blue-500" /> {hospital.address}</span>
              </div>
            </div>
          </div>
          
          <Link href={`/dashboard/super-admin/hospitals/${hospitalId}/staff/new`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all active:scale-95">
              <Plus className="h-5 w-5 mr-2" />
              Recruit Staff
            </Button>
          </Link>
        </div>
      </div>

      {/* Staff Directory Card */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white rounded-2xl border shadow-sm flex items-center justify-center text-blue-600">
              <UsersIcon className="h-6 w-6" />
            </div>
            <h2 className="font-black text-slate-900 text-2xl tracking-tight">Staff Directory</h2>
          </div>
          <span className="bg-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border text-slate-600 shadow-sm">
            {staffMembers?.length || 0} Members
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 font-bold text-xs uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-10 py-5">Staff Member</th>
                <th className="px-10 py-5">Email Address</th>
                <th className="px-10 py-5">Department / Role</th>
                <th className="px-10 py-5 text-right">Administrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staffMembers?.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {staff.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="font-black text-slate-900 text-lg">{staff.name}</div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center text-slate-600 font-bold">
                       <Mail className="h-4 w-4 mr-2 text-slate-400" />
                       {staff.email}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2.5 bg-slate-100/80 px-4 py-1.5 rounded-xl w-fit border border-slate-200 group-hover:bg-white transition-all">
                      {getRoleIcon((staff.roles as any)?.name)}
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                        {formatRoleName((staff.roles as any)?.name)}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <form action={revokeStaff} className="inline-block">
                      <input type="hidden" name="user_id" value={staff.id} />
                      <input type="hidden" name="hospital_id" value={hospitalId.toString()} />
                      <Button type="submit" variant="ghost" size="sm" className="text-slate-400 hover:text-red-600 hover:bg-red-50 font-black rounded-lg text-xs uppercase tracking-widest">
                        Revoke Access
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
              
              {(!staffMembers || staffMembers.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center">
                    <div className="h-20 w-20 bg-slate-50 text-slate-200 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                      <UsersIcon className="h-10 w-10" />
                    </div>
                    <p className="text-slate-500 font-bold text-lg">No staff members assigned yet.</p>
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
