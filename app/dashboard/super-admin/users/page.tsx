import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserList } from '@/components/dashboard/super-admin/UserList'

export default async function UsersPage() {
  const supabase = await createClient()
  
  // Authorization check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
    
  const { data: userData } = await supabase
    .from('users')
    .select('roles(name)')
    .eq('id', user.id)
    .single()
    
  if ((userData?.roles as any)?.name !== 'super_admin') {
    redirect('/dashboard') // unauthorized
  }

  // Fetch all users with their roles and hospitals
  const { data: allUsers } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      created_at,
      roles ( name ),
      hospitals ( name )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
        <p className="text-slate-500 mt-1">View and manage all system users across all hospitals</p>
      </div>

      <UserList initialUsers={(allUsers as any) || []} />
    </div>
  )
}

