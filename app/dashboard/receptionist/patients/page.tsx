import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function ReceptionistPatientsPage() {
  const supabase = await createClient()
  
  // Authorization check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
    
  const { data: userData } = await supabase
    .from('users')
    .select('roles(name)')
    .eq('id', user.id)
    .maybeSingle()
    
  if ((userData?.roles as any)?.name !== 'receptionist') {
    redirect('/dashboard') // unauthorized
  }

  // Fetch all patients
  // Patients table has user_id referencing users table
  const { data: patients } = await supabase
    .from('patients')
    .select(`
      id,
      age,
      gender,
      users ( name, email )
    `)
    .order('id', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patients</h1>
          <p className="text-slate-500 mt-1">Manage hospital patients and registrations</p>
        </div>
        <Link href="/dashboard/receptionist/patients/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            <Plus className="h-4 w-4 mr-2" />
            Register Patient
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b">
              <tr>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Age/Gender</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {patients?.map((patient: any) => (
                <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {patient.users?.name?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      {patient.users?.name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{patient.users?.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {patient.age} / {patient.gender}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600">
                      Book Slot
                    </Button>
                  </td>
                </tr>
              ))}
              
              {(!patients || patients.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <Users className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                    <p>No patients registered yet.</p>
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
