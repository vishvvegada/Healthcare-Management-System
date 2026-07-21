'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function bookAppointment(formData: FormData) {
  const supabase = await createServerClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Get current patient's ID
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (patientError || !patientData) {
    redirect('/dashboard/patient/appointments/new?error=Patient profile not found')
  }
    
  const patient_id = patientData.id
  const doctor_id = parseInt(formData.get('doctor_id') as string)
  const appointment_date = formData.get('appointment_date') as string
  const slot_time = formData.get('slot_time') as string // HH:MM

  if (!doctor_id || !appointment_date || !slot_time) {
    redirect('/dashboard/patient/appointments/new?error=Please fill all fields')
  }

  // To prevent double booking, we need the exact slot_time for this doctor.
  // 1. Check if the slot_time exists in time_slots for this doctor
  let { data: slotData } = await supabase
    .from('time_slots')
    .select('id')
    .eq('doctor_id', doctor_id)
    .eq('slot_time', `${slot_time}:00`) // TIME type includes seconds
    .single()

  let slotId = slotData?.id

  // If slot doesn't exist in time_slots template, create it
  if (!slotId) {
    const { data: newSlot, error: insertError } = await supabase
      .from('time_slots')
      .insert({
        doctor_id: doctor_id,
        slot_time: `${slot_time}:00`,
        is_booked: false
      })
      .select('id')
      .single()

    if (insertError || !newSlot) {
      redirect('/dashboard/patient/appointments/new?error=Failed to initialize time slot for this doctor')
    }
    slotId = newSlot.id
  }

  // 2. Prevent Double Booking: Check if an active appointment already exists for this Date + Doctor + Slot
  const { data: existingBookings } = await supabase
    .from('appointments')
    .select('id')
    .eq('doctor_id', doctor_id)
    .eq('appointment_date', appointment_date)
    .eq('slot_id', slotId)
    .neq('status', 'cancelled')
    .limit(1)

  if (existingBookings && existingBookings.length > 0) {
    redirect('/dashboard/patient/appointments/new?error=This slot is already booked! Please select a different time.')
  }

  // 3. Determine Visit Type (New vs Old)
  // Logic: If patient visited within 30 days of the selected appointment date, it's "Old", otherwise "New"
  const selectedDate = new Date(appointment_date)
  const thirtyDaysAgo = new Date(selectedDate)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

  const { data: previousVisits } = await supabase
    .from('appointments')
    .select('id')
    .eq('patient_id', patient_id)
    .gte('appointment_date', thirtyDaysAgoStr)
    .lt('appointment_date', appointment_date) // Must be before the new appointment
    .neq('status', 'cancelled') // Cancelled appointments don't count as visits
    .limit(1)

  const visit_type = (previousVisits && previousVisits.length > 0) ? 'Old' : 'New'

  // Lazy Cleanup: Delete cancelled appointments older than 30 days
  try {
    const oneMonthAgo = new Date()
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30)
    await supabase
      .from('appointments')
      .delete()
      .eq('status', 'cancelled')
      .lt('created_at', oneMonthAgo.toISOString())
  } catch (err) {
    console.error('Failed to prune old cancelled appointments:', err)
  }

  // 4. Create or Update the appointment (to reuse cancelled slots and satisfy DB unique constraints)
  const { data: existingCancelled } = await supabase
    .from('appointments')
    .select('id')
    .eq('doctor_id', doctor_id)
    .eq('appointment_date', appointment_date)
    .eq('slot_id', slotId)
    .eq('status', 'cancelled')
    .limit(1)
    .maybeSingle()

  let bookingError;
  if (existingCancelled) {
    const { error } = await supabase
      .from('appointments')
      .update({
        patient_id: patient_id,
        status: 'booked',
        visit_type: visit_type,
        created_at: new Date().toISOString()
      })
      .eq('id', existingCancelled.id)
    bookingError = error
  } else {
    const { error } = await supabase
      .from('appointments')
      .insert({
        patient_id: patient_id,
        doctor_id: doctor_id,
        appointment_date: appointment_date,
        slot_id: slotId,
        status: 'booked',
        visit_type: visit_type
      })
    bookingError = error
  }

  if (bookingError) {
    console.error(bookingError)
    redirect('/dashboard/patient/appointments/new?error=Failed to book appointment')
  }

  revalidatePath('/dashboard/patient/appointments')
  redirect('/dashboard/patient/appointments')
}

export async function getBookedSlots(doctorId: number, date: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('appointments')
    .select('time_slots(slot_time)')
    .eq('doctor_id', doctorId)
    .eq('appointment_date', date)
    .neq('status', 'cancelled')

  if (error) {
    console.error(error)
    return []
  }

  // Extract time strings and format to HH:MM
  return data.map((apt: any) => apt.time_slots?.slot_time?.slice(0, 5)).filter(Boolean)
}
