import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/dashboard/profile/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData, error } = await supabase
    .from('users')
    .select('name, email, phone')
    .eq('id', user.id)
    .single()

  if (error || !userData) {
    console.error('Error fetching user data:', error)
    return (
      <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-100 text-red-600">
        <h2 className="text-xl font-bold">Failed to load profile</h2>
        <p>Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 mt-1">Manage your personal information and contact details.</p>
      </div>

      <ProfileForm initialData={userData} />
    </div>
  )
}
