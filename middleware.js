// middleware.js
import { NextResponse } from "next/server";

async function getSessionFromApi(req) {
  try {
    // forward incoming cookies so /api/auth/session can read them
    const cookie = req.headers.get("cookie") || "";

    // req.nextUrl.origin is available in Next middleware (fallback if not)
    const origin = req.nextUrl?.origin || `${req.nextUrl?.protocol}//${req.headers.get("host")}`;

    const resp = await fetch(new URL("/api/auth/session", origin).toString(), {
      headers: {
        cookie,
        accept: "application/json",
      },
      next: { revalidate: 0 }, // ensure fresh session
    });

    if (!resp.ok) return null;
    return await resp.json(); // shape: { user, expires } when logged in
  } catch (err) {
    console.error("middleware getSessionFromApi error:", err);
    return null;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Skip API, Next internals, static files and assets
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get session using the internal API (reliable cookie handling)
  const session = await getSessionFromApi(req);
  const isLoggedIn = !!session?.user;
  const isAdmin = !!session?.user?.isAdmin;

  // Root redirect
  if (pathname === "/") {
    return NextResponse.redirect(new URL(isLoggedIn ? "/dashboard" : "/login", req.url));
  }

  // Protect dashboard routes (require login + admin)
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    if (!isAdmin) return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect logged-in users away from login page
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|.*\\..*).*)"],
};
