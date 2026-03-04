// src/app/api/worksites/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const API_BASE =
  (process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:3011") + "/api";

function readCookieToken(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|;\s*)wp_access=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

async function readJsonSafe(req: Request) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const token = readCookieToken(req);
  if (!token) return NextResponse.json({ ok: false, error: "Sem sessão" }, { status: 401 });

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ ok: false, error: "id ausente" }, { status: 400 });

  const body = await readJsonSafe(req);
  if (!body) return NextResponse.json({ ok: false, error: "Body inválido" }, { status: 400 });

  const upstream = await fetch(`${API_BASE}/worksites/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const token = readCookieToken(req);
  if (!token) return NextResponse.json({ ok: false, error: "Sem sessão" }, { status: 401 });

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ ok: false, error: "id ausente" }, { status: 400 });

  const upstream = await fetch(`${API_BASE}/worksites/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}