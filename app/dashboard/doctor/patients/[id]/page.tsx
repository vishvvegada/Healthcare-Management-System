import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Pill, Calendar as CalendarIcon, User, Syringe, Activity, ClipboardList, Beaker, History } from 'lucide-react'
import Link from 'next/link'

export default async function PatientHistoryPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const patientId = params.id
  
  const supabase = await createClient()
  
  // Authorization check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
    
  const { data: userData } = await supabase
    .from('users')
    .select('id, roles(name)')
    .eq('id', user.id)
    .maybeSingle()
    
  if ((userData?.roles as any)?.name !== 'doctor') {
    redirect('/dashboard')
  }

  // Fetch patient details
  const { data: patient } = await supabase
    .from('patients')
    .select('id, age, gender, created_at, users(name, email)')
    .eq('id', patientId)
    .single()

  if (!patient) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-black text-slate-900">Patient not found</h2>
        <Link href="/dashboard/doctor">
           <Button className="mt-4 bg-blue-600">Go Back</Button>
        </Link>
      </div>
    )
  }

  // Fetch previous prescriptions for this patient
  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select(`
      id,
      notes,
      created_at,
      doctors ( users ( name ) ),
      prescription_medicines ( medicine_name, dosage, before_meal ),
      prescription_injections ( injection_name, dosage, route )
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  // Fetch previous reports
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      id,
      report_name,
      result,
      status,
      created_at,
      doctors ( users ( name ) )
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Premium Header */}
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 h-64 w-64 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-8">
            <Link href="/dashboard/doctor">
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-100 hover:bg-slate-50 shadow-sm transition-all">
                <ArrowLeft className="h-6 w-6 text-slate-600" />
              </Button>
            </Link>
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-200">
                {(patient.users as any)?.name?.charAt(0) || 'P'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Medical Record Active</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{(patient.users as any)?.name}</h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-slate-500 font-bold">
                  <span className="flex items-center bg-slate-50 px-3 py-1 rounded-xl border border-slate-100"><User className="h-4 w-4 mr-2 text-blue-500" /> {patient.age} yrs, {patient.gender}</span>
                  <span className="flex items-center bg-slate-50 px-3 py-1 rounded-xl border border-slate-100"><History className="h-4 w-4 mr-2 text-indigo-500" /> Patient Since {new Date(patient.created_at).getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center min-w-[140px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Visits</p>
                <p className="text-3xl font-black text-slate-900">{prescriptions?.length || 0}</p>
             </div>
             <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center min-w-[140px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lab Reports</p>
                <p className="text-3xl font-black text-slate-900">{reports?.length || 0}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Clinical Timeline */}
        <div className="lg:col-span-7 space-y-8">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <ClipboardList className="h-6 w-6 text-blue-600" />
              Clinical History
            </h2>
          </div>

          <div className="space-y-6 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {prescriptions?.map((prescription: any) => (
              <div key={prescription.id} className="relative pl-20 group">
                {/* Timeline Dot */}
                <div className="absolute left-[30px] top-8 h-4 w-4 rounded-full bg-white border-4 border-blue-600 z-10 group-hover:scale-125 transition-transform" />
                
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/30 p-8 hover:shadow-xl hover:shadow-blue-100/50 transition-all border-l-8 border-l-blue-600">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Visit Date</p>
                      <h4 className="text-xl font-black text-slate-900">{new Date(prescription.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Physician</p>
                      <p className="text-sm font-bold text-slate-700">Dr. {(prescription.doctors?.users as any)?.name}</p>
                    </div>
                  </div>

                  {prescription.notes && (
                    <div className="mb-8 p-6 bg-slate-50/80 rounded-2xl border border-slate-100 italic text-slate-600 leading-relaxed relative">
                      <div className="absolute top-0 left-6 -translate-y-1/2 bg-white px-3 py-0.5 rounded-full border border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-tighter">Clinical Notes</div>
                      "{prescription.notes}"
                    </div>
                  )}

                  <div className="space-y-6">
                    {prescription.prescription_medicines?.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Prescribed Medications</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {prescription.prescription_medicines.map((med: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm group/med hover:border-blue-200 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover/med:bg-blue-600 group-hover/med:text-white transition-all">
                                  <Pill className="h-4 w-4" />
                                </div>
                                <span className="font-bold text-slate-900 text-sm">{med.medicine_name}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-blue-600">{med.dosage}</span>
                                <span className="text-[9px] font-bold text-slate-400">{med.before_meal ? 'Before' : 'After'} Meal</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {prescription.prescription_injections?.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Clinical Injections</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {prescription.prescription_injections.map((inj: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-purple-50/30 rounded-2xl border border-purple-100 shadow-sm group/inj hover:border-purple-300 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover/inj:bg-purple-600 group-hover/inj:text-white transition-all">
                                  <Syringe className="h-4 w-4" />
                                </div>
                                <span className="font-bold text-slate-900 text-sm">{inj.injection_name}</span>
                              </div>
                              <span className="bg-purple-600 text-white rounded-lg px-2 py-0.5 text-[9px] font-black border-none uppercase">{inj.route}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {(!prescriptions || prescriptions.length === 0) && (
              <div className="ml-20 bg-white border border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
                <History className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-bold text-lg tracking-tight">No clinical history recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Lab Diagnostics */}
        <div className="lg:col-span-5 space-y-8">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Beaker className="h-6 w-6 text-purple-600" />
              Diagnostics
            </h2>
          </div>

          <div className="space-y-4">
            {reports?.map((report: any) => (
              <div key={report.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/30 p-6 group transition-all hover:border-purple-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 leading-tight">{report.report_name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-bold flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-xl px-3 py-1 text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                    report.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {report.status || 'pending'}
                  </span>
                </div>
                
                {report.status === 'completed' && report.result ? (
                  <div className="mt-4 pt-4 border-t border-dashed border-slate-100">
                    <p className="text-xs font-black text-purple-600 uppercase tracking-widest mb-2">Final Observation</p>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                      "{report.result}"
                    </p>
                    <p className="text-[10px] text-slate-400 mt-3 text-right font-bold italic">— Verified by Dr. {(report.doctors?.users as any)?.name}</p>
                  </div>
                ) : (
                  <div className="mt-4 py-4 flex flex-col items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <Activity className="h-5 w-5 text-slate-300 animate-pulse mb-2" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Processing Results...</p>
                  </div>
                )}
              </div>
            ))}

            {(!reports || reports.length === 0) && (
              <div className="bg-white border border-dashed border-slate-200 rounded-[2rem] p-12 text-center shadow-inner">
                <FileText className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 font-bold text-sm italic">No diagnostic data found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
