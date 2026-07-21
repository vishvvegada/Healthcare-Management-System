'use client'

import { useState } from 'react'
import { Pill, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrescriptionMedicineList() {
  const [medicineCount, setMedicineCount] = useState(3)
  const [medicines, setMedicines] = useState([1, 2, 3])

  const addMedicine = () => {
    const nextId = medicines.length > 0 ? Math.max(...medicines) + 1 : 1
    setMedicines([...medicines, nextId])
  }

  const removeMedicine = (id: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter(m => m !== id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center">
          <Pill className="h-5 w-5 mr-2 text-blue-600" />
          Prescribe Medicines
        </h3>
        <Button 
          type="button" 
          onClick={addMedicine}
          variant="outline" 
          size="sm"
          className="rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Medicine
        </Button>
      </div>
      
      {medicines.map((id, index) => (
        <div key={id} className="group relative bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="md:col-span-5 space-y-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Medicine {index + 1}</label>
            <input
              type="text"
              name={`medicine_${id}_name`}
              placeholder="e.g. Paracetamol 500mg"
              required={index === 0}
              className="block w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white font-medium"
            />
          </div>
          <div className="md:col-span-4 space-y-1">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Dosage</label>
            <select 
              name={`medicine_${id}_dosage`}
              required={index === 0}
              className="block w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white font-medium"
            >
              <option value="">Select...</option>
              <option value="1-0-1">1-0-1 (Morning, Night)</option>
              <option value="1-1-1">1-1-1 (Morning, Noon, Night)</option>
              <option value="1-0-0">1-0-0 (Morning only)</option>
              <option value="0-1-0">0-1-0 (Noon only)</option>
              <option value="0-0-1">0-0-1 (Night only)</option>
              <option value="SOS">SOS (As needed)</option>
            </select>
          </div>
          <div className="md:col-span-3 space-y-1 relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Timing</label>
            <select 
              name={`medicine_${id}_timing`}
              className="block w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white font-medium"
            >
              <option value="after">After Meal</option>
              <option value="before">Before Meal</option>
            </select>
          </div>

          {medicines.length > 1 && (
            <button
              type="button"
              onClick={() => removeMedicine(id)}
              className="absolute -top-2 -right-2 h-6 w-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-red-200 hover:bg-red-200"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}

      <input type="hidden" name="medicine_ids" value={medicines.join(',')} />
    </div>
  )
}
