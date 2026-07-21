'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Activity, LogIn, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check login status
  useEffect(() => {
    const supabase = createClient()
    
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact Us', href: '/contact' },
  ]

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-lg border-b shadow-sm' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="container flex h-20 max-w-screen-xl items-center justify-between px-4 md:px-8 mx-auto">
        {/* Logo */}
        <Link 
          href={isLoggedIn ? "/dashboard" : "/"} 
          className="flex items-center space-x-2 group transition-transform hover:scale-105"
        >
          <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            Kanbuvar
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 bg-slate-100/50 backdrop-blur-md p-1.5 rounded-full border border-slate-200/50">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'text-white shadow-md' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full -z-10 animate-in fade-in zoom-in duration-300" />
                )}
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <Link href={isLoggedIn ? "/dashboard" : "/login"}>
            <Button 
              className="bg-slate-900 hover:bg-blue-600 text-white rounded-full px-6 h-11 font-semibold shadow-lg shadow-slate-900/20 hover:shadow-blue-600/30 transition-all duration-300 group flex items-center"
            >
              {isLoggedIn ? (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  Dashboard
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
              <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
