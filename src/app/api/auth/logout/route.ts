import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("wp_access")?.value || "";

  // tenta invalidar refresh no backend (não bloqueia logout se falhar)
  if (token) {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {}
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set("wp_access", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  res.cookies.set("wp_refresh", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  res.cookies.set("wp_role", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}