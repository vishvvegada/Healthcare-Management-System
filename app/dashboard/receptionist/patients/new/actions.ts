'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function registerPatient(formData: FormData) {
  const supabaseSession = await createServerClient()

  // Verify receptionist role
  const { data: { user } } = await supabaseSession.auth.getUser()
  if (!user) throw new Error("Unauthorized")
    
  const { data: userData } = await supabaseSession
    .from('users')
    .select('hospital_id, roles(name)')
    .eq('id', user.id)
    .maybeSingle()
    
  if (!userData || (userData?.roles as any)?.name !== 'receptionist') {
    throw new Error("Unauthorized")
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const age = parseInt(formData.get('age') as string)
  const gender = formData.get('gender') as string

  // We need the service role key to bypass RLS and create a user without logging out the receptionist
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    redirect('/dashboard/receptionist/patients/new?error=Missing SUPABASE_SERVICE_ROLE_KEY in environment variables')
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

  // 1. Get patient role ID
  const { data: roleData, error: roleError } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('name', 'patient')
    .single()

  if (roleError || !roleData) {
    redirect('/dashboard/receptionist/patients/new?error=Patient role not found in database')
  }

  // 2. Create user in Supabase Auth
  const password = formData.get('password') as string
  
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: password,
    email_confirm: true,
  })

  // If user already exists in Auth, we should ideally link them, but for now we error out if it fails
  if (authError || !authData.user) {
    redirect(`/dashboard/receptionist/patients/new?error=${authError?.message || 'Failed to create patient account'}`)
  }

  // 3. Insert into users table
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .upsert({
      id: authData.user.id,
      name: name,
      email: email,
      role_id: roleData.id,
      hospital_id: userData.hospital_id
    })

  if (dbError) {
    console.error(dbError)
    redirect('/dashboard/receptionist/patients/new?error=Failed to save user profile')
  }

  // 4. Insert into patients table
  const { error: patientError } = await supabaseAdmin
    .from('patients')
    .insert({
      user_id: authData.user.id,
      age: age,
      gender: gender
    })

  if (patientError) {
    console.error(patientError)
    redirect('/dashboard/receptionist/patients/new?error=Failed to save patient medical record')
  }

  revalidatePath('/dashboard/receptionist/patients')
  redirect('/dashboard/receptionist/patients')
}
