import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Building, 
  Calendar, 
  ArrowLeft, 
  Stethoscope, 
  UserCircle, 
  Clock,
  Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function UserDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch user data with role and hospital
  const { data: userData, error } = await supabase
    .from('users')
    .select(`
      *,
      roles ( name ),
      hospitals ( name )
    `)
    .eq('id', id)
    .single()

  if (error || !userData) {
    return notFound()
  }

  const roleName = (userData.roles as any)?.name
  const hospitalName = (userData.hospitals as any)?.name || 'System Admin'

  // 2. Fetch role-specific data
  let doctorData = null
  let patientData = null

  if (roleName === 'doctor') {
    const { data } = await supabase
      .from('doctors')
      .select('*')
      .eq('user_id', id)
      .single()
    doctorData = data
  } else if (roleName === 'patient') {
    const { data } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', id)
      .single()
    patientData = data
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/super-admin/users">
            <Button variant="ghost" className="rounded-xl h-12 w-12 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Profile</h1>
            <p className="text-slate-500">Full identity and role details for {userData.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl font-bold text-sm">
          <Shield className="h-4 w-4" />
          <span className="capitalize">{roleName?.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Essential Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8 text-center">
            <div className="h-24 w-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-black mx-auto mb-6 shadow-lg shadow-blue-200">
              {userData.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-black text-slate-900">{userData.name}</h2>
            <p className="text-slate-500 font-medium">{userData.email}</p>
            <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
              <div className="flex items-center gap-3 text-left">
                <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</p>
                  <p className="font-bold text-slate-700 truncate">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</p>
                  <p className="font-bold text-slate-700">{userData.phone || 'Not Provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Affiliation</p>
                  <p className="font-bold text-slate-700">{hospitalName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Joined Date</p>
                  <p className="font-bold text-slate-700">{new Date(userData.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Role Specific Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Doctor Details */}
          {roleName === 'doctor' && doctorData && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Medical Practice Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Specialization</p>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-black text-slate-700">
                      {doctorData.specialization || 'General Physician'}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Consultation Status</p>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 font-black text-emerald-700 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active Provider
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Working Days</p>
                  <div className="flex flex-wrap gap-2">
                    {doctorData.working_days?.map((day: string) => (
                      <span key={day} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm">
                        {day}
                      </span>
                    )) || <span className="text-slate-400 italic">No days set</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <Clock className="h-4 w-4 text-amber-500" />
                      Morning Shift
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-600 flex justify-between">
                      <span>{doctorData.morning_start?.slice(0, 5) || '09:00'}</span>
                      <span className="text-slate-300">to</span>
                      <span>{doctorData.morning_end?.slice(0, 5) || '13:00'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <Clock className="h-4 w-4 text-blue-500" />
                      Evening Shift
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-600 flex justify-between">
                      <span>{doctorData.evening_start?.slice(0, 5) || '14:00'}</span>
                      <span className="text-slate-300">to</span>
                      <span>{doctorData.evening_end?.slice(0, 5) || '18:00'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Patient Details */}
          {roleName === 'patient' && patientData && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                  <UserCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Patient Record Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Patient Age</p>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-black text-slate-700">
                    {patientData.age} Years Old
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Gender</p>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-black text-slate-700 capitalize">
                    {patientData.gender}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback for other roles */}
          {roleName !== 'doctor' && roleName !== 'patient' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-12 text-center">
              <div className="h-20 w-20 rounded-3xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-6">
                <Briefcase className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Administrative Profile</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                This user holds an administrative role. No additional clinical or patient data is associated with this account.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
