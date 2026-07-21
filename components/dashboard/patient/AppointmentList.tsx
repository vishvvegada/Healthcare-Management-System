'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { cancelAppointment } from '@/app/dashboard/patient/appointments/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Appointment {
  id: number
  appointment_date: string
  status: string
  visit_type?: string
  updated_at?: string
  time_slots: { slot_time: string } | { slot_time: string }[] | null
  doctors: {
    specialization: string | null
    users: { name: string } | { name: string }[] | null
  } | null
}

interface AppointmentListProps {
  initialAppointments: Appointment[]
  cancelledCount: number
}

export function AppointmentList({ initialAppointments, cancelledCount }: AppointmentListProps) {
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [showConfirmId, setShowConfirmId] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleCancel = async (id: number) => {
    setIsProcessing(true)
    try {
      await cancelAppointment(id)
      setShowConfirmId(null)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to cancel appointment. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cancellation Counter Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-red-200 transition-all">
          <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center transition-colors group-hover:bg-red-600 group-hover:text-white">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Cancelled</p>
            <p className="text-3xl font-black text-slate-900">{cancelledCount}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-blue-200 transition-all">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center transition-colors group-hover:bg-blue-600 group-hover:text-white">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active</p>
            <p className="text-3xl font-black text-slate-900">
              {initialAppointments.filter(a => a.status === 'booked').length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-emerald-200 transition-all">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-colors group-hover:bg-emerald-600 group-hover:text-white">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Completed</p>
            <p className="text-3xl font-black text-slate-900">
              {initialAppointments.filter(a => a.status === 'completed').length}
            </p>
          </div>
        </div>
      </div>

      {initialAppointments.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-900">No appointments found</p>
          <p className="mt-1">You haven&apos;t booked any appointments yet or they have been archived.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {initialAppointments.map((apt) => {
              if (!apt) return null
              const usersData = apt.doctors?.users;
              const doctorName = Array.isArray(usersData) ? usersData[0]?.name : usersData?.name || 'Unknown Doctor';
              const spec = apt.doctors?.specialization || 'General'
              
              const slots = apt.time_slots
              const slotTimeRaw = Array.isArray(slots) ? slots[0]?.slot_time : slots?.slot_time
              const slotTime = slotTimeRaw ? slotTimeRaw.slice(0, 5) : '--:--'
              
              let statusColor = 'bg-slate-100 text-slate-800'
              if (apt.status === 'booked') statusColor = 'bg-blue-50 text-blue-700 border-blue-200'
              if (apt.status === 'completed') statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200'
              if (apt.status === 'cancelled') statusColor = 'bg-red-50 text-red-700 border-red-200'

              const isBooked = apt.status === 'booked'

              return (
                <div key={apt.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  <div className="flex gap-4 items-start">
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-900 text-lg">Dr. {doctorName}</h3>
                        <Badge variant="outline" className={`${statusColor} capitalize px-2.5 py-0.5 text-[10px] font-bold tracking-wider`}>
                          {apt.status}
                        </Badge>
                        {apt.visit_type && (
                          <Badge variant="secondary" className={`${apt.visit_type === 'New' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'} px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter`}>
                            {apt.visit_type === 'New' ? 'New Case' : 'Follow-up'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 font-medium">{spec}</p>
                      
                      <div className="flex flex-wrap gap-4 mt-3 text-sm font-semibold text-slate-600">
                        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {new Date(apt.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg">
                          <Clock className="h-4 w-4 text-slate-400" />
                          {slotTime}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {isBooked && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowConfirmId(apt.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 hover:border-red-200 gap-2 h-9 px-4 rounded-xl font-bold transition-all"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel
                      </Button>
                    )}
                    
                    <Link href={`/dashboard/patient/appointments/${apt.id}`} className="flex-1 md:flex-none">
                      <Button variant="outline" size="sm" className="w-full h-9 px-4 rounded-xl font-bold border-slate-200 hover:bg-slate-50">
                        Details
                      </Button>
                    </Link>
                  </div>

                  {/* Confirmation Modal */}
                  {showConfirmId === apt.id && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                      <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                          <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle className="h-8 w-8" />
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900 mb-2">Cancel Appointment?</h3>
                          <p className="text-slate-500 mb-8 leading-relaxed">
                            Are you sure you want to cancel your appointment with <span className="font-bold text-slate-700">Dr. {doctorName}</span>? This action cannot be undone.
                          </p>
                          
                          <div className="flex flex-col w-full gap-3">
                            <Button 
                              onClick={() => handleCancel(apt.id)}
                              disabled={isProcessing}
                              className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-2xl font-bold shadow-lg shadow-red-200 transition-all active:scale-95"
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                  Cancelling...
                                </>
                              ) : (
                                'Yes, Cancel Appointment'
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              onClick={() => setShowConfirmId(null)}
                              disabled={isProcessing}
                              className="w-full h-12 rounded-2xl font-bold text-slate-500 hover:bg-slate-50"
                            >
                              Keep Appointment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
