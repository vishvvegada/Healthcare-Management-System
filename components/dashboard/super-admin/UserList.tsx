'use client'

import { useState } from 'react'
import { Users as UsersIcon, Mail, Shield, Building, Calendar, Search, Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  name: string
  email: string
  created_at: string
  roles: { name: string } | { name: string }[] | null
  hospitals: { name: string } | { name: string }[] | null
}

interface UserListProps {
  initialUsers: User[]
}

export function UserList({ initialUsers }: UserListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = initialUsers.filter((user) => {
    const roleName = Array.isArray(user.roles) ? user.roles[0]?.name : user.roles?.name
    const hospitalName = Array.isArray(user.hospitals) ? user.hospitals[0]?.name : user.hospitals?.name
    
    return (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (roleName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hospitalName || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search users by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
        />
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-600 text-sm font-medium uppercase tracking-wider">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Hospital</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{u.name}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-slate-400" />
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {(Array.isArray(u.roles) ? u.roles[0]?.name : u.roles?.name)?.replace('_', ' ') || 'No Role'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Building className="h-4 w-4 text-slate-400" />
                      {(Array.isArray(u.hospitals) ? u.hospitals[0]?.name : u.hospitals?.name) || 'System Admin'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-sm text-slate-500">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/super-admin/users/${u.id}`}>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold rounded-lg group">
                        <Eye className="h-4 w-4 mr-1.5 transition-transform group-hover:scale-110" />
                        Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <UsersIcon className="h-8 w-8 text-slate-300" />
                      <p>{searchQuery ? `No users matching "${searchQuery}"` : "No users found in the system"}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
