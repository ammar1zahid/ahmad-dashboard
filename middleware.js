// middleware.js
import { NextResponse } from "next/server";

async function getSessionFromApi(req) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const origin = req.nextUrl?.origin || `${req.nextUrl?.protocol}//${req.headers.get("host")}`;

    const resp = await fetch(new URL("/api/auth/session", origin).toString(), {
      headers: {
        cookie,
        accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!resp.ok) return null;
    return await resp.json();
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

  // Root redirect (same as before)
  if (pathname === "/") {
    return NextResponse.redirect(new URL(isLoggedIn ? "/dashboard" : "/login", req.url));
  }

  // Allow any logged-in user to view /dashboard and its children.
  // Previously you required admin here; we no longer do that.
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    // <-- no admin check here so non-admins can access the dashboard
  }

  // --- OPTIONAL: Protect specific admin-only paths
  // If you want middleware to block certain routes for non-admins (extra layer),
  // list them here. For example: user management add/edit/delete pages.
  // If you prefer to rely only on server-action checks, you can keep this list empty.
  const adminOnlyPaths = [
    // "/dashboard/users/add",
    // "/dashboard/users", // if you want to protect whole users area
    // "/dashboard/products/add",
    // "/dashboard/products/[id]/edit",
    // "/dashboard/customers/add",
    // add any other paths that should be admin-only at the middleware level
  ];

  // Check admin-only list and redirect non-admins if matched
  if (adminOnlyPaths.length > 0) {
    for (const p of adminOnlyPaths) {
      // simple startsWith match — adjust if you need more complex patterns
      if (pathname.startsWith(p)) {
        if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
        if (!isAdmin) return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  }

  // Redirect logged-in user away from the login page (same as before)
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|.*\\..*).*)"],
};
