import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { BookingForm } from '@/components/dashboard/BookingForm'

export default async function PatientBookAppointmentPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all hospitals
  const { data: hospitals } = await supabase
    .from('hospitals')
    .select('id, name, address')
    .order('name')

  // Fetch doctors for the patient to choose from, including their hospital info
  const { data: doctors } = await supabase
    .from('doctors')
    .select(`
      id, 
      specialization, 
      morning_start,
      morning_end,
      evening_start,
      evening_end,
      available_dates,
      users ( name ),
      hospitals ( id, name )
    `)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/patient/appointments">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Book Appointment</h1>
          <p className="text-slate-500 text-sm">Schedule a new visit with a doctor</p>
        </div>
      </div>

      <BookingForm 
        doctors={doctors || []} 
        hospitals={hospitals || []} 
        error={searchParams?.error} 
      />
    </div>
  )
}
