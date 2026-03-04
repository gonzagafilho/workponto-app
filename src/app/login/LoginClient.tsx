"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "admin" | "employee";

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();

  // modo (padrão: funcionário)
  const [mode, setMode] = useState<Mode>("employee");

  // redirect
  const nextFromUrl = params.get("next");
  const next = useMemo(() => {
    if (nextFromUrl) return nextFromUrl;
    return mode === "employee" ? "/app/ponto" : "/app/dashboard";
  }, [nextFromUrl, mode]);

  // admin
  const [email, setEmail] = useState("admin@dcnet.com");
  const [password, setPassword] = useState("Marilene0310");

  // employee
  const [cpf, setCpf] = useState("81866542168");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onlyDigits(v: string) {
    return String(v || "").replace(/\D/g, "");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = mode === "employee" ? "/api/auth/employee-login" : "/api/auth/login";
      const body =
        mode === "employee"
          ? { cpf: onlyDigits(cpf) }
          : { email, password };

      if (mode === "employee" && String((body as any).cpf || "").length !== 11) {
        throw new Error("CPF inválido (precisa ter 11 dígitos)");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Login inválido");

      // redireciona por modo
      router.push(mode === "employee" ? "/app/ponto" : next);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Erro no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="text-xl font-semibold">WorkPonto</div>
          <div className="text-sm text-neutral-600">
            {mode === "employee" ? "Entrar como funcionário (CPF)" : "Entrar como admin"}
          </div>
        </div>

        {/* seletor de modo */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("employee")}
            className={`rounded-xl border px-3 py-2 text-sm ${
              mode === "employee" ? "bg-black text-white" : "bg-white"
            }`}
          >
            Funcionário
          </button>
          <button
            type="button"
            onClick={() => setMode("admin")}
            className={`rounded-xl border px-3 py-2 text-sm ${
              mode === "admin" ? "bg-black text-white" : "bg-white"
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "employee" ? (
            <div>
              <label className="text-sm text-neutral-700">CPF</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-200"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                inputMode="numeric"
                placeholder="Somente números"
                autoComplete="off"
              />
              <div className="mt-1 text-xs text-neutral-500">
                Dica: pode colar com pontos/traço, eu limpo e valido.
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm text-neutral-700">Email</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="text-sm text-neutral-700">Senha</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-black px-3 py-2 text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-4 text-xs text-neutral-500">
          {mode === "employee"
            ? "Esse login é o fluxo oficial do app do funcionário."
            : "Admin: usado para gestão/validação."}
        </div>
      </div>
    </div>
  );
}