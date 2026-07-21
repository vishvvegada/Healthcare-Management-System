import { Button } from '@/components/ui/button'
import { addHospital } from './actions'
import { ArrowLeft, Building } from 'lucide-react'
import Link from 'next/link'

export default async function NewHospitalPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/super-admin">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Hospital</h1>
          <p className="text-slate-500 text-sm">Register a new hospital in the system</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-8">
        {searchParams?.error && (
          <div className="mb-6 bg-red-50 text-red-500 p-4 rounded-lg text-sm border border-red-100">
            {searchParams.error}
          </div>
        )}

        <form action={addHospital} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Hospital Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="pl-10 appearance-none relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                placeholder="e.g. City General Hospital"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
              Full Address
            </label>
            <textarea
              name="address"
              id="address"
              rows={4}
              required
              className="appearance-none relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
              placeholder="e.g. 123 Health Ave, Medical District, NY 10001"
            />
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Link href="/dashboard/super-admin">
              <Button type="button" variant="outline" className="h-11">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8">
              Save Hospital
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
