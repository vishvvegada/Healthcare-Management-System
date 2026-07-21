import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Mail, Calendar, Users as UsersIcon } from 'lucide-react'
import Link from 'next/link'
import { registerPatient } from './actions'

export default async function NewPatientPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/receptionist/patients">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Register New Patient</h1>
          <p className="text-slate-500 text-sm">Create a new patient record in the system</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-8">
        {searchParams?.error && (
          <div className="mb-6 bg-red-50 text-red-500 p-4 rounded-lg text-sm border border-red-100">
            {searchParams.error}
          </div>
        )}

        <form action={registerPatient} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="pl-10 appearance-none block w-full px-4 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                  placeholder="Patient Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="pl-10 appearance-none block w-full px-4 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                  placeholder="patient@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  className="pl-10 appearance-none block w-full px-4 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="age" className="block text-sm font-medium text-slate-700">Age</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    name="age"
                    id="age"
                    min="1"
                    max="150"
                    required
                    className="pl-10 appearance-none block w-full px-4 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                    placeholder="e.g. 35"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="gender" className="block text-sm font-medium text-slate-700">Gender</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UsersIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    name="gender"
                    id="gender"
                    required
                    className="pl-10 appearance-none block w-full px-4 py-2.5 border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all bg-white"
                  >
                    <option value="">Select gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end gap-3">
            <Link href="/dashboard/receptionist/patients">
              <Button type="button" variant="outline" className="h-11">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8">
              Register Patient
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
