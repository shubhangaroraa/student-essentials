import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  const protectedPaths = ['/dashboard', '/checkout']
  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get('sb-ymsxsqqopbwuuctvokog-auth-token')?.value
  
  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/checkout/:path*'],
}