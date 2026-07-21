'use client'

import { useState, useMemo } from 'react'
import { Pill, Syringe, Calendar, User, ChevronRight, Search, Beaker } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Medicine {
  id: number
  medicine_name: string
  dosage: string
  before_meal: boolean
}

interface Injection {
  id: number
  injection_name: string
  dosage: string
  route: string
}

interface LabReport {
  id: number
  report_name: string
  status: string
}

interface Prescription {
  id: number
  notes: string | null
  created_at: string
  doctors: {
    users: { name: string } | { name: string }[]
  }
  prescription_medicines: Medicine[]
  prescription_injections: Injection[]
  reports: LabReport[]
}

interface PrescriptionHistoryClientProps {
  prescriptions: Prescription[]
}

export function PrescriptionHistoryClient({ prescriptions }: PrescriptionHistoryClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'doctor'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredAndSortedPrescriptions = useMemo(() => {
    let result = [...prescriptions]

    // Search filter
    if (searchTerm) {
      result = result.filter(p => {
        const doc = Array.isArray(p.doctors) ? p.doctors[0] : p.doctors;
        const docUsers = doc?.users;
        const doctorName = Array.isArray(docUsers) ? docUsers[0]?.name : docUsers?.name || '';
        return doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               p.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      } else {
        const docA = Array.isArray(a.doctors) ? a.doctors[0] : a.doctors;
        const docUsersA = docA?.users;
        const nameA = Array.isArray(docUsersA) ? docUsersA[0]?.name : docUsersA?.name || '';
        const docB = Array.isArray(b.doctors) ? b.doctors[0] : b.doctors;
        const docUsersB = docB?.users;
        const nameB = Array.isArray(docUsersB) ? docUsersB[0]?.name : docUsersB?.name || '';
        return sortOrder === 'desc' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB)
      }
    })

    return result
  }, [prescriptions, searchTerm, sortBy, sortOrder])

  const toggleSort = (type: 'date' | 'doctor') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(type)
      setSortOrder('desc')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => toggleSort('date')}
            className={`rounded-lg flex items-center gap-2 ${sortBy === 'date' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}`}
          >
            <Calendar className="h-4 w-4" />
            Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => toggleSort('doctor')}
            className={`rounded-lg flex items-center gap-2 ${sortBy === 'doctor' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}`}
          >
            <User className="h-4 w-4" />
            Doctor {sortBy === 'doctor' && (sortOrder === 'desc' ? '↓' : '↑')}
          </Button>
        </div>
      </div>

      {/* Prescription List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAndSortedPrescriptions.map((p) => {
          const doc = Array.isArray(p.doctors) ? p.doctors[0] : p.doctors;
          const docUsers = doc?.users;
          const doctorName = Array.isArray(docUsers) ? docUsers[0]?.name : docUsers?.name || 'Unknown';
          const medicineCount = p.prescription_medicines?.length || 0;
          const injectionCount = p.prescription_injections?.length || 0;
          const reportCount = p.reports?.length || 0;

          return (
            <Link 
              key={p.id}
              href={`/dashboard/patient/prescriptions/${p.id}`}
              className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors shadow-inner">
                  <Pill className="h-6 w-6 text-slate-400 group-hover:text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Dr. {doctorName}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="flex items-center gap-1"><Pill className="h-3 w-3" /> {medicineCount} Meds</span>
                    {injectionCount > 0 && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1 text-purple-600 font-medium"><Syringe className="h-3 w-3" /> {injectionCount} Inj</span>
                      </>
                    )}
                    {reportCount > 0 && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1 text-rose-600 font-medium"><Beaker className="h-3 w-3" /> {reportCount} Tests</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </Link>
          )
        })}

        {filteredAndSortedPrescriptions.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Pill className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-lg">No prescriptions found.</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or sorting filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}

