'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Home, Users, Building, Calendar, Beaker, Pill, Settings } from 'lucide-react'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const NAV_ITEMS = {
  super_admin: [
    { label: 'Dashboard', href: '/dashboard/super-admin', icon: Home },
    { label: 'Hospitals', href: '/dashboard/super-admin/hospitals', icon: Building },
    { label: 'Users', href: '/dashboard/super-admin/users', icon: Users },
  ],
  hospital_admin: [
    { label: 'Staff Management', href: '/dashboard/hospital-admin', icon: Users },
  ],
  doctor: [
    { label: 'My Appointments', href: '/dashboard/doctor', icon: Calendar },
    { label: 'Patients', href: '/dashboard/doctor/patients', icon: Users },
    { label: 'Settings', href: '/dashboard/doctor/settings', icon: Settings },
  ],
  receptionist: [
    { label: 'Appointments', href: '/dashboard/receptionist', icon: Calendar },
    { label: 'Patients', href: '/dashboard/receptionist/patients', icon: Users },
  ],
  pharmacy_manager: [
    { label: 'Prescriptions', href: '/dashboard/pharmacy', icon: Pill },
  ],
  lab_manager: [
    { label: 'Lab Reports', href: '/dashboard/lab', icon: Beaker },
  ],
  patient: [
    { label: 'My Dashboard', href: '/dashboard/patient', icon: Home },
    { label: 'Appointments', href: '/dashboard/patient/appointments', icon: Calendar },
    { label: 'Prescription History', href: '/dashboard/patient/prescriptions', icon: Pill },
  ],
}

export function SidebarNav({ roleName }: { roleName: string }) {
  const pathname = usePathname()
  const items = NAV_ITEMS[roleName as keyof typeof NAV_ITEMS] || []

  return (
    <ul className="space-y-1.5">
      {items.map((item) => {
        const isActive = pathname === item.href || 
          (pathname.startsWith(item.href + '/') && !items.some(otherItem => 
            otherItem.href.length > item.href.length && 
            (pathname === otherItem.href || pathname.startsWith(otherItem.href + '/'))
          ));

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all group",
                isActive 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"
              )} />
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
