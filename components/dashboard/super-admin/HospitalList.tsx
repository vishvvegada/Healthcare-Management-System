'use client'

import { useState } from 'react'
import { Building, MapPin, Search, ArrowRight, Calendar, Users, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HospitalMenu } from '@/components/dashboard/hospital-menu'
import Link from 'next/link'

interface Hospital {
  id: number
  name: string
  address: string
  created_at: string
}

interface HospitalListProps {
  initialHospitals: Hospital[]
}

export function HospitalList({ initialHospitals }: HospitalListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredHospitals = initialHospitals.filter((hospital) =>
    hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative max-w-xl group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <input
          type="text"
          placeholder="Find a hospital by name or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/30 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-slate-900"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredHospitals.map((hospital) => (
          <div key={hospital.id} className="bg-white rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/40 p-8 flex flex-col transition-all hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-1 group relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -right-6 -top-6 h-32 w-32 bg-blue-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="h-16 w-16 rounded-3xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-inner">
                <Building className="h-8 w-8" />
              </div>
              <HospitalMenu hospitalId={hospital.id} hospitalName={hospital.name} />
            </div>

            <div className="relative z-10 flex-1">
              <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-1">{hospital.name}</h3>
              
              <div className="flex items-start text-sm text-slate-500 mb-6 leading-relaxed">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-blue-500" />
                <p className="line-clamp-2 font-medium">{hospital.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined</p>
                   <p className="text-xs font-bold text-slate-900 flex items-center">
                     <Calendar className="h-3 w-3 mr-1 text-blue-500" />
                     <span suppressHydrationWarning>
                       {new Date(hospital.created_at).toLocaleDateString()}
                     </span>
                   </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Network</p>
                   <p className="text-xs font-bold text-slate-900 flex items-center">
                     <Globe className="h-3 w-3 mr-1 text-emerald-500" />
                     Verified
                   </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 flex justify-between items-center relative z-10 mt-auto">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-7 w-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400">
                    <Users className="h-3 w-3" />
                  </div>
                ))}
              </div>
              <Link href={`/dashboard/super-admin/hospitals/${hospital.id}`}>
                <Button className="rounded-xl h-10 px-5 bg-slate-900 hover:bg-blue-600 text-white font-black text-xs transition-all flex items-center gap-2 group/btn">
                  Manage Facility
                  <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        ))}

        {filteredHospitals.length === 0 && (
          <div className="col-span-full bg-white rounded-[3rem] border border-dashed border-slate-200 p-20 text-center flex flex-col items-center shadow-inner">
            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 shadow-sm">
              <Building className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Facility Not Found</h3>
            <p className="text-slate-500 max-w-sm mb-10 font-medium">
              {searchQuery ? `We couldn't find any hospitals matching "${searchQuery}". Please try another search term.` : "Your healthcare network is currently empty. Start by adding your first hospital facility."}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/super-admin/hospitals/new">
                <Button className="bg-blue-600 hover:bg-blue-700 h-14 px-10 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all active:scale-95">
                  Register Your First Hospital
                </Button>
              </Link>
            )}
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
                className="h-12 px-8 rounded-xl font-black border-slate-200 hover:bg-slate-50 transition-all"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
