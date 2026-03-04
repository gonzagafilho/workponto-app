import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // chama sua API Nest
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const accessToken = (data as any)?.accessToken;
    const refreshToken = (data as any)?.refreshToken;
    const role = (data as any)?.user?.role || "TENANT_ADMIN";

    if (!accessToken) {
      return NextResponse.json(
        { ok: false, error: "API não retornou accessToken" },
        { status: 500 },
      );
    }

    const res = NextResponse.json({ ok: true });

    // cookie seguro (HTTPOnly)
    res.cookies.set("wp_access", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1h
    });

    // cookie "leve" só pra roteamento/UX (não é segurança)
    res.cookies.set("wp_role", role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1h
    });

    // se tiver refresh token, guarda também
    if (refreshToken) {
      res.cookies.set("wp_refresh", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 dias
      });
    }

    return res;
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Falha no login" },
      { status: 401 },
    );
  }
}