import { NextResponse } from "next/server";

const API_BASE =
  (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3011") + "/api";

function readCookieToken(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|;\s*)wp_access=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

export async function GET(req: Request) {
  const token = readCookieToken(req);
  if (!token) return NextResponse.json({ ok: false, error: "Sem sessão" }, { status: 401 });

  const upstream = await fetch(`${API_BASE}/worksites`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
