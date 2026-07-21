import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Mail, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { addSuperAdminStaff } from './actions'
import { SubmitButton } from '@/components/dashboard/SubmitButton'

function formatRoleName(name: string) {
  if (!name) return ''
  return name.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

export default async function NewSuperAdminStaffPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ error?: string }> }) {
  const params = await props.params
  const searchParams = await props.searchParams
  const hospitalId = parseInt(params.id)
  
  if (isNaN(hospitalId)) {
    redirect('/dashboard/super-admin')
  }
  
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('roles(name)')
    .eq('id', user.id)
    .single()

  if ((userData?.roles as any)?.name !== 'super_admin') {
    redirect('/dashboard')
  }

  const { data: hospital } = await supabase
    .from('hospitals')
    .select('name')
    .eq('id', hospitalId)
    .single()
  
  // Fetch available roles to populate the dropdown
  // Exclude super_admin, patient
  const { data: roles } = await supabase
    .from('roles')
    .select('*')
    .not('name', 'in', '("super_admin","patient")')

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Link href={`/dashboard/super-admin/hospitals/${hospitalId}`}>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add Staff Member</h1>
          <p className="text-slate-500 text-sm">Register a new user for {hospital?.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-8">
        {searchParams?.error && (
          <div className="mb-6 bg-red-50 text-red-500 p-4 rounded-lg text-sm border border-red-100">
            {searchParams.error}
          </div>
        )}

        <form action={addSuperAdminStaff} className="space-y-6">
          <input type="hidden" name="hospital_id" value={hospitalId} />
          
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
                  placeholder="John Doe"
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
                  placeholder="john@hospital.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-bold ml-1">**</span>
                </div>
                <input
                  type="text"
                  name="password"
                  id="password"
                  required
                  minLength={6}
                  className="pl-10 appearance-none block w-full px-4 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                  placeholder="Enter initial password"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Provide this password to the user so they can log in.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="role_id" className="block text-sm font-medium text-slate-700">Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                </div>
                <select
                  name="role_id"
                  id="role_id"
                  required
                  className="pl-10 appearance-none block w-full px-4 py-2.5 border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all bg-white"
                >
                  <option value="">Select a role...</option>
                  {roles?.map((role) => (
                    <option key={role.id} value={role.id}>
                      {formatRoleName(role.name)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end gap-3">
            <Link href={`/dashboard/super-admin/hospitals/${hospitalId}`}>
              <Button type="button" variant="outline" className="h-11">
                Cancel
              </Button>
            </Link>
            <SubmitButton className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8">
              Add Staff Member
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  )
}
