import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get('sb-access-token')?.value;
  const isAuthPage = pathname.startsWith('/login') ||
                     pathname.startsWith('/forgot-password') ||
                     pathname.startsWith('/reset-password');

  if (!authToken && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (authToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Role-based protection
  // In a real production app, we would verify the JWT and check the role claim
  // Since we are using Supabase, we can check the user's role from the metadata or a database call
  // For the pilot middleware, we will enforce a strict check for admin routes
  if (authToken) {
    const adminRoutes = ['/users', '/settings'];
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    if (isAdminRoute) {
        // Here we'd ideally verify the token.
        // For the pilot, we'll assume the client-side role check handles the UI
        // and the RLS handles the data, but the middleware provides the route guard.
        // To be secure, we should fetch the user from Supabase.
        const { data: { user } } = await supabase.auth.getUser(authToken);

        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Fetch role from database
        const { data: roleData } = await supabase
            .from('user_roles')
            .select('roles(name)')
            .eq('user_id', user.id)
            .single();

        const role = (roleData as any)?.roles?.name;

        if (role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
