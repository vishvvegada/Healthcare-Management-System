import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Beaker, Clock, CheckCircle, FileText, Search, User, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateReportResult } from './actions'
import { SubmitButton } from '@/components/dashboard/SubmitButton'

export default async function LabDashboardPage() {
  const supabase = await createClient()

  // Auth and Role check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('hospital_id, roles(name)')
    .eq('id', user.id)
    .single()

  if (!userData || (userData.roles as any)?.name !== 'lab_manager') {
    redirect('/dashboard')
  }

  const hospitalId = userData.hospital_id

  // Fetch reports for this hospital
  // We filter by checking if the doctor who ordered it belongs to the same hospital
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      *,
      patients (
        id,
        users ( name )
      ),
      doctors!inner (
        id,
        hospital_id,
        users ( name )
      )
    `)
    .eq('doctors.hospital_id', hospitalId)
    .order('created_at', { ascending: false })

  const pendingReports = reports?.filter(r => r.status === 'pending') || []
  const completedReports = reports?.filter(r => r.status === 'completed') || []

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Lab Management</h1>
          <p className="text-slate-500 font-medium">Process and manage laboratory test reports</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4 flex-1 md:flex-none md:min-w-[180px]">
            <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</p>
              <p className="text-xl font-black text-slate-900">{pendingReports.length}</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4 flex-1 md:flex-none md:min-w-[180px]">
            <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
              <p className="text-xl font-black text-slate-900">{completedReports.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-6 border-b bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search reports or patients..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="rounded-xl font-bold text-xs h-10 px-4">All Reports</Button>
             <Button variant="ghost" className="rounded-xl font-bold text-xs h-10 px-4 text-slate-500">History</Button>
          </div>
        </div>

        <div className="divide-y">
          {pendingReports.length > 0 ? (
            pendingReports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col lg:flex-row gap-6 justify-between">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                      <Beaker className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{report.report_name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <span className="flex items-center text-sm text-slate-500 font-bold">
                          <User className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                          {report.patients?.users?.name}
                        </span>
                        <span className="flex items-center text-sm text-slate-500">
                          <UserPlus className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                          Dr. {report.doctors?.users?.name}
                        </span>
                        <span className="flex items-center text-sm text-slate-500">
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <form action={updateReportResult} className="flex-1 max-w-xl flex gap-3">
                    <input type="hidden" name="report_id" value={report.id} />
                    <textarea 
                      name="result" 
                      required
                      placeholder="Enter test results here..."
                      className="flex-1 min-h-[44px] h-11 py-2.5 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm resize-none"
                    />
                    <SubmitButton className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                      Complete
                    </SubmitButton>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center">
              <div className="h-20 w-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No Pending Reports</h3>
              <p className="text-slate-500 mt-2">All caught up! New test requests will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Completed Reports Section */}
      {completedReports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight px-2">Recently Completed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedReports.slice(0, 4).map((report) => (
              <div key={report.id} className="bg-white p-5 rounded-2xl border shadow-sm flex justify-between items-center group hover:border-blue-200 transition-all">
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{report.report_name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{report.patients?.users?.name} • {new Date(report.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Completed</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[120px]">{report.result}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
