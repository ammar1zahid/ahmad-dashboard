// middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // --- QUICK SAFETY: do not run middleware on API routes, Next internals, static files or assets
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // file extension -> static asset
  ) {
    return NextResponse.next();
  }

  // getToken reads the JWT created by NextAuth (works in middleware)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;
  const isAdmin = !!token?.isAdmin;

  // Redirect root "/" → login or dashboard depending on auth
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isLoggedIn ? "/dashboard" : "/login", req.url)
    );
  }

  // Protect dashboard routes (require login AND admin)
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Optional: enforce admin-only access (restore old behaviour)
    if (!isAdmin) {
      // you can redirect to login or to a custom "unauthorized" page like /401
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Redirect logged-in users away from login page
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

/*
  Run middleware for all non-api/_next/static routes.
  This matcher ensures middleware won't run for /api/auth/* and static assets.
*/
export const config = {
  matcher: ["/((?!api|_next|static|.*\\..*).*)"],
};
