'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { formatDate } from '@/lib/utils'

export function DateFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const selectedDateStr = searchParams.get('date') || formatDate(new Date())
  const [viewDate, setViewDate] = useState(new Date(selectedDateStr))

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleDateSelect = (date: Date) => {
    const dateString = formatDate(date)
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', dateString)
    router.push(`${pathname}?${params.toString()}`)
    setIsOpen(false)
  }

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1)
    setViewDate(newDate)
  }

  const generateDays = () => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    // Padding for start of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const days = generateDays()
  const monthName = viewDate.toLocaleString('default', { month: 'long' })
  const year = viewDate.getFullYear()

  const isSelected = (date: Date) => {
    return formatDate(date) === selectedDateStr
  }

  const isToday = (date: Date) => {
    return formatDate(date) === formatDate(new Date())
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 bg-white border border-slate-200 p-2 pl-5 pr-4 rounded-2xl shadow-sm hover:border-blue-400 hover:shadow-md transition-all active:scale-[0.98] select-none"
      >
        <div className="flex items-center gap-2.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest shrink-0">
          <CalendarIcon className="h-4 w-4 text-blue-500" />
          <span>Filter Date</span>
        </div>
        <div className="h-5 w-px bg-slate-100" />
        <span className="text-slate-900 font-black text-sm tabular-nums">
          {new Date(selectedDateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </button>

      {/* Premium Popover Calendar */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 z-[100] bg-white rounded-[2rem] border border-slate-100 shadow-2xl p-6 min-w-[320px] animate-in fade-in zoom-in-95 duration-200">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <h4 className="font-black text-slate-900">{monthName}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{year}</p>
            </div>
            <button 
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => (
              <div key={i} className="aspect-square">
                {date ? (
                  <button
                    onClick={() => handleDateSelect(date)}
                    className={`w-full h-full flex items-center justify-center rounded-xl text-xs font-bold transition-all relative ${
                      isSelected(date) 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110 z-10' 
                        : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {date.getDate()}
                    {isToday(date) && !isSelected(date) && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                    )}
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
            <button 
              onClick={() => handleDateSelect(new Date())}
              className="flex-1 py-2 rounded-xl bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              Go to Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
