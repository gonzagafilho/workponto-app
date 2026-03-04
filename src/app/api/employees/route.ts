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

  const upstream = await fetch(`${API_BASE}/employees`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}

export async function POST(req: Request) {
  const token = readCookieToken(req);
  if (!token) return NextResponse.json({ ok: false, error: "Sem sessão" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const upstream = await fetch(`${API_BASE}/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}