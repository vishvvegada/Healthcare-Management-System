'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addStaff(formData: FormData) {
  const supabaseSession = await createServerClient()

  // Verify hospital admin role
  const { data: { user } } = await supabaseSession.auth.getUser()
  if (!user) throw new Error("Unauthorized")
    
  const { data: userData } = await supabaseSession
    .from('users')
    .select('hospital_id, roles(name)')
    .eq('id', user.id)
    .single()
    
  const roleName = (userData?.roles as any)?.name
  if (!userData || roleName !== 'hospital_admin') {
    throw new Error(`Unauthorized: This action requires the 'hospital_admin' role, but you are logged in as '${roleName || 'unknown'}'. Please log in as a hospital admin.`)
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!password || password.length < 6) {
    redirect('/dashboard/hospital-admin/staff/new?error=Password must be at least 6 characters')
  }
  const role_id = parseInt(formData.get('role_id') as string)

  // We need the service role key to bypass RLS and create a user without logging out the admin
  // The user needs to add SUPABASE_SERVICE_ROLE_KEY to their .env.local
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    redirect('/dashboard/hospital-admin/staff/new?error=Missing SUPABASE_SERVICE_ROLE_KEY in environment variables')
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    redirect(`/dashboard/hospital-admin/staff/new?error=${authError?.message || 'Failed to create user auth'}`)
  }

  // NOTE: Depending on how the trigger was set up in Supabase (if any), 
  // the row in `users` might be auto-created. 
  // If not auto-created, we must insert it.
  // Assuming no trigger for now, we will UPSERT or UPDATE if trigger exists.
  
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .upsert({
      id: authData.user.id,
      name: name,
      email: email,
      role_id: role_id,
      hospital_id: userData.hospital_id
    })

  if (dbError) {
    console.error(dbError)
    redirect('/dashboard/hospital-admin/staff/new?error=Failed to save user profile')
  }

  // If role is doctor, we also need to insert into doctors table
  // Ideally, we'd fetch the role name to verify, but for now we check if role_id corresponds to 'doctor' (e.g. 3)
  // Let's fetch role name:
  const { data: roleData } = await supabaseAdmin.from('roles').select('name').eq('id', role_id).single()
  
  if (roleData?.name === 'doctor') {
    await supabaseAdmin.from('doctors').insert({
      user_id: authData.user.id,
      hospital_id: userData.hospital_id,
      specialization: 'General', // default, can be edited later
      start_time: '09:00:00',
      end_time: '17:00:00'
    })
  }

  revalidatePath('/dashboard/hospital-admin')
  redirect('/dashboard/hospital-admin')
}
