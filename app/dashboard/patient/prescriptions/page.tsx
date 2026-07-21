import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Pill } from 'lucide-react'
import { PrescriptionHistoryClient } from '@/components/dashboard/PrescriptionHistoryClient'

export default async function PrescriptionHistoryPage() {
  const supabase = await createClient()

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Check role and get user details
  const { data: userData } = await supabase
    .from('users')
    .select(`
      id,
      roles ( name )
    `)
    .eq('id', user.id)
    .single()

  if ((userData?.roles as any)?.name !== 'patient') {
    redirect('/dashboard')
  }

  // 3. Get patient record
  const { data: patientData } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!patientData) {
    redirect('/dashboard/patient')
  }

  // 4. Fetch All Prescriptions with details
  const { data: prescriptions, error: fetchError } = await supabase
    .from('prescriptions')
    .select(`
      id,
      notes,
      created_at,
      doctors (
        users ( name )
      ),
      prescription_medicines (
        id,
        medicine_name,
        dosage,
        before_meal
      ),
      prescription_injections (
        id,
        injection_name,
        dosage,
        route
      ),
      reports (
        id,
        report_name,
        status
      )
    `)
    .eq('patient_id', patientData.id)
    .order('created_at', { ascending: false })

  if (fetchError) {
    console.error('Error fetching prescriptions:', {
      message: fetchError.message,
      details: fetchError.details,
      hint: fetchError.hint,
      code: fetchError.code
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <Pill className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Prescription History</h1>
          <p className="text-slate-500 font-medium">View and manage all your medical prescriptions.</p>
        </div>
      </div>

      <PrescriptionHistoryClient prescriptions={(prescriptions as any) || []} />
    </div>
  )
}
