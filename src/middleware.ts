import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/register",
  "/api/auth/verify-otp"
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and images
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/uploads") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|webp)$/)
  ) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  let token = request.cookies.get("access_token")?.value;
  const authHeader = request.headers.get("authorization");

  if (!token && authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Check query param for token (needed for SSE/EventSource)
  if (!token && request.nextUrl.searchParams.has("token")) {
    token = request.nextUrl.searchParams.get("token") || undefined;
  }

  // Handle "Bearer null" or "Bearer undefined" cases
  if (token === "null" || token === "undefined") {
    token = undefined;
  }

  const isApi = pathname.startsWith("/api");

  if (!token) {
    if (isApi) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  try {
    const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    // RBAC: CUSTOMER role should not access dashboard routes
    const DASHBOARD_ROUTES = [
      "/dashboard",
      "/orders",
      "/customers",
      "/users",
      "/shipping",
      "/account-requests",
      "/announcements",
      "/warehouses"
    ];

    if (role === "CUSTOMER" && DASHBOARD_ROUTES.some(route => pathname.startsWith(route))) {
      if (isApi) {
        return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
      } else {
        // Redirect to a safe page or show error. Since they shouldn't be here, redirect to login or a "forbidden" page.
        // For now, let's redirect to login and clear token to be safe.
        const response = NextResponse.redirect(new URL("/login?error=unauthorized", request.url));
        response.cookies.delete("access_token");
        return response;
      }
    }

    return NextResponse.next();
  } catch (error) {
    if (isApi) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    } else {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("access_token");
      return response;
    }
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
