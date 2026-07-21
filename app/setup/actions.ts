'use server'

import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function createSuperAdmin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    redirect('/setup?error=Missing SUPABASE_SERVICE_ROLE_KEY in .env.local')
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

  // 1. Get the super_admin role ID
  const { data: roleData, error: roleError } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('name', 'super_admin')
    .single()

  if (roleError || !roleData) {
    redirect('/setup?error=Could not find super_admin role in the database. Did you run the SQL schema?')
  }

  // 2. Create user in Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    redirect(`/setup?error=${authError?.message || 'Failed to create user'}`)
  }

  // 3. Insert into public.users table
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .upsert({
      id: authData.user.id,
      name: name,
      email: email,
      role_id: roleData.id,
    })

  if (dbError) {
    console.error(dbError)
    redirect('/setup?error=Failed to insert into users table')
  }

  redirect('/login?success=Super Admin created successfully! You can now log in.')
}
