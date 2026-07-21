'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function revokeStaff(formData: FormData) {
  const userId = formData.get('user_id') as string
  const hospitalId = formData.get('hospital_id') as string

  if (!userId || !hospitalId) return

  const supabaseSession = await createServerClient()

  // Verify auth
  const { data: { user } } = await supabaseSession.auth.getUser()
  if (!user) throw new Error("Unauthorized")
    
  const { data: userData } = await supabaseSession
    .from('users')
    .select('roles(name)')
    .eq('id', user.id)
    .single()
    
  if ((userData?.roles as any)?.name !== 'super_admin') {
    throw new Error("Unauthorized")
  }

  // We need service role key to delete users from auth.users
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
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

  // Deleting from auth.users will automatically cascade and delete from public.users
  // because of the ON DELETE CASCADE constraint in the schema.
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    console.error("Error revoking staff:", error)
  }

  revalidatePath(`/dashboard/super-admin/hospitals/${hospitalId}`)
}
