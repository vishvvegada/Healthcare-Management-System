'use client'

import { Search, Filter, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export function ReceptionistFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')

  // Update search params
  const updateParams = (newSearch: string, newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (newSearch) params.set('q', newSearch)
    else params.delete('q')
    
    if (newStatus !== 'all') params.set('status', newStatus)
    else params.delete('status')
    
    // Reset date if searching/filtering? Maybe not.
    
    router.push(`?${params.toString()}`)
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams.get('q') || '')) {
        updateParams(search, status)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    updateParams(search, newStatus)
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('all')
    router.push('?')
  }

  const hasFilters = search || status !== 'all'

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-3xl">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search patient or doctor name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-600 placeholder:text-slate-400"
        />
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full sm:w-auto">
        <button
          onClick={() => handleStatusChange('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            status === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleStatusChange('booked')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            status === 'booked' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Booked
        </button>
        <button
          onClick={() => handleStatusChange('cancelled')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            status === 'cancelled' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Cancelled
        </button>
      </div>

      {hasFilters && (
        <button 
          onClick={clearFilters}
          className="p-3 text-slate-400 hover:text-red-500 transition-colors"
          title="Clear Filters"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
