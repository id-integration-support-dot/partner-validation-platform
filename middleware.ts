import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Ini cuma cek KEBERADAAN cookie sesi (cepat, jalan di edge, tanpa query DB).
// Validasi sesungguhnya (apakah sesi masih valid) tetap dilakukan di server
// component lewat auth.api.getSession() — lihat app/dashboard/page.tsx.
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
