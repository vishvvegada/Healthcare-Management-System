import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Clock, ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function AllBookingsPage(props: { 
  searchParams: Promise<{ q?: string, status?: string }> 
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
    
  if (!userData || (userData.roles as any)?.name !== 'receptionist') {
    redirect('/dashboard')
  }

  const searchQuery = searchParams.q || ''
  const statusFilter = searchParams.status || 'all'

  // Fetch all appointments for the hospital
  // We filter by hospital_id through the doctor's table
  let query = supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      status,
      visit_type,
      time_slots ( slot_time ),
      patients ( users ( name ) ),
      doctors!inner ( 
        hospital_id,
        users ( name ), 
        specialization 
      )
    `)
    .eq('doctors.hospital_id', userData.hospital_id)

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: appointments, error } = await query.order('appointment_date', { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', error)
  }

  const filteredAppointments = appointments?.filter((apt: any) => {
    if (!searchQuery) return true
    const patientName = apt.patients?.users?.name?.toLowerCase() || ''
    const doctorName = apt.doctors?.users?.name?.toLowerCase() || ''
    const q = searchQuery.toLowerCase()
    return patientName.includes(q) || doctorName.includes(q)
  }) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/receptionist">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-slate-200">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">All Hospital Bookings</h1>
            <p className="text-slate-500 mt-1">Complete history of all appointments</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <form>
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search patient or doctor..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-medium text-slate-600"
            />
          </form>
        </div>
        <div className="flex gap-2">
          {['all', 'booked', 'completed', 'cancelled'].map((status) => (
            <Link 
              key={status}
              href={`?status=${status}${searchQuery ? `&q=${searchQuery}` : ''}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === status 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {status}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 font-bold text-xs uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Date & Time</th>
                <th className="px-8 py-5">Patient</th>
                <th className="px-8 py-5">Doctor</th>
                <th className="px-8 py-5">Type</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAppointments.map((apt: any) => (
                <tr key={apt.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center font-bold text-slate-900">
                        <CalendarIcon className="h-3.5 w-3.5 mr-2 text-blue-500" />
                        {new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-50 w-fit px-2 py-1 rounded-md border border-slate-100">
                        <Clock className="h-3 w-3 mr-1.5 text-blue-400" />
                        {apt.time_slots?.slot_time?.slice(0, 5) || 'N/A'}
                      </div>
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
                </tr>
              ))}
              
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="h-16 w-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="h-8 w-8" />
                    </div>
                    <p className="text-slate-500 font-medium">No bookings found.</p>
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
