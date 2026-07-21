import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { AppointmentList } from '@/components/dashboard/patient/AppointmentList'

export default async function PatientAppointmentsPage() {
  const supabase = await createClient()

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Get patient record
  const { data: patientData } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!patientData) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow-sm border">
        <h2 className="text-xl font-bold mb-2 text-slate-800">Profile Incomplete</h2>
        <p className="text-slate-600">Please complete your patient profile before booking appointments.</p>
      </div>
    )
  }

  // 3. Fetch Appointments
  const { data: appointments, error: fetchError } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      status,
      visit_type,
      time_slots ( slot_time ),
      doctors (
        specialization,
        users ( name )
      )
    `)
    .eq('patient_id', patientData.id)
    .order('appointment_date', { ascending: false })

  if (fetchError) {
    console.error("Fetch Error:", fetchError)
  }

  const rawAppointments = (appointments as any) || []
  
  // Total cancelled count (ever)
  const totalCancelledCount = rawAppointments.filter((a: any) => a.status === 'cancelled').length

  // Filter cancelled appointments older than 7 days
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const filteredAppointments = rawAppointments.filter((a: any) => {
    // If not cancelled, show it
    if (a.status !== 'cancelled') return true
    
    // For cancelled ones, check the appointment_date
    if (!a.appointment_date) return true

    const cancelDate = new Date(a.appointment_date)
    return cancelDate >= sevenDaysAgo
  })

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Appointments</h1>
          <p className="text-slate-500 text-sm">View and manage your scheduled appointments.</p>
        </div>
        <Link href="/dashboard/patient/appointments/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-11 px-6 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95">
            <Plus className="h-4 w-4" /> Book Appointment
          </Button>
        </Link>
      </div>

      <AppointmentList 
        initialAppointments={filteredAppointments} 
        cancelledCount={totalCancelledCount}
      />
    </div>
  )
}

