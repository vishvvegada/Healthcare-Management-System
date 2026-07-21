'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function deleteHospital(hospitalId: number) {
  const supabase = await createClient()

  // 1. Verify super admin role
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

  // 2. Create service role client for administrative tasks
  const serviceClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // 3. Get patient role ID
  const { data: patientRole } = await serviceClient
    .from('roles')
    .select('id')
    .eq('name', 'patient')
    .single()

  if (!patientRole) throw new Error("Patient role not found")

  // 4. Find all users of this hospital who are NOT patients
  const { data: usersToDelete } = await serviceClient
    .from('users')
    .select('id')
    .eq('hospital_id', hospitalId)
    .neq('role_id', patientRole.id)

  // 5. Delete those users from Auth (cascades to public.users and other tables)
  if (usersToDelete && usersToDelete.length > 0) {
    for (const u of usersToDelete) {
      const { error: deleteAuthError } = await serviceClient.auth.admin.deleteUser(u.id)
      if (deleteAuthError) {
        console.error(`Failed to delete auth user ${u.id}:`, deleteAuthError.message)
      }
    }
  }

  // 6. Set hospital_id to NULL for patients of this hospital
  const { error: updatePatientsError } = await serviceClient
    .from('users')
    .update({ hospital_id: null })
    .eq('hospital_id', hospitalId)
    .eq('role_id', patientRole.id)

  if (updatePatientsError) {
    console.error("Failed to update patients:", updatePatientsError.message)
    throw new Error("Failed to decouple patients from hospital")
  }

  // 7. Finally, delete the hospital
  const { error: deleteHospitalError } = await serviceClient
    .from('hospitals')
    .delete()
    .eq('id', hospitalId)

  if (deleteHospitalError) {
    console.error("Failed to delete hospital:", deleteHospitalError.message)
    throw new Error("Failed to delete hospital record")
  }

  revalidatePath('/dashboard/super-admin')
  return { success: true }
}
