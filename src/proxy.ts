import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

function isValidSession(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Log all route hits
  console.log(`[${method}] ${pathname}`);

  // Protected routes — validate JWT, not just cookie existence
  if (pathname.startsWith("/dashboard")) {
    const sessionCookie = request.cookies.get("orbit-session");
    if (!sessionCookie || !isValidSession(sessionCookie.value)) {
      // Clear invalid cookie and redirect
      const response = NextResponse.redirect(new URL("/login", request.url));
      if (sessionCookie) {
        response.cookies.delete("orbit-session");
      }
      return response;
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname === "/login" || pathname === "/register") {
    const sessionCookie = request.cookies.get("orbit-session");
    if (sessionCookie && isValidSession(sessionCookie.value)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
