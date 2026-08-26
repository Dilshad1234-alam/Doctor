import { NextResponse } from "next/server";

// Helper to decode JWT payload in Edge runtime without external crypto libraries
function getJwtPayload(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Payload = parts[1];
    const decodedPayload = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodedPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request) {
  const token =
    request.cookies.get("token")?.value || request.cookies.get("auth_token")?.value;
  const userRole = request.cookies.get("user_role")?.value;
  const { pathname } = request.nextUrl;

  const jwtPayload = getJwtPayload(token);
  const effectiveRole = jwtPayload?.role || userRole;

  // 1. Admin Routes Guard
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || pathname === "/admin/register") {
      return NextResponse.next();
    }

    if (!token || effectiveRole !== "ADMIN") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Prevent Admin from accessing Doctor onboarding / dashboard
  if (pathname.startsWith("/dashboard") && effectiveRole === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // 3. Protect doctor/clinic dashboard routes against unauthenticated users
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }

    // 4. Onboarding guard: Force direct redirect to onboarding if incomplete
    if (effectiveRole !== "ADMIN") {
      const onboardingCookie = request.cookies.get("is_onboarding_completed")?.value;
      const isOnboardingDone =
        jwtPayload?.isOnboardingCompleted === true ||
        jwtPayload?.hasCompletedOnboarding === true ||
        onboardingCookie === "true";

      if (!isOnboardingDone && pathname !== "/dashboard/onboarding") {
        return NextResponse.redirect(new URL("/dashboard/onboarding", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
