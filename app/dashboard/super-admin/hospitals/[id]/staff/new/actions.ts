'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addSuperAdminStaff(formData: FormData) {
  const supabaseSession = await createServerClient()

  // Verify auth
  const { data: { user } } = await supabaseSession.auth.getUser()
  if (!user) throw new Error("Unauthorized")
    
  const { data: userData } = await supabaseSession
    .from('users')
    .select('roles(name)')
    .eq('id', user.id)
    .single()
    
  if ((userData?.roles as any)?.name !== 'super_admin') {
    throw new Error("Unauthorized")
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role_id_str = formData.get('role_id') as string
  const hospital_id_str = formData.get('hospital_id') as string
  
  const role_id = parseInt(role_id_str)
  const hospital_id = parseInt(hospital_id_str)

  if (isNaN(hospital_id)) {
    console.error("Invalid hospital_id:", hospital_id_str)
    redirect(`/dashboard/super-admin?error=Invalid hospital ID`)
  }

  if (isNaN(role_id)) {
    redirect(`/dashboard/super-admin/hospitals/${hospital_id}/staff/new?error=Please select a valid role`)
  }

  if (!password || password.length < 6) {
    redirect(`/dashboard/super-admin/hospitals/${hospital_id}/staff/new?error=Password must be at least 6 characters`)
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY")
    redirect(`/dashboard/super-admin/hospitals/${hospital_id}/staff/new?error=Server configuration error: Missing service role key`)
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
  let userId: string

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: password,
    email_confirm: true,
  })

  if (authError) {
    // If user already exists in Auth, we might want to try to update their record in our users table 
    // if they are missing from there (half-completed registration)
    if (authError.message.includes('already registered')) {
      // Fetch the existing user's ID
      const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = existingUsers?.users.find(u => u.email === email)
      
      if (existingUser) {
        userId = existingUser.id
      } else {
        console.error("Auth error:", authError)
        redirect(`/dashboard/super-admin/hospitals/${hospital_id}/staff/new?error=${authError.message}`)
      }
    } else {
      console.error("Auth error:", authError)
      redirect(`/dashboard/super-admin/hospitals/${hospital_id}/staff/new?error=${authError.message}`)
    }
  } else if (authData.user) {
    userId = authData.user.id
  } else {
    redirect(`/dashboard/super-admin/hospitals/${hospital_id}/staff/new?error=Failed to create auth user`)
    return // unreachable but for TS
  }

  // 2. Insert into users table
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .upsert({
      id: userId,
      name,
      email,
      role_id,
      hospital_id
    })

  if (dbError) {
    console.error("Database error (users):", dbError)
    redirect(`/dashboard/super-admin/hospitals/${hospital_id}/staff/new?error=Failed to save user profile: ${dbError.message}`)
  }

  // 3. If role is doctor, create doctor record
  const { data: roleData } = await supabaseAdmin
    .from('roles')
    .select('name')
    .eq('id', role_id)
    .single()

  if (roleData?.name === 'doctor') {
    // Check if doctor record already exists
    const { data: existingDoc } = await supabaseAdmin
      .from('doctors')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!existingDoc) {
      const { error: docError } = await supabaseAdmin
        .from('doctors')
        .insert({
          user_id: userId,
          hospital_id: hospital_id,
          specialization: 'General'
        })
      if (docError) {
        console.error("Failed to create doctor record:", docError)
        // We don't redirect here as the main user record was created successfully
      }
    }
  }

  revalidatePath(`/dashboard/super-admin/hospitals/${hospital_id}`)
  redirect(`/dashboard/super-admin/hospitals/${hospital_id}`)
}
