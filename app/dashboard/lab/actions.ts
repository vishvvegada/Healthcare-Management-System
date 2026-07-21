'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateReportResult(formData: FormData) {
  const supabase = await createClient()
  
  const reportId = parseInt(formData.get('report_id') as string)
  const result = formData.get('result') as string

  if (!reportId || !result) {
    throw new Error('Report ID and result are required')
  }

  const { error } = await supabase
    .from('reports')
    .update({ 
      result, 
      status: 'completed' 
    })
    .eq('id', reportId)

  if (error) {
    console.error('Error updating report:', error)
    throw new Error('Failed to update report')
  }

  revalidatePath('/dashboard/lab')
}
