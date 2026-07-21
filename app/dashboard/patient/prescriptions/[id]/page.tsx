import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Pill, Syringe, Calendar, User, FileText, Beaker, ArrowLeft, Download, Printer, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function PrescriptionDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Fetch Prescription with all related data
  const { data: prescription, error } = await supabase
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
      ),
      reports (
        id,
        report_name,
        status
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !prescription) {
    notFound()
  }

  const doc = Array.isArray(prescription.doctors) ? prescription.doctors[0] : (prescription.doctors as any);
  const docUsers = doc?.users;
  const doctorName = Array.isArray(docUsers) ? (docUsers[0] as any)?.name : (docUsers as any)?.name || 'Unknown';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header with Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/patient/prescriptions">
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Prescription Details</h1>
            <p className="text-slate-500 font-medium">Issued on {new Date(prescription.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl font-bold flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-black text-blue-600 shadow-inner">
                {doctorName.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Prescribing Doctor</p>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">Dr. {doctorName}</h2>
              </div>
            </div>

            <hr className="border-slate-50" />

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Date</p>
                  <p className="font-bold text-slate-700">{new Date(prescription.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Prescription ID</p>
                  <p className="font-bold text-slate-700">#{prescription.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Reports */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Beaker className="h-5 w-5 text-rose-500" />
              Suggested Reports
            </h3>
            <div className="space-y-4">
              {prescription.reports && prescription.reports.length > 0 ? (
                prescription.reports.map((report: any) => (
                  <div key={report.id} className="p-4 rounded-2xl bg-rose-50/30 border border-rose-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{report.report_name}</p>
                      <Badge variant="outline" className="mt-1 text-[10px] bg-white border-rose-200 text-rose-600">
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Beaker className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 font-medium italic">No reports suggested</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Medications & Injections */}
        <div className="lg:col-span-2 space-y-8">
           {/* Clinical Notes */}
           {prescription.notes && (
            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden">
              <FileText className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 rotate-12" />
              <div className="relative z-10">
                <h3 className="text-sm font-black uppercase tracking-widest text-blue-100 mb-4 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Doctor's Instructions
                </h3>
                <p className="text-xl font-medium leading-relaxed italic">
                  "{prescription.notes}"
                </p>
              </div>
            </div>
          )}

          {/* Medicines Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Pill className="h-6 w-6" />
              </div>
              Prescribed Medicines
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {prescription.prescription_medicines?.map((med: any) => (
                <div key={med.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-emerald-200 hover:bg-white transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                      <Pill className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-900">{med.medicine_name}</p>
                      <p className="text-sm font-bold text-slate-500">{med.dosage}</p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <Badge className={`rounded-xl px-4 py-1.5 text-xs font-black uppercase tracking-widest ${
                      med.before_meal 
                        ? 'bg-amber-100 text-amber-700 border-amber-200' 
                        : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}>
                      {med.before_meal ? 'Before Meal' : 'After Meal'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Injections Section */}
          {prescription.prescription_injections && prescription.prescription_injections.length > 0 && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Syringe className="h-6 w-6" />
                </div>
                Prescribed Injections
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {prescription.prescription_injections.map((inj: any) => (
                  <div key={inj.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl bg-purple-50/30 border border-purple-100 hover:bg-white transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center border border-purple-100 group-hover:bg-purple-50 transition-colors">
                        <Syringe className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-900">{inj.injection_name}</p>
                        <p className="text-sm font-bold text-slate-500">{inj.dosage}</p>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <Badge className="rounded-xl px-4 py-1.5 text-xs font-black uppercase tracking-widest bg-purple-600 text-white border-none shadow-lg shadow-purple-100">
                        {inj.route}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
