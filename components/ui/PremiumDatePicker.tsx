'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface PremiumDatePickerProps {
  value: string
  onChange: (date: string) => void
  label?: string
}

export function PremiumDatePicker({ value, onChange, label }: PremiumDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedDate = value ? new Date(value) : new Date()

  // Generate 14 days from today for a quick-select scroll
  const quickDates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest text-center">
          {label}
        </label>
      )}
      
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {quickDates.map((d) => {
          const dateStr = formatDate(d)
          const isSelected = value === dateStr
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
          const dayNum = d.toLocaleDateString('en-US', { day: 'numeric' })
          const monthName = d.toLocaleDateString('en-US', { month: 'short' })

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onChange(dateStr)}
              className={`min-w-[70px] p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 shrink-0 ${
                isSelected 
                  ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50 shadow-md shadow-blue-100' 
                  : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                {dayName}
              </span>
              <span className={`text-xl font-black ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                {dayNum}
              </span>
              <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}>
                {monthName}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
