'use client'

import { useState } from 'react'
import { Syringe, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrescriptionInjectionList() {
  const [injections, setInjections] = useState<number[]>([])

  const addInjection = () => {
    const nextId = injections.length > 0 ? Math.max(...injections) + 1 : 1
    setInjections([...injections, nextId])
  }

  const removeInjection = (id: number) => {
    setInjections(injections.filter(i => i !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center">
          <Syringe className="h-5 w-5 mr-2 text-purple-600" />
          Prescribe Injections
        </h3>
        <Button 
          type="button" 
          onClick={addInjection}
          variant="outline" 
          size="sm"
          className="rounded-lg border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 font-bold flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Injection
        </Button>
      </div>
      
      {injections.length > 0 ? (
        injections.map((id, index) => (
          <div key={id} className="group relative bg-purple-50/30 p-4 rounded-xl border border-purple-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="md:col-span-5 space-y-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Injection {index + 1}</label>
              <input
                type="text"
                name={`injection_${id}_name`}
                placeholder="e.g. Ceftriaxone 1g"
                required
                className="block w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all bg-white font-medium"
              />
            </div>
            <div className="md:col-span-4 space-y-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Dosage</label>
              <input
                type="text"
                name={`injection_${id}_dosage`}
                placeholder="e.g. 1 vial"
                required
                className="block w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all bg-white font-medium"
              />
            </div>
            <div className="md:col-span-3 space-y-1 relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Route</label>
              <select 
                name={`injection_${id}_route`}
                className="block w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all bg-white font-medium"
              >
                <option value="IM">IM (Intramuscular)</option>
                <option value="IV">IV (Intravenous)</option>
                <option value="SC">SC (Subcutaneous)</option>
                <option value="ID">ID (Intradermal)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => removeInjection(id)}
              className="absolute -top-2 -right-2 h-6 w-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-red-200 hover:bg-red-200"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))
      ) : (
        <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Syringe className="h-8 w-8 text-slate-300 mx-auto mb-2 opacity-50" />
          <p className="text-xs text-slate-400 font-medium italic">No injections prescribed</p>
        </div>
      )}

      <input type="hidden" name="injection_ids" value={injections.join(',')} />
    </div>
  )
}
