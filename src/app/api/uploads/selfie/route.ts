import { NextResponse } from "next/server";

const API_BASE =
  (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3011") + "/api";

function readCookieToken(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|;\s*)wp_access=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

export async function POST(req: Request) {
  const token = readCookieToken(req);
  if (!token) return NextResponse.json({ ok: false, error: "Sem sessão" }, { status: 401 });

  const form = await req.formData();

  // Backend exige employeeId no body do multipart
  const employeeId = form.get("employeeId");
  if (!employeeId || typeof employeeId !== "string") {
    return NextResponse.json({ ok: false, error: "employeeId é obrigatório" }, { status: 400 });
  }
  const file = form.get("file");
  if (!file) {
    return NextResponse.json({ ok: false, error: "file é obrigatório" }, { status: 400 });
  }

  const upstream = await fetch(`${API_BASE}/uploads/selfie`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // não setar Content-Type (boundary)
    },
    body: form,
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
