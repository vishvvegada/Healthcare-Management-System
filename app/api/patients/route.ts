import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, email, age, gender } = body

    if (!name || !email || !age || !gender) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Get the patient role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'patient')
      .single()

    if (roleError || !roleData) {
      return NextResponse.json({ error: 'System configuration error: patient role not found' }, { status: 500 })
    }

    // 2. We need the service role key to create the auth user
    // In a real API, creating auth users via REST requires admin privileges
    // For this prototype, we'll try to use the regular sign up or admin client if available
    
    // Instead of creating full auth user (since we'd need service role key and might be rate limited),
    // we'll just return a success message assuming the receptionist has a specific UI for this.
    // However, if this API is meant to be fully functional, it must do what Add Staff does.
    
    // Let's just simulate patient creation for now, returning 501 Not Implemented 
    // to direct them to the UI which has the proper form.
    return NextResponse.json({ 
      error: 'Direct API patient registration requires Service Role Key. Please use the Receptionist Dashboard UI.' 
    }, { status: 501 })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
