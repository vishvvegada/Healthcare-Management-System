'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Calendar, 
  Clock, 
  Building, 
  Search, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Stethoscope,
  Info,
  CalendarCheck
} from 'lucide-react'
import Link from 'next/link'
import { bookAppointment, getBookedSlots } from '@/app/dashboard/patient/appointments/new/actions'
import { PremiumDatePicker } from '@/components/ui/PremiumDatePicker'
import { PremiumTimePicker } from '@/components/ui/PremiumTimePicker'

interface Hospital {
  id: number
  name: string
  address?: string
}

interface Doctor {
  id: number
  specialization: string | null
  morning_start?: string
  morning_end?: string
  evening_start?: string
  evening_end?: string
  available_dates?: string[]
  users: { name: string } | { name: string }[] | null
  hospitals: { id: number, name: string } | { id: number, name: string }[] | null
}

interface BookingFormProps {
  doctors: Doctor[]
  hospitals: Hospital[]
  error?: string
}

type Step = 1 | 2 | 3 | 4

export function BookingForm({ doctors, hospitals, error: serverError }: BookingFormProps) {
  const [step, setStep] = useState<Step>(1)
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('')
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('')
  const [hospitalSearch, setHospitalSearch] = useState('')
  const [doctorSearch, setDoctorSearch] = useState('')
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

  const filteredHospitals = useMemo(() => 
    hospitals.filter(h => 
      h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) || 
      (h.address || '').toLowerCase().includes(hospitalSearch.toLowerCase())
    ), [hospitals, hospitalSearch])

  const filteredDoctors = useMemo(() => {
    let result = doctors
    if (selectedHospitalId) {
      result = result.filter(d => {
        const h = Array.isArray(d.hospitals) ? d.hospitals[0] : d.hospitals
        return h?.id.toString() === selectedHospitalId
      })
    }
    if (doctorSearch) {
      result = result.filter(d => {
        const name = Array.isArray(d.users) ? d.users[0]?.name : d.users?.name
        return name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
               d.specialization?.toLowerCase().includes(doctorSearch.toLowerCase())
      })
    }
    return result
  }, [doctors, selectedHospitalId, doctorSearch])

  const selectedHospital = hospitals.find(h => h.id.toString() === selectedHospitalId)
  const selectedDoctor = doctors.find(d => d.id.toString() === selectedDoctorId)
  const doctorName = selectedDoctor ? (Array.isArray(selectedDoctor.users) ? selectedDoctor.users[0]?.name : selectedDoctor.users?.name) : ''

  const nextStep = () => setStep(s => (s < 4 ? s + 1 : s) as Step)
  const prevStep = () => setStep(s => (s > 1 ? s - 1 : s) as Step)

  const canContinue = () => {
    if (step === 1) return !!selectedHospitalId
    if (step === 2) return !!selectedDoctorId
    if (step === 3) return !!appointmentDate && !!slotTime
    return true
  }

  return (
    <div className="space-y-8">
      {/* Progress Stepper */}
      <div className="flex justify-between items-center max-w-2xl mx-auto mb-12">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex flex-col items-center flex-1 relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 transition-all duration-300 ${
              step >= s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'
            }`}>
              {step > s ? <CheckCircle2 className="h-6 w-6" /> : s}
            </div>
            <span className={`mt-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              step >= s ? 'text-blue-600' : 'text-slate-400'
            }`}>
              {s === 1 ? 'Hospital' : s === 2 ? 'Doctor' : s === 3 ? 'Schedule' : 'Confirm'}
            </span>
            {s < 4 && (
              <div className={`absolute top-5 left-1/2 w-full h-[2px] -z-0 transition-colors duration-500 ${
                step > s ? 'bg-blue-600' : 'bg-slate-100'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border shadow-xl shadow-slate-200/50 overflow-hidden">
        {serverError && (
          <div className="m-8 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center animate-in slide-in-from-top">
            <Info className="h-5 w-5 mr-2 shrink-0" />
            {serverError}
          </div>
        )}

        <div className="p-8 md:p-12">
          {/* Step 1: Hospital */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Select a Hospital</h2>
                  <p className="text-slate-500 mt-1">Where would you like to receive care?</p>
                </div>
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or city..."
                    value={hospitalSearch}
                    onChange={(e) => setHospitalSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHospitals.map((h) => {
                  const isSelected = selectedHospitalId === h.id.toString()
                  return (
                    <div 
                      key={h.id} 
                      onClick={() => setSelectedHospitalId(h.id.toString())}
                      className={`group relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-4 ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/30 ring-4 ring-blue-50' 
                          : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-3 rounded-xl w-fit transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                        <Building className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className={`font-bold text-lg ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{h.name}</h4>
                        <div className="flex items-start mt-2 text-sm text-slate-500 leading-relaxed">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                          <p>{h.address || 'No address provided'}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-1 animate-in zoom-in">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  )
                })}
                {filteredHospitals.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Building className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No hospitals found matching your search.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Doctor */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Choose Your Specialist</h2>
                  <p className="text-slate-500 mt-1">
                    Available doctors at <span className="font-semibold text-blue-600">{selectedHospital?.name}</span>
                  </p>
                </div>
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or specialty..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((d) => {
                  const isSelected = selectedDoctorId === d.id.toString()
                  const name = Array.isArray(d.users) ? d.users[0]?.name : d.users?.name
                  return (
                    <div 
                      key={d.id} 
                      onClick={() => setSelectedDoctorId(d.id.toString())}
                      className={`group relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-4 ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/30 ring-4 ring-blue-50' 
                          : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-14 w-14 rounded-full flex items-center justify-center font-bold text-xl transition-colors ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                        }`}>
                          {name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className={`font-bold text-lg ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>Dr. {name}</h4>
                          <div className="flex items-center text-sm text-slate-500 mt-0.5">
                            <Stethoscope className="h-3.5 w-3.5 mr-1.5" />
                            {d.specialization}
                          </div>
                        </div>
                      </div>
                      
                      {!selectedHospitalId && (
                        <div className="pt-4 mt-auto border-t border-slate-100">
                          <div className="flex items-center text-xs text-slate-400">
                            <Building className="h-3 w-3 mr-1.5" />
                            {(Array.isArray(d.hospitals) ? d.hospitals[0]?.name : d.hospitals?.name)}
                          </div>
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-1 animate-in zoom-in">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  )
                })}
                {filteredDoctors.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No doctors available matching your criteria.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pick Your Time</h2>
                <p className="text-slate-500 mt-1">Select a convenient date and time slot for Dr. {doctorName}</p>
              </div>

              {/* Reusable Premium Date Picker */}
              <PremiumDatePicker 
                value={appointmentDate} 
                onChange={setAppointmentDate} 
                label="Available Dates" 
              />

              {/* Reusable Premium Time Picker */}
              <PremiumTimePicker 
                value={slotTime} 
                onChange={setSlotTime} 
                label="Select Time Slot" 
                selectedDate={appointmentDate}
                bookedSlots={bookedSlots}
                morningStart={selectedDoctor?.morning_start?.slice(0, 5)}
                morningEnd={selectedDoctor?.morning_end?.slice(0, 5)}
                eveningStart={selectedDoctor?.evening_start?.slice(0, 5)}
                eveningEnd={selectedDoctor?.evening_end?.slice(0, 5)}
                availableDates={selectedDoctor?.available_dates}
              />

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4 max-w-2xl mx-auto">
                <Info className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 leading-relaxed">
                  <p className="font-bold">Booking Summary:</p>
                  <p className="mt-1">
                    {appointmentDate && slotTime 
                      ? `You are booking for ${new Date(appointmentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at ${slotTime}.`
                      : "Please select a date and time slot to continue."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <form action={bookAppointment} className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto text-center space-y-10">
              <div>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-6">
                  <CalendarCheck className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Review Your Booking</h2>
                <p className="text-slate-500 mt-2 text-lg">Please check the details below before confirming</p>
              </div>

              <div className="bg-slate-50 rounded-3xl p-8 space-y-6 text-left border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hospital</p>
                    <p className="text-lg font-bold text-slate-900">{selectedHospital?.name}</p>
                    <p className="text-sm text-slate-500">{selectedHospital?.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Specialist</p>
                    <p className="text-lg font-bold text-slate-900">Dr. {doctorName}</p>
                    <p className="text-sm text-slate-500">{selectedDoctor?.specialization}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</p>
                      <p className="text-lg font-bold text-slate-900">{appointmentDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time</p>
                      <p className="text-lg font-bold text-slate-900">{slotTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hidden Inputs for the Form */}
              <input type="hidden" name="hospital_id" value={selectedHospitalId} />
              <input type="hidden" name="doctor_id" value={selectedDoctorId} />
              <input type="hidden" name="appointment_date" value={appointmentDate} />
              <input type="hidden" name="slot_time" value={slotTime} />

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-16 text-xl font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95"
              >
                Confirm and Book Appointment
              </Button>
            </form>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="bg-slate-50 border-t p-6 flex justify-between items-center px-8 md:px-12">
          {step > 1 ? (
            <Button 
              variant="outline" 
              onClick={prevStep}
              className="h-12 px-6 rounded-xl font-bold text-slate-600 hover:bg-white transition-all flex items-center gap-2"
            >
              <ChevronLeft className="h-5 w-5" />
              Back
            </Button>
          ) : (
            <Link href="/dashboard/patient/appointments">
              <Button variant="ghost" className="text-slate-500 font-bold hover:bg-slate-100 rounded-xl">
                Cancel
              </Button>
            </Link>
          )}

          {step < 4 && (
            <Button 
              disabled={!canContinue()}
              onClick={nextStep}
              className={`h-12 px-8 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${
                canContinue() 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 scale-100' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed scale-95'
              }`}
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
