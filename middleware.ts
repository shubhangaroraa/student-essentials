import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    
    const token = request.cookies.get('sb-ymsxsqqopbwuuctvokg-auth-token')
    
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}