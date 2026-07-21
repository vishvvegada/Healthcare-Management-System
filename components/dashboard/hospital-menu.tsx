'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Trash2, AlertTriangle } from 'lucide-react'
import { deleteHospital } from '@/app/dashboard/super-admin/actions'
import { useRouter } from 'next/navigation'

interface HospitalMenuProps {
  hospitalId: number
  hospitalName: string
}

export function HospitalMenu({ hospitalId, hospitalName }: HospitalMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteHospital(hospitalId)
      if (result.success) {
        setIsOpen(false)
        setShowConfirm(false)
        router.refresh()
      }
    } catch (error) {
      console.error(error)
      alert("Failed to delete hospital. See console for details.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 py-1">
          <button
            onClick={() => {
              setShowConfirm(true)
              setIsOpen(false)
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete Hospital
          </button>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-xl font-bold">Delete Hospital?</h3>
            </div>
            
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{hospitalName}</span>? 
              <br /><br />
              This will:
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>Permanently delete the hospital record</li>
                <li>Delete all associated staff accounts (Admins, Doctors, etc.)</li>
                <li><span className="font-semibold">Note:</span> Patients will not be deleted, but will be decoupled from this hospital.</li>
              </ul>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
