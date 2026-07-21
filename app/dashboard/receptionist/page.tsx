import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Clock, User, Plus, CheckCircle2, CircleDashed, ListChecks } from 'lucide-react'
import Link from 'next/link'
import { DateFilter } from '@/components/dashboard/DateFilter'
import { ReceptionistFilters } from '@/components/dashboard/receptionist/ReceptionistFilters'

export default async function ReceptionistDashboard(props: { 
  searchParams: Promise<{ date?: string, q?: string, status?: string }> 
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  
  // Authorization check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
    
  const { data: userData } = await supabase
    .from('users')
    .select('hospital_id, roles(name)')
    .eq('id', user.id)
    .maybeSingle()
    
  if ((userData?.roles as any)?.name !== 'receptionist') {
    redirect('/dashboard') // unauthorized
  }

  const selectedDate = searchParams.date || formatDate(new Date())
  const searchQuery = searchParams.q || ''
  const statusFilter = searchParams.status || 'all'

  let query = supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      status,
      visit_type,
      time_slots ( slot_time ),
      patients ( users ( name ) ),
      doctors ( users ( name ), specialization )
    `)
    .eq('appointment_date', selectedDate)

  // Apply status filter
  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  // Fetch data
  const { data: appointments } = await query.order('time_slots(slot_time)', { ascending: true })

  // Manual search filter (for patient/doctor names)
  // Supabase doesn't support easy multi-table text search without complex setup, 
  // so we filter the small daily list in memory for better UX.
  const filteredAppointments = appointments?.filter((apt: any) => {
    if (!searchQuery) return true
    const patientName = apt.patients?.users?.name?.toLowerCase() || ''
    const doctorName = apt.doctors?.users?.name?.toLowerCase() || ''
    const q = searchQuery.toLowerCase()
    return patientName.includes(q) || doctorName.includes(q)
  }) || []

  // Stats calculation
  const stats = {
    total: appointments?.length || 0,
    completed: appointments?.filter((a: any) => a.status === 'completed').length || 0,
    pending: appointments?.filter((a: any) => a.status !== 'completed' && a.status !== 'cancelled').length || 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Appointments Log</h1>
          <p className="text-slate-500 mt-1">
            {selectedDate === new Date().toISOString().split('T')[0] 
              ? "All doctor bookings for today" 
              : `Bookings for ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
          </p>
        </div>
        <DateFilter />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Today's Total</p>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-black text-emerald-600">{stats.completed}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <CircleDashed className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex-1 w-full">
          <ReceptionistFilters />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Link href="/dashboard/receptionist/bookings" className="flex-1 sm:flex-none">
            <Button variant="ghost" className="w-full rounded-xl font-bold h-12 text-slate-600 hover:bg-slate-50">
              <ListChecks className="h-4 w-4 mr-2" />
              All Bookings
            </Button>
          </Link>
          <Link href="/dashboard/receptionist/patients/new" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full rounded-xl font-bold h-12 border-slate-200 hover:bg-slate-50">
              <User className="h-4 w-4 mr-2" />
              New Patient
            </Button>
          </Link>
          <Link href="/dashboard/receptionist/appointments/new" className="flex-1 sm:flex-none">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold h-12 shadow-lg shadow-blue-100 transition-all active:scale-95">
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 font-bold text-xs uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Time</th>
                <th className="px-8 py-5">Patient</th>
                <th className="px-8 py-5">Doctor</th>
                <th className="px-8 py-5">Type</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAppointments.map((apt: any) => (
                <tr key={apt.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center font-black text-slate-900 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-all">
                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                      {apt.time_slots?.slot_time?.slice(0, 5) || 'N/A'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-900 text-base">{apt.patients?.users?.name || 'Unknown Patient'}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-900">Dr. {apt.doctors?.users?.name}</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-tight mt-0.5">{apt.doctors?.specialization}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${
                      apt.visit_type === 'New' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                    }`}>
                      {apt.visit_type === 'New' ? 'New' : 'Follow-up'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                      apt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      apt.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {apt.status || 'booked'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600 font-bold rounded-lg">
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
              
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="h-16 w-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="h-8 w-8" />
                    </div>
                    <p className="text-slate-500 font-medium">No appointments booked for this date.</p>
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

