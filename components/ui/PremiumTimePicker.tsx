'use client'

import { Clock, Info, CheckCircle2, XCircle, Calendar } from 'lucide-react'
import { useMemo } from 'react'

interface PremiumTimePickerProps {
  value: string
  onChange: (time: string) => void
  label?: string
  selectedDate?: string
  bookedSlots?: string[] // HH:MM
  morningStart?: string
  morningEnd?: string
  eveningStart?: string
  eveningEnd?: string
  availableDates?: string[]
  workingDays?: string[] // ['Monday', 'Tuesday', ...]
}

export function PremiumTimePicker({ 
  value, 
  onChange, 
  label, 
  selectedDate,
  bookedSlots = [],
  morningStart = '09:00',
  morningEnd = '13:00',
  eveningStart = '14:00',
  eveningEnd = '18:00',
  availableDates = [],
  workingDays = []
}: PremiumTimePickerProps) {
  
  // Check if selected date is an available date or a working day
  const isWorkingDay = useMemo(() => {
    if (!selectedDate) return true

    // If specific available dates are provided, check those first
    if (availableDates.length > 0) {
      return availableDates.includes(selectedDate)
    }

    // If working days are provided (e.g., ['Monday', 'Tuesday']), check the day of the week
    if (workingDays && workingDays.length > 0) {
      const dayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })
      return workingDays.includes(dayName)
    }

    return true
  }, [selectedDate, availableDates, workingDays])

  // Generate slots based on shift start/end time
  const generateSlots = (start: string | undefined, end: string | undefined) => {
    if (!start || !end) return []
    const slots = []
    const [startH, startM] = start.split(':').map(Number)
    const [endH, endM] = end.split(':').map(Number)
    
    for (let h = startH; h <= endH; h++) {
      for (let m = 0; m < 60; m += 10) {
        // Stop if we exceed end time
        if (h === endH && m >= endM) break
        
        const hh = h.toString().padStart(2, '0')
        const mm = m.toString().padStart(2, '0')
        slots.push(`${hh}:${mm}`)
      }
    }
    return slots
  }

  const morningSlotsRaw = useMemo(() => generateSlots(morningStart, morningEnd), [morningStart, morningEnd])
  const eveningSlotsRaw = useMemo(() => generateSlots(eveningStart, eveningEnd), [eveningStart, eveningEnd])

  const filterPastSlots = (slots: string[]) => {
    if (!selectedDate) return slots
    
    const todayStr = new Date().toISOString().split('T')[0]
    if (selectedDate !== todayStr) return slots

    const now = new Date()
    const currentHour = now.getHours()
    const currentMin = now.getMinutes()

    return slots.filter(slot => {
      const [h, m] = slot.split(':').map(Number)
      if (h > currentHour) return true
      if (h === currentHour && m > currentMin) return true
      return false
    })
  }

  const morningSlots = useMemo(() => filterPastSlots(morningSlotsRaw), [selectedDate, morningSlotsRaw])
  const eveningSlots = useMemo(() => filterPastSlots(eveningSlotsRaw), [selectedDate, eveningSlotsRaw])

  const noSlotsAvailable = isWorkingDay && morningSlots.length === 0 && eveningSlots.length === 0

  const renderSlot = (t: string) => {
    const isBooked = bookedSlots.includes(t)
    const isSelected = value === t

    let styles = ''
    if (isBooked) {
      styles = 'border-red-100 bg-red-50 text-red-400 cursor-not-allowed opacity-60'
    } else if (isSelected) {
      styles = 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100 scale-105 z-10'
    } else {
      styles = 'border-emerald-50 bg-emerald-50 text-emerald-700 hover:border-emerald-200 hover:bg-white'
    }

    return (
      <button
        key={t}
        type="button"
        disabled={isBooked}
        onClick={() => onChange(t)}
        className={`py-2 rounded-lg border-2 font-bold text-[11px] transition-all relative flex flex-col items-center justify-center gap-0.5 ${styles}`}
      >
        <span>{t}</span>
        {isBooked ? (
          <span className="text-[7px] uppercase tracking-tighter font-black text-red-300">Booked</span>
        ) : (
          <span className={`text-[7px] uppercase tracking-tighter font-black ${isSelected ? 'text-blue-200' : 'text-emerald-400'}`}>
            Available
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="space-y-6">
      {label && (
        <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest text-center">
          {label}
        </label>
      )}

      {/* Legend */}
      <div className="flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-200" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-red-100 border border-red-200" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-blue-600 shadow-sm shadow-blue-200" />
          <span>Selected</span>
        </div>
      </div>
      
      {!isWorkingDay ? (
        <div className="p-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">Not Available</h3>
          <p className="text-slate-500 mt-2 font-medium">The doctor does not work on this day.<br/>Please select another date.</p>
        </div>
      ) : noSlotsAvailable ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Info className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-sm leading-relaxed">
            No more slots available for today.<br/>Please pick another date.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Morning Slots */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest px-2">
              <Clock className="h-4 w-4" />
              Morning Shift ({morningStart} - {morningEnd})
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {morningSlots.map(renderSlot)}
              {morningSlots.length === 0 && (
                <div className="col-span-full py-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  No slots
                </div>
              )}
            </div>
          </div>

          {/* Evening Shift Slots */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest px-2">
              <Clock className="h-4 w-4" />
              Evening Shift ({eveningStart} - {eveningEnd})
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {eveningSlots.map(renderSlot)}
              {eveningSlots.length === 0 && (
                <div className="col-span-full py-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  No slots
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  )
}
