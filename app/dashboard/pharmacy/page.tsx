import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Pill, Search, User, Clock, FileText, ChevronRight, Activity, Syringe, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function PharmacyDashboardPage() {
  const supabase = await createClient()

  // Auth and Role check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('hospital_id, roles(name)')
    .eq('id', user.id)
    .single()

  if (!userData || (userData.roles as any)?.name !== 'pharmacy_manager') {
    redirect('/dashboard')
  }

  const hospitalId = userData.hospital_id

  // Fetch prescriptions for this hospital
  const { data: prescriptions } = await supabase
    .from('prescriptions')
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
    .eq('doctors.hospital_id', hospitalId)
    .order('created_at', { ascending: false })

  const prescriptionsToday = prescriptions?.filter(p => {
    const today = new Date().toLocaleDateString()
    const pDate = new Date(p.created_at).toLocaleDateString()
    return today === pDate
  }) || []

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pharmacy Dashboard</h1>
          <p className="text-slate-500 font-medium">Review and dispense patient prescriptions</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4 flex-1 md:flex-none md:min-w-[200px]">
            <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
              <p className="text-xl font-black text-slate-900">{prescriptions?.length || 0}</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-4 flex-1 md:flex-none md:min-w-[200px]">
            <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Orders</p>
              <p className="text-xl font-black text-slate-900">{prescriptionsToday.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by patient name, prescription ID..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="rounded-xl font-bold text-sm h-11 px-6 flex-1 md:flex-none">Recent First</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-sm h-11 px-6 flex-1 md:flex-none">Filter</Button>
        </div>
      </div>

      {/* Prescription Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {prescriptions && prescriptions.length > 0 ? (
          prescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden hover:border-blue-300 transition-all group">
              <div className="p-6 border-b bg-slate-50/50 group-hover:bg-blue-50/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 bg-white rounded-2xl border shadow-sm flex items-center justify-center text-blue-600">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Order #{prescription.id}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center text-xs font-bold text-slate-500">
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                          {new Date(prescription.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                        <span className="text-xs font-bold text-slate-500">
                          {new Date(prescription.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200">
                    New
                  </div>
                </div>
                
                <div className="mt-6 flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-600">
                      {prescription.patients?.users?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</p>
                      <p className="text-sm font-bold text-slate-900">{prescription.patients?.users?.name}</p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200"></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prescribed By</p>
                    <p className="text-sm font-bold text-slate-900">Dr. {prescription.doctors?.users?.name}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Medicines */}
                {prescription.prescription_medicines?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Pill className="h-3 w-3" />
                      Medicines ({prescription.prescription_medicines.length})
                    </h4>
                    <div className="space-y-2">
                      {prescription.prescription_medicines.map((med: any) => (
                        <div key={med.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{med.medicine_name}</p>
                            <p className="text-xs text-slate-500 font-medium">
                              {med.dosage} {med.before_meal ? '• Before Meal' : '• After Meal'}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Injections */}
                {prescription.prescription_injections?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Syringe className="h-3 w-3" />
                      Injections ({prescription.prescription_injections.length})
                    </h4>
                    <div className="space-y-2">
                      {prescription.prescription_injections.map((inj: any) => (
                        <div key={inj.id} className="flex justify-between items-center p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{inj.injection_name}</p>
                            <p className="text-xs text-slate-500 font-medium">
                              {inj.dosage} • {inj.route}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-indigo-200" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {prescription.notes && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Doctor's Notes</p>
                    <p className="text-xs text-amber-900 font-medium leading-relaxed">{prescription.notes}</p>
                  </div>
                )}

                <div className="pt-2">
                  <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-200">
                    Mark as Dispensed
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="h-24 w-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Pill className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">No Prescriptions Found</h3>
            <p className="text-slate-500 mt-2">New prescriptions from doctors will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
