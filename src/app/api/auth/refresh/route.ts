import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api";

export async function POST() {
  try {
    const jar = await cookies();
    const refresh = jar.get("wp_refresh")?.value;

    if (!refresh) {
      return NextResponse.json({ ok: false, error: "Sem refresh token" }, { status: 401 });
    }

    // Envia o refresh de forma "à prova de formato":
    // - body com refreshToken
    // - e também header Cookie wp_refresh (caso o backend leia cookie)
    const data = await apiFetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `wp_refresh=${refresh}`,
      },
      body: JSON.stringify({ refreshToken: refresh }),
    });

    const accessToken = (data as any)?.accessToken;
    const refreshToken = (data as any)?.refreshToken;

    if (!accessToken) {
      return NextResponse.json(
        { ok: false, error: "API não retornou accessToken no refresh" },
        { status: 500 }
      );
    }

    const res = NextResponse.json({ ok: true });

    // Atualiza access token
    res.cookies.set("wp_access", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // OBS: seu JWT atual expira em ~15min; aqui só controla cookie no browser.
      // Não depende disso para segurança do backend.
      maxAge: 60 * 60,
    });

    // Se o backend rotacionar refresh, atualiza também
    if (refreshToken) {
      res.cookies.set("wp_refresh", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return res;
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Falha no refresh" },
      { status: 401 }
    );
  }
}