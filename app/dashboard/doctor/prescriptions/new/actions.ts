'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addPrescription(formData: FormData) {
  const supabase = await createServerClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const doctor_id = parseInt(formData.get('doctor_id') as string)
  const patient_id = parseInt(formData.get('patient_id') as string)
  const appointment_id = formData.get('appointment_id') as string
  const notes = formData.get('notes') as string
  const lab_tests = formData.get('lab_tests') as string

  if (!doctor_id || !patient_id) {
    redirect('/dashboard/doctor/prescriptions/new?error=Missing doctor or patient ID')
  }

  // 1. Create the prescription record
  const { data: prescription, error: prescriptionError } = await supabase
    .from('prescriptions')
    .insert({
      patient_id,
      doctor_id,
      notes: notes || null
    })
    .select('id')
    .single()

  if (prescriptionError || !prescription) {
    console.error(prescriptionError)
    redirect(`/dashboard/doctor/prescriptions/new?patient_id=${patient_id}&appointment_id=${appointment_id}&error=Failed to create prescription`)
  }

  const prescriptionId = prescription.id

  // 2. Insert Medicines
  const medicineIds = (formData.get('medicine_ids') as string || '').split(',').filter(Boolean)
  
  const medicines = []
  for (const id of medicineIds) {
    const name = formData.get(`medicine_${id}_name`) as string
    const dosage = formData.get(`medicine_${id}_dosage`) as string
    const timing = formData.get(`medicine_${id}_timing`) as string

    if (name && dosage) {
      medicines.push({
        prescription_id: prescriptionId,
        medicine_name: name,
        dosage: dosage,
        before_meal: timing === 'before'
      })
    }
  }

  if (medicines.length > 0) {
    const { error: medError } = await supabase
      .from('prescription_medicines')
      .insert(medicines)

    if (medError) {
      console.error(medError)
    }
  }

  // 3. Insert Injections
  const injectionIds = (formData.get('injection_ids') as string || '').split(',').filter(Boolean)
  const injections = []
  
  for (const id of injectionIds) {
    const name = formData.get(`injection_${id}_name`) as string
    const dosage = formData.get(`injection_${id}_dosage`) as string
    const route = formData.get(`injection_${id}_route`) as string

    if (name && dosage) {
      injections.push({
        prescription_id: prescriptionId,
        injection_name: name,
        dosage: dosage,
        route: route
      })
    }
  }

  if (injections.length > 0) {
    const { error: injError } = await supabase
      .from('prescription_injections')
      .insert(injections)

    if (injError) {
      console.error(injError)
    }
  }

  // 4. Insert Lab Reports if recommended
  if (lab_tests && lab_tests.trim().length > 0) {
    // Split by comma
    const tests = lab_tests.split(',').map(t => t.trim()).filter(t => t.length > 0)
    
    const reportsToInsert = tests.map(testName => ({
      patient_id,
      doctor_id,
      prescription_id: prescriptionId,
      report_name: testName,
      status: 'pending'
    }))

    if (reportsToInsert.length > 0) {
      await supabase.from('reports').insert(reportsToInsert)
    }
  }

  // 4. Mark appointment as completed
  if (appointment_id) {
    await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', parseInt(appointment_id))
  }

  revalidatePath('/dashboard/doctor')
  redirect('/dashboard/doctor')
}
