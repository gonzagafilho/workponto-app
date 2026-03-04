import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api";

export async function GET() {
  try {
    const token = (await cookies()).get("wp_access")?.value;
    if (!token) return NextResponse.json({ ok: false, error: "Sem token" }, { status: 401 });

    const me = await apiFetch("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json({ ok: true, me });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Não autorizado" }, { status: 401 });
  }
}
