import { NextResponse, type NextRequest } from "next/server"

import { AUTH_COOKIE_NAME, ROUTES } from "@/lib/constants"

const PROTECTED_PREFIXES = [ROUTES.select, ROUTES.dashboard, ROUTES.buildings]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = request.cookies.has(AUTH_COOKIE_NAME)
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL(ROUTES.login, request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === ROUTES.login && isAuthenticated) {
    return NextResponse.redirect(new URL(ROUTES.select, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/select", "/dashboard", "/buildings/:path*"],
}
