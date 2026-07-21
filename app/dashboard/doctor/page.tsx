import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, Clock, User, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { DateFilter } from '@/components/dashboard/DateFilter'

export default async function DoctorDashboard(props: { searchParams: Promise<{ date?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  
  // Authorization check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
    
  const { data: userData } = await supabase
    .from('users')
    .select('id, roles(name)')
    .eq('id', user.id)
    .maybeSingle()
    
  if (!userData || (userData?.roles as any)?.name !== 'doctor') {
    redirect('/dashboard') // unauthorized
  }

  // Find the doctor's record
  const { data: doctorData } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', userData?.id)
    .single()

  const selectedDate = searchParams.date || formatDate(new Date())

  // Fetch appointments for this specific doctor and date
  let appointments: any[] = []
  if (doctorData) {
    const { data: apts } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        status,
        time_slots ( slot_time ),
        patients ( id, age, gender, users ( name ) )
      `)
      .eq('doctor_id', doctorData.id)
      .eq('appointment_date', selectedDate)
      .neq('status', 'cancelled')
      .order('time_slots(slot_time)', { ascending: true })
      
    if (apts) appointments = apts
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative group">
        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
          <div className="absolute -right-10 -top-10 h-64 w-64 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors duration-700" />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Schedule Overview</h1>
          <p className="text-slate-500 font-medium mt-1">
            {selectedDate === new Date().toISOString().split('T')[0] 
              ? "Your patient lineup for today" 
              : `Appointments for ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 relative z-10">
          <DateFilter />
          <Link href="/dashboard/doctor/patients">
            <Button variant="outline" className="rounded-2xl border-slate-200 hover:bg-slate-50 font-black h-12 px-6 transition-all shadow-sm">
              <UsersIcon className="h-5 w-5 mr-2" />
              My Patients
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40 hover:scale-[1.02] transition-transform">
          <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <CalendarIcon className="h-7 w-7" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Bookings</p>
          <h3 className="text-3xl font-black text-slate-900">{appointments.length}</h3>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40 hover:scale-[1.02] transition-transform">
          <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <ClipboardList className="h-7 w-7" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed</p>
          <h3 className="text-3xl font-black text-slate-900">
            {appointments.filter((a: any) => a.status === 'completed').length}
          </h3>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40 hover:scale-[1.02] transition-transform">
          <div className="h-14 w-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Clock className="h-7 w-7" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending</p>
          <h3 className="text-3xl font-black text-slate-900">
            {appointments.filter((a: any) => a.status === 'booked' || !a.status).length}
          </h3>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200/50 hover:scale-[1.02] transition-transform relative overflow-hidden">
          <ActivityIcon className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10 rotate-12" />
          <div className="relative z-10">
            <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Status</p>
            <h3 className="text-3xl font-black">{appointments.length > 0 ? "On Duty" : "Available"}</h3>
            <p className="text-xs text-blue-100 mt-2">Active session in progress</p>
          </div>
        </div>
      </div>

      {/* Appointment Timeline */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-black text-slate-900 text-2xl tracking-tight">Appointment Timeline</h2>
          <Badge className="bg-blue-600 text-white rounded-xl px-4 py-1.5 font-black uppercase tracking-widest text-[10px] border-none">Live</Badge>
        </div>
        <div className="divide-y divide-slate-50">
          {appointments.map((apt: any) => (
            <div key={apt.id} className="p-10 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50/80 transition-all gap-8 group">
              <div className="flex items-center gap-8">
                <div className="h-20 w-20 bg-white text-blue-600 rounded-3xl flex flex-col items-center justify-center border-2 border-blue-50 shadow-sm group-hover:border-blue-200 group-hover:scale-105 transition-all">
                  <span className="text-lg font-black tracking-tight">{apt.time_slots?.slot_time?.slice(0, 5)}</span>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xl leading-tight">{(apt.patients?.users as any)?.name}</h4>
                  <div className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <span className="flex items-center font-bold text-slate-600"><User className="h-4 w-4 mr-2 text-slate-400" /> {apt.patients?.age} yrs, {apt.patients?.gender}</span>
                    <Badge className={`rounded-xl px-4 py-1 text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm ${
                      apt.status === 'completed' ? 'bg-emerald-500 text-white border-none' :
                      apt.status === 'cancelled' ? 'bg-rose-500 text-white border-none' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {apt.status || 'booked'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                <Link href={`/dashboard/doctor/patients/${apt.patients?.id}`} className="flex-1 sm:flex-none">
                  <Button variant="outline" className="w-full h-12 px-8 rounded-2xl font-black border-slate-200 hover:bg-white transition-all shadow-sm">
                    View Profile
                  </Button>
                </Link>
                {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                  <Link href={`/dashboard/doctor/prescriptions/new?appointment_id=${apt.id}&patient_id=${apt.patients?.id}`} className="flex-1 sm:flex-none">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full h-12 px-8 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all active:scale-95">
                      Start Consultation
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
          
          {appointments.length === 0 && (
            <div className="p-24 text-center">
              <div className="h-24 w-24 bg-slate-50 text-slate-200 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <CalendarIcon className="h-12 w-12" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Quiet Day!</h3>
              <p className="text-slate-500 mt-2 text-lg font-medium">No appointments scheduled for this date.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2" />
    </svg>
  )
}

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
