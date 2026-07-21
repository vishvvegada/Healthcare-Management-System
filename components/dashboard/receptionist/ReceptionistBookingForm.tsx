'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { User, Info } from 'lucide-react'
import Link from 'next/link'
import { PremiumDatePicker } from '@/components/ui/PremiumDatePicker'
import { PremiumTimePicker } from '@/components/ui/PremiumTimePicker'
import { bookAppointment } from '@/app/dashboard/receptionist/appointments/new/actions'
import { getBookedSlots } from '@/app/dashboard/patient/appointments/new/actions'
import { useEffect } from 'react'

interface ReceptionistBookingFormProps {
  doctors: any[]
  patients: any[]
}

export function ReceptionistBookingForm({ doctors, patients }: ReceptionistBookingFormProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [slotTime, setSlotTime] = useState('')
  const [bookedSlots, setBookedSlots] = useState<string[]>([])

  // Fetch real-time availability
  useEffect(() => {
    async function fetchAvailability() {
      if (selectedDoctorId && appointmentDate) {
        const booked = await getBookedSlots(parseInt(selectedDoctorId), appointmentDate)
        setBookedSlots(booked)
      }
    }
    fetchAvailability()
  }, [selectedDoctorId, appointmentDate])

  return (
    <form action={bookAppointment} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label htmlFor="patient_id" className="block text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Select Patient</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <select
              name="patient_id"
              id="patient_id"
              required
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="pl-12 appearance-none block w-full px-4 py-4 border border-slate-200 text-slate-900 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-600 sm:text-sm transition-all bg-slate-50/50 font-bold outline-none"
            >
              <option value="">Choose a patient...</option>
              {patients?.map((p) => (
                <option key={p.id} value={p.id}>
                  {(p.users as any)?.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="doctor_id" className="block text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Select Doctor</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <select
              name="doctor_id"
              id="doctor_id"
              required
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="pl-12 appearance-none block w-full px-4 py-4 border border-slate-200 text-slate-900 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-600 sm:text-sm transition-all bg-slate-50/50 font-bold outline-none"
            >
              <option value="">Choose a doctor...</option>
              {doctors?.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {(d.users as any)?.name} ({d.specialization})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-10 bg-slate-50/30 p-8 rounded-[2rem] border border-slate-100">
        <PremiumDatePicker 
          value={appointmentDate} 
          onChange={setAppointmentDate} 
          label="Appointment Date" 
        />
        
        <PremiumTimePicker 
          value={slotTime} 
          onChange={setSlotTime} 
          label="Appointment Time" 
          selectedDate={appointmentDate}
          bookedSlots={bookedSlots}
          morningStart={doctors.find(d => d.id.toString() === selectedDoctorId)?.morning_start?.slice(0, 5)}
          morningEnd={doctors.find(d => d.id.toString() === selectedDoctorId)?.morning_end?.slice(0, 5)}
          eveningStart={doctors.find(d => d.id.toString() === selectedDoctorId)?.evening_start?.slice(0, 5)}
          eveningEnd={doctors.find(d => d.id.toString() === selectedDoctorId)?.evening_end?.slice(0, 5)}
          workingDays={doctors.find(d => d.id.toString() === selectedDoctorId)?.working_days}
        />
      </div>

      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
        <Info className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 leading-relaxed">
          <p className="font-bold">Booking Summary:</p>
          <p className="mt-1">
            {appointmentDate && slotTime 
              ? `Patient will be booked for ${new Date(appointmentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at ${slotTime}.`
              : "Please select a date and time slot to complete the booking."}
          </p>
        </div>
      </div>

      {/* Hidden inputs for form submission */}
      <input type="hidden" name="appointment_date" value={appointmentDate} />
      <input type="hidden" name="slot_time" value={slotTime} />

      <div className="pt-6 border-t flex justify-end gap-3">
        <Link href="/dashboard/receptionist">
          <Button type="button" variant="ghost" className="h-12 px-8 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">
            Cancel
          </Button>
        </Link>
        <Button 
          type="submit" 
          disabled={!appointmentDate || !slotTime || !selectedDoctorId || !selectedPatientId}
          className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-12 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          Confirm Booking
        </Button>
      </div>
    </form>
  )
}
