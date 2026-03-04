import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type JwtPayload = {
  sub?: string;
  tenantId?: string;
  role?: string;
  exp?: number;
  iat?: number;
  email?: string | null;
  name?: string | null;
};

function base64UrlDecodeUtf8(input: string) {
  // base64url -> base64
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  // pad
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;

  // atob -> bytes -> utf8
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

  return new TextDecoder().decode(bytes);
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const json = base64UrlDecodeUtf8(parts[1]);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function isExpired(exp?: number) {
  if (!exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("wp_access")?.value || "";
  const payload = token ? decodeJwtPayload(token) : null;
  const role = payload?.role || null;

  // =========================
  // 1) Protege /app: precisa token válido
  // =========================
  if (pathname.startsWith("/app")) {
    if (!token || !payload || isExpired(payload.exp)) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    // =========================
    // 2) Role-based access (token válido)
    // =========================

    // EMPLOYEE: só pode /app/ponto
    if (role === "EMPLOYEE") {
      if (!pathname.startsWith("/app/ponto")) {
        const url = req.nextUrl.clone();
        url.pathname = "/app/ponto";
        return NextResponse.redirect(url);
      }
    } else {
      // ADMIN/OUTROS: não deve acessar /app/ponto
      if (pathname.startsWith("/app/ponto")) {
        const url = req.nextUrl.clone();
        url.pathname = "/app/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  // =========================
  // 3) /login: se já está logado, manda pro lugar certo
  // =========================
  if (pathname === "/login") {
    if (token && payload && !isExpired(payload.exp)) {
      const url = req.nextUrl.clone();
      url.pathname = role === "EMPLOYEE" ? "/app/ponto" : "/app/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login"],
};