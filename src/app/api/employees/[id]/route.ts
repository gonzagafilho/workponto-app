import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3011") + "/api";

function readCookieToken(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|;\s*)wp_access=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const token = readCookieToken(req);
  if (!token) return NextResponse.json({ ok: false, error: "Sem sessão" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const upstream = await fetch(`${API_BASE}/employees/${encodeURIComponent(id)}`, {
    method: "PATCH",
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

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const token = readCookieToken(req);
  if (!token) return NextResponse.json({ ok: false, error: "Sem sessão" }, { status: 401 });

  const { id } = await params;

  const upstream = await fetch(`${API_BASE}/employees/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}