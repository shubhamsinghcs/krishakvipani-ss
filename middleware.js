import { NextResponse } from "next/server";

export function middleware(request) {
  // If the user is visiting protected paths without authentication, redirect to /login
  // The client also handles localStorage, but we handle cookie token for SSR paths if any.
  // Many apps rely on the `token` cookie. We'll verify if it's present for page routes.
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  
  if (
    request.nextUrl.pathname.startsWith('/history') ||
    request.nextUrl.pathname.startsWith('/assistant')
  ) {
    // Basic check for either a cookie or an auth header (if it's an API call)
    const hasTokenCookie = request.cookies.has("token") || request.cookies.has("krishi_token");
    const authHeader = request.headers.get("authorization");
    const hasHeader = authHeader && authHeader.startsWith("Bearer ");

    // If it's an API route and has header, allow it (the route itself will verify the token)
    if (request.nextUrl.pathname.startsWith('/api/') && hasHeader) {
      return NextResponse.next();
    }

    // If neither cookie nor header exists, deny/redirect
    if (!hasTokenCookie && !hasHeader) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/history/:path*", "/assistant/:path*"],
};
