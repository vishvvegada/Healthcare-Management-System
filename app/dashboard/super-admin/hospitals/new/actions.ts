'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addHospital(formData: FormData) {
  const supabase = await createClient()

  // Verify super admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
    
  const { data: userData } = await supabase
    .from('users')
    .select('roles(name)')
    .eq('id', user.id)
    .single()
    
  if ((userData?.roles as any)?.name !== 'super_admin') {
    throw new Error("Unauthorized")
  }

  const name = formData.get('name') as string
  const address = formData.get('address') as string

  const { error: insertError } = await supabase
    .from('hospitals')
    .insert([{ name, address }])

  if (insertError) {
    console.error(insertError)
    redirect(`/dashboard/super-admin/hospitals/new?error=Failed to add hospital: ${insertError.message}`)
  }

  revalidatePath('/dashboard/super-admin')
  redirect('/dashboard/super-admin')
}
