import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardIndex() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user role
  const { data: userData, error } = await supabase
    .from('users')
    .select(`
      role_id,
      roles (
        name
      )
    `)
    .eq('id', user.id)
    .maybeSingle()

  if (error || !userData) {
    // If user has no role or isn't in users table yet
    // fallback or show error
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-2 text-red-500">Access Denied</h2>
        <p className="text-slate-600">Your account is not registered in the system as a staff member or administrator.</p>
        <p className="text-slate-600 mb-4">If you are the system administrator, please run the setup process.</p>
        <a href="/setup" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Go to Setup
        </a>
      </div>
    )
  }

  const roleName = (userData.roles as any)?.name

  // Redirect based on role
  switch (roleName) {
    case 'super_admin':
      redirect('/dashboard/super-admin')
    case 'hospital_admin':
      redirect('/dashboard/hospital-admin')
    case 'doctor':
      redirect('/dashboard/doctor')
    case 'receptionist':
      redirect('/dashboard/receptionist')
    case 'pharmacy_manager':
      redirect('/dashboard/pharmacy')
    case 'lab_manager':
      redirect('/dashboard/lab')
    case 'patient':
      redirect('/dashboard/patient')
    default:
      return <div className="p-8">Unknown role: {roleName}</div>
  }
}
