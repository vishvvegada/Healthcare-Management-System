'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAsUser(userId: string) {
  const supabase = await createServerClient()
  
  // 1. Verify current user is a Super Admin
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('roles(name)')
    .eq('id', currentUser.id)
    .single()

  if ((userData?.roles as any)?.name !== 'super_admin') {
    throw new Error("Unauthorized: Only Super Admins can impersonate users")
  }

  // 2. Initialize Admin Supabase Client
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // 3. Get target user email
  const { data: targetUser, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('email')
    .eq('id', userId)
    .single()

  if (fetchError || !targetUser) {
    throw new Error("Target user not found")
  }

  // 4. Generate Magic Link for the target user
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: targetUser.email,
  })

  if (linkError || !linkData?.properties?.action_link) {
    console.error('Link Generation Error:', linkError)
    return { error: "Failed to generate login link" }
  }

  // 5. Return the link to the client
  return { url: linkData.properties.action_link }
}
