import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy for route protection
 * 
 * Note: Better Auth handles session validation server-side.
 * This proxy primarily sets up redirects for protected routes.
 * Actual auth validation happens in server actions using requireAuth/requireAdmin.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes - will be validated server-side by requireAdmin()
  // We can add additional checks here if needed
  if (pathname.startsWith("/admin")) {
    // For now, just pass through - server actions will handle auth
    // You can add session cookie checks here for faster rejection
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
