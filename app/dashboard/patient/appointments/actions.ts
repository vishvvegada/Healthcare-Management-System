'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function cancelAppointment(appointmentId: number) {
  const supabase = await createClient()

  // 1. Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // 2. Verify appointment ownership (patient)
  const { data: appointment } = await supabase
    .from('appointments')
    .select('id, patients(user_id)')
    .eq('id', appointmentId)
    .single()

  if (!appointment || (appointment.patients as any)?.user_id !== user.id) {
    throw new Error("Appointment not found or unauthorized")
  }

  // 3. Update status to 'cancelled'
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId)

  if (error) {
    console.error(error)
    throw new Error("Failed to cancel appointment")
  }

  revalidatePath('/dashboard/patient/appointments')
  return { success: true }
}
