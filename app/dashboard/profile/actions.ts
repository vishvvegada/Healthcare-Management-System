'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string

  if (!name) return { error: 'Name is required' }

  // 2. Update users table
  const { error: updateError } = await supabase
    .from('users')
    .update({
      name,
      phone,
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Profile update error:', updateError)
    return { error: 'Failed to update profile' }
  }

  // 3. Optional: Update metadata in Supabase Auth if needed
  await supabase.auth.updateUser({
    data: { name }
  })

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}
