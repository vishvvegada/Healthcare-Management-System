'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateDoctorSettings(formData: FormData) {
  const supabase = await createServerClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const specialization = formData.get('specialization') as string
  const morning_start = formData.get('morning_start') as string
  const morning_end = formData.get('morning_end') as string
  const evening_start = formData.get('evening_start') as string
  const evening_end = formData.get('evening_end') as string
  const available_dates = JSON.parse(formData.get('available_dates') as string)

  // Get doctor ID
  const { data: doctorData } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!doctorData) throw new Error("Doctor profile not found")

  const { error } = await supabase
    .from('doctors')
    .update({
      specialization,
      morning_start: morning_start ? `${morning_start}:00` : null,
      morning_end: morning_end ? `${morning_end}:00` : null,
      evening_start: evening_start ? `${evening_start}:00` : null,
      evening_end: evening_end ? `${evening_end}:00` : null,
      available_dates
    })
    .eq('id', doctorData.id)

  if (error) {
    console.error(error)
    return { error: "Failed to update settings" }
  }

  revalidatePath('/dashboard/doctor')
  return { success: true }
}
