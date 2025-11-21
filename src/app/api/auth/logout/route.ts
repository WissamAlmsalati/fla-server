import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  
  response.cookies.set("access_token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });
  
  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    path: "/api/auth/refresh",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
