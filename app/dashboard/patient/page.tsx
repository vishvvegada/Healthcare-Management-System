import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pill, Beaker, User, Calendar, Clock, FileText, Syringe } from 'lucide-react'

export default async function PatientDashboardPage() {
  const supabase = await createClient()

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Check role and get user details
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      name,
      roles ( name )
    `)
    .eq('id', user.id)
    .single()

  if (userError || (userData?.roles as any)?.name !== 'patient') {
    redirect('/dashboard') // Or some error page
  }

  // 3. Get patient record
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('id, age, gender')
    .eq('user_id', user.id)
    .single()

  if (patientError || !patientData) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow-sm border">
        <h2 className="text-xl font-bold mb-2 text-slate-800">Profile Incomplete</h2>
        <p className="text-slate-600">Your patient medical record has not been fully set up yet. Please contact the reception.</p>
      </div>
    )
  }

  // 4. Fetch Prescriptions
  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select(`
      id,
      notes,
      created_at,
      doctors (
        users ( name )
      ),
      prescription_medicines (
        id,
        medicine_name,
        dosage,
        before_meal
      ),
      prescription_injections (
        id,
        injection_name,
        dosage,
        route
      )
    `)
    .eq('patient_id', patientData.id)
    .order('created_at', { ascending: false })

  // 5. Fetch Lab Reports
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      id,
      report_name,
      result,
      status,
      created_at,
      doctors (
        users ( name )
      )
    `)
    .eq('patient_id', patientData.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-10">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 group">
        <div className="absolute -right-10 -top-10 h-64 w-64 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors duration-700" />
        <div className="absolute -left-10 -bottom-10 h-64 w-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:bg-indigo-100 transition-colors duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
              Hello, <span className="text-blue-600">{userData.name.split(' ')[0]}!</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-md">Your health is our priority. Here's a look at your medical records and prescriptions.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center min-w-[120px]">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Age</p>
              <p className="text-2xl font-black text-slate-900">{patientData.age}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center min-w-[120px]">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Gender</p>
              <p className="text-2xl font-black text-slate-900">{patientData.gender}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content (Prescriptions) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <Pill className="h-6 w-6" />
              </div>
              Recent Prescriptions
            </h2>
          </div>

          {!prescriptions || prescriptions.length === 0 ? (
            <div className="bg-white p-16 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
              <Pill className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-xl">No prescriptions found yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {prescriptions.map((prescription: any) => {
                const docUsers = prescription.doctors?.users;
                const doctorName = Array.isArray(docUsers) ? docUsers[0]?.name : docUsers?.name || 'Unknown';
                return (
                  <div key={prescription.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden hover:border-blue-200 transition-all group">
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-black border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {doctorName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xl font-black text-slate-900">Dr. {doctorName}</p>
                            <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                              <Calendar className="h-4 w-4" />
                              {new Date(prescription.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {prescription.notes && (
                        <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-slate-600 italic leading-relaxed">
                          "{prescription.notes}"
                        </div>
                      )}

                      <div className="space-y-6">
                        {prescription.prescription_medicines?.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Medicines</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {prescription.prescription_medicines.map((med: any) => (
                                <div key={med.id} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm group/med hover:border-emerald-200 transition-all">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover/med:bg-emerald-600 group-hover/med:text-white transition-all">
                                      <Pill className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold text-slate-900 text-sm">{med.medicine_name}</span>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-emerald-600">{med.dosage}</span>
                                    <span className="text-[9px] font-bold text-slate-400">{med.before_meal ? 'Before' : 'After'} Meal</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {prescription.prescription_injections?.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Injections</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {prescription.prescription_injections.map((inj: any) => (
                                <div key={inj.id} className="flex justify-between items-center p-4 bg-purple-50/30 rounded-2xl border border-purple-100 shadow-sm group/inj hover:border-purple-300 transition-all">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover/inj:bg-purple-600 group-hover/inj:text-white transition-all">
                                      <Syringe className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold text-slate-900 text-sm">{inj.injection_name}</span>
                                  </div>
                                  <Badge className="bg-purple-600 text-white rounded-lg text-[10px] border-none">{inj.route}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar Column (Reports & Info) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 px-2">
              <div className="h-10 w-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                <Beaker className="h-6 w-6" />
              </div>
              Lab Reports
            </h2>
            
            {!reports || reports.length === 0 ? (
              <div className="bg-white p-8 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                <p className="text-slate-400 font-bold text-sm italic">No reports found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report: any) => (
                  <div key={report.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-black text-slate-900 leading-tight">{report.report_name}</h3>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-bold">
                          <Clock className="h-3 w-3" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={`rounded-xl border-none shadow-sm ${
                        report.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-white'
                      }`}>
                        {report.status}
                      </Badge>
                    </div>
                    {report.status === 'completed' && report.result && (
                      <div className="mt-4 pt-4 border-t border-dashed border-slate-100">
                        <p className="text-sm text-slate-600 leading-relaxed truncate">{report.result}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
