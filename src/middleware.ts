import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/refresh"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and images
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
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
    await jwtVerify(token, secret);
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
