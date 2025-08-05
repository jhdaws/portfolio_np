import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const authCookie = req.cookies.get("auth");

  const isLoggedIn = authCookie?.value === "true";
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");

  if (
    !isLoggedIn &&
    !isLoginPage &&
    req.nextUrl.pathname.startsWith("/api/projects")
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (
    !isLoggedIn &&
    !isLoginPage &&
    req.nextUrl.pathname.startsWith("/projects")
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/projects/:path*", "/api/projects/:path*"],
};
