import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const pathname = request.nextUrl.pathname

  // Public routes that do not require an active session
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/services' ||
    pathname === '/contact' ||
    pathname === '/api-docs' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/setup'

  // Let API routes handle their own authentication/authorization
  if (pathname.startsWith('/api')) {
    return supabaseResponse
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase environment variables are missing (e.g., initial Vercel deploy before setting env vars)
  // log a clear warning and prevent crashing the entire application with a 500 Internal Server Error
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '[Supabase Middleware Warning]: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined. Please set these in your environment variables (e.g. Vercel Project Settings).'
    )
    if (!isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // If user is logged in and tries to access login page, redirect to dashboard
    if (user && pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error('[Supabase Middleware Error]:', error)
    if (!isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
