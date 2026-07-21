import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch doctors with their names from the users table
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select(`
      id,
      specialization,
      start_time,
      end_time,
      users ( name, email )
    `)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Format the response nicely
  const formattedDoctors = doctors.map((doc: any) => ({
    id: doc.id,
    name: doc.users?.name || 'Unknown Doctor',
    email: doc.users?.email,
    specialization: doc.specialization,
    start_time: doc.start_time,
    end_time: doc.end_time
  }))

  return NextResponse.json({ doctors: formattedDoctors })
}
