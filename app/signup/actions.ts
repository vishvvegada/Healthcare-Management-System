'use server'

import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function registerPatient(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const phone = formData.get('phone') as string
  const age = parseInt(formData.get('age') as string)
  const gender = formData.get('gender') as string

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    redirect('/signup?error=Missing SUPABASE_SERVICE_ROLE_KEY in environment variables')
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
    redirect('/signup?error=Patient role not found in database')
  }

  // 2. Create user in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    redirect(`/signup?error=${authError?.message || 'Failed to create account'}`)
  }

  // 3. Insert into users table
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .upsert({
      id: authData.user.id,
      name: name,
      email: email,
      phone: phone,
      role_id: roleData.id,
      hospital_id: null // Patient might not be tied to a hospital at signup
    })

  if (dbError) {
    console.error(dbError)
    redirect('/signup?error=Failed to save user profile')
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
    redirect('/signup?error=Failed to save patient medical record')
  }

  redirect('/login?message=Account created successfully. Please sign in.')
}
