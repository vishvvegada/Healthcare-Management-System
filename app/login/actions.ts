'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const identifier = formData.get('email') as string // This could be email or phone
  const password = formData.get('password') as string

  let email = identifier

  // If identifier doesn't look like an email, assume it's a phone number
  if (!identifier.includes('@')) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('phone', identifier)
      .maybeSingle()

    if (userError || !userData) {
      redirect('/login?error=Account with this phone number not found')
    }
    email = userData.email
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })

  if (error) {
    redirect('/login?error=Invalid login credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
