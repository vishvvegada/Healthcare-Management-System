'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Clock, Calendar, CheckCircle2, Save, Loader2, Info, ChevronLeft, ChevronRight, CalendarPlus } from 'lucide-react'
import { updateDoctorSettings } from './actions'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

export default function DoctorSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  
  const [settings, setSettings] = useState({
    specialization: '',
    morning_start: '09:00',
    morning_end: '13:00',
    evening_start: '14:00',
    evening_end: '18:00',
    available_dates: [] as string[]
  })

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const supabase = createClient()

  useEffect(() => {
    async function fetchSettings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setSettings({
          specialization: data.specialization || '',
          morning_start: data.morning_start?.slice(0, 5) || '09:00',
          morning_end: data.morning_end?.slice(0, 5) || '13:00',
          evening_start: data.evening_start?.slice(0, 5) || '14:00',
          evening_end: data.evening_end?.slice(0, 5) || '18:00',
          available_dates: data.available_dates || []
        })
      }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const toggleDate = (dateStr: string) => {
    setSettings(prev => ({
      ...prev,
      available_dates: prev.available_dates.includes(dateStr)
        ? prev.available_dates.filter(d => d !== dateStr)
        : [...prev.available_dates, dateStr]
    }))
  }

  const addNextDays = (count: number) => {
    const newDates = [...settings.available_dates]
    const today = new Date()
    for (let i = 0; i < count; i++) {
      const d = new Date()
      d.setDate(today.getDate() + i)
      const dateStr = formatDate(d)
      if (!newDates.includes(dateStr)) {
        newDates.push(dateStr)
      }
    }
    setSettings(prev => ({ ...prev, available_dates: newDates }))
  }

  const clearDates = () => {
    setSettings(prev => ({ ...prev, available_dates: [] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    const formData = new FormData()
    formData.append('specialization', settings.specialization)
    formData.append('morning_start', settings.morning_start)
    formData.append('morning_end', settings.morning_end)
    formData.append('evening_start', settings.evening_start)
    formData.append('evening_end', settings.evening_end)
    formData.append('available_dates', JSON.stringify(settings.available_dates))

    try {
      const result = await updateDoctorSettings(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    
    const days = []
    // Add empty slots for days of previous month
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(<div key={`empty-${i}`} className="h-12 w-full" />)
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const dateStr = formatDate(date)
      const isSelected = settings.available_dates.includes(dateStr)
      const isToday = formatDate(new Date()) === dateStr
      const isPast = date < new Date(new Date().setHours(0,0,0,0))

      days.push(
        <button
          key={d}
          type="button"
          disabled={isPast}
          onClick={() => toggleDate(dateStr)}
          className={`h-12 w-full rounded-xl transition-all flex items-center justify-center font-bold text-sm border-2 ${
            isPast 
              ? 'text-slate-200 border-transparent cursor-not-allowed' 
              : isSelected 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' 
                : 'bg-white text-slate-700 border-slate-50 hover:border-emerald-200 hover:bg-emerald-50/50'
          } ${isToday && !isSelected ? 'border-blue-200 text-blue-600 bg-blue-50/30' : ''}`}
        >
          {d}
        </button>
      )
    }

    return days
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Practice Settings</h1>
          <p className="text-slate-500 mt-1">Manage your specialization and date-wise availability.</p>
        </div>
        <div className="flex gap-2">
           <Button 
            type="button" 
            variant="outline" 
            onClick={() => addNextDays(7)}
            className="rounded-xl font-bold text-xs h-9"
          >
            + Next 7 Days
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => addNextDays(30)}
            className="rounded-xl font-bold text-xs h-9"
          >
            + Next 30 Days
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Specialization Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Save className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">General Information</h2>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Specialization</label>
            <input
              type="text"
              value={settings.specialization}
              onChange={(e) => setSettings({ ...settings, specialization: e.target.value })}
              placeholder="e.g. Cardiologist, General Physician"
              className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-slate-900 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all bg-slate-50/50 font-bold outline-none"
            />
          </div>
        </div>

        {/* Available Dates Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Available Dates</h2>
            </div>
            <button 
              type="button"
              onClick={clearDates}
              className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Calendar UI */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-black text-slate-900">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-1">
                  <button 
                    type="button" 
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-slate-400" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {renderCalendar()}
              </div>
            </div>

            {/* Selection Summary */}
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold">
                <CalendarPlus className="h-5 w-5 text-emerald-600" />
                Selected Dates ({settings.available_dates.length})
              </div>
              
              <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-2 custom-scrollbar">
                {settings.available_dates.sort().map(date => (
                  <div key={date} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <span className="font-bold text-sm text-slate-700">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => toggleDate(date)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Info className="h-4 w-4 rotate-45" />
                    </button>
                  </div>
                ))}
                {settings.available_dates.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
                    <Calendar className="h-12 w-12 mb-3 opacity-20" />
                    <p className="text-sm font-medium">No dates selected.<br/>Select dates on the calendar.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Time Settings Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Morning Shift Section */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Morning Shift</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Start</label>
                <input
                  type="time"
                  value={settings.morning_start}
                  onChange={(e) => setSettings({ ...settings, morning_start: e.target.value })}
                  className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-slate-900 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all bg-slate-50/50 font-bold outline-none"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest px-1">End</label>
                <input
                  type="time"
                  value={settings.morning_end}
                  onChange={(e) => setSettings({ ...settings, morning_end: e.target.value })}
                  className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-slate-900 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all bg-slate-50/50 font-bold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Evening Shift Section */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Evening Shift</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Start</label>
                <input
                  type="time"
                  value={settings.evening_start}
                  onChange={(e) => setSettings({ ...settings, evening_start: e.target.value })}
                  className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-slate-900 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all bg-slate-50/50 font-bold outline-none"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest px-1">End</label>
                <input
                  type="time"
                  value={settings.evening_end}
                  onChange={(e) => setSettings({ ...settings, evening_end: e.target.value })}
                  className="w-full px-5 py-4 border border-slate-200 rounded-2xl text-slate-900 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all bg-slate-50/50 font-bold outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center animate-in slide-in-from-bottom">
              <Info className="h-5 w-5 mr-3 shrink-0" />
              <p className="font-bold">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex items-center animate-in slide-in-from-bottom">
              <CheckCircle2 className="h-5 w-5 mr-3 shrink-0" />
              <p className="font-bold">Settings updated successfully!</p>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="h-14 px-8 rounded-2xl font-bold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-12 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

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
