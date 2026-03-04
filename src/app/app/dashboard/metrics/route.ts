import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getCookie(req: Request, name: string) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function GET(req: Request) {
  const token = getCookie(req, "wp_access");
  if (!token) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const apiBase = process.env.API_BASE_URL || "https://api.workponto.com.br";

  const r = await fetch(`${apiBase}/dashboard/metrics`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await r.json().catch(() => null);
  return NextResponse.json(data ?? { ok: false }, { status: r.status });
}
