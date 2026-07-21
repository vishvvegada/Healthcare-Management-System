import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Info, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ReceptionistBookingForm } from '@/components/dashboard/receptionist/ReceptionistBookingForm'

export default async function BookAppointmentPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('hospital_id')
    .eq('id', user.id)
    .single()

  // Fetch doctors for the hospital
  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, specialization, morning_start, morning_end, evening_start, evening_end, working_days, users(name)')
    .eq('hospital_id', userData?.hospital_id)

  // Fetch patients (all registered)
  const { data: patients } = await supabase
    .from('patients')
    .select('id, users(name)')

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/receptionist">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-slate-200">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">New Booking</h1>
          <p className="text-slate-500 text-sm">Schedule a premium slot for a patient</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 p-8 md:p-12 transition-all">
        {searchParams?.error && (
          <div className="mb-8 bg-red-50 text-red-600 p-5 rounded-2xl text-sm border border-red-100 flex items-center animate-in slide-in-from-top duration-300">
            <Info className="h-5 w-5 mr-3 shrink-0" />
            {searchParams.error}
          </div>
        )}

        <ReceptionistBookingForm doctors={doctors || []} patients={patients || []} />
      </div>
    </div>
  )
}
