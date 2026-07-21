import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pill, Plus, FileText, History } from 'lucide-react'
import Link from 'next/link'
import { addPrescription } from './actions'
import { PrescriptionMedicineList } from '@/components/dashboard/PrescriptionMedicineList'
import { PrescriptionInjectionList } from '@/components/dashboard/PrescriptionInjectionList'

export default async function NewPrescriptionPage(props: { searchParams: Promise<{ appointment_id?: string, patient_id?: string, error?: string }> }) {
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
    redirect('/dashboard')
  }

  const { data: doctorData } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', userData?.id)
    .single()

  const appointmentId = searchParams?.appointment_id
  const patientId = searchParams?.patient_id

  if (!patientId) {
    return <div className="p-8 text-center text-red-500">Missing patient context. Please select an appointment from your dashboard.</div>
  }

  // Fetch Patient info
  const { data: patient } = await supabase
    .from('patients')
    .select('age, gender, users(name)')
    .eq('id', patientId)
    .single()

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
        <Link href="/dashboard/doctor">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">New Consultation</h1>
            <Link href={`/dashboard/doctor/patients/${patientId}`} target="_blank">
              <Button 
                type="button"
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 h-10 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 hover:shadow-md active:scale-95"
              >
                <History className="h-3.5 w-3.5" />
                Medical History
              </Button>
            </Link>
          </div>
          <p className="text-slate-500 font-medium">Drafting medical record for {(patient?.users as any)?.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        {searchParams?.error && (
          <div className="m-8 bg-rose-50 text-rose-600 p-5 rounded-2xl text-sm font-bold border border-rose-100 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
            {searchParams.error}
          </div>
        )}

        <form action={addPrescription} className="divide-y divide-slate-100">
          <input type="hidden" name="doctor_id" value={doctorData?.id} />
          <input type="hidden" name="patient_id" value={patientId} />
          <input type="hidden" name="appointment_id" value={appointmentId || ''} />

          {/* Clinical Notes Section */}
          <div className="p-10 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Clinical Assessment</h3>
            </div>
            <textarea
              name="notes"
              rows={4}
              placeholder="Record symptoms, primary diagnosis, or general health instructions..."
              className="appearance-none block w-full px-6 py-4 bg-slate-50/50 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent text-base transition-all resize-none shadow-inner"
            ></textarea>
          </div>

          {/* Medicines Section */}
          <div className="p-10 bg-slate-50/30">
            <PrescriptionMedicineList />
          </div>

          {/* Injections Section */}
          <div className="p-10">
            <PrescriptionInjectionList />
          </div>

          {/* Lab Tests Section */}
          <div className="p-10 bg-slate-50/30 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <ActivityIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Recommended Lab Tests</h3>
            </div>
            <div className="space-y-2 px-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Optional Diagnostics</p>
              <input
                type="text"
                name="lab_tests"
                placeholder="e.g. CBC, Liver Function Test, Lipid Profile (comma separated)"
                className="block w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-10 bg-slate-50/50 flex flex-col sm:flex-row justify-end gap-4">
            <Link href="/dashboard/doctor" className="w-full sm:w-auto">
              <Button type="button" variant="outline" className="w-full h-14 px-10 rounded-2xl font-black text-slate-500 border-slate-200 hover:bg-white hover:text-slate-900 transition-all">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white h-14 px-12 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all active:scale-95">
              Confirm & Issue Prescription
            </Button>
          </div>
        </form>
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
