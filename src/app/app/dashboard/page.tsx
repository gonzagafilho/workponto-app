"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type Metrics = {
  employeesActive: number;
  punchesToday: number;
  punchesMonth: number;
  hoursMonth: number;
  lateOrAbsences: number;
  _warn?: string;
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-medium text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<Metrics | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/metrics", { cache: "no-store" })
      .then(async (r) => {
        const json = await r.json().catch(() => null);
        if (!r.ok) {
          throw new Error(json?.error || json?.message || `HTTP ${r.status}`);
        }
        return json as Metrics;
      })
      .then((d) => {
        console.log("Dashboard metrics:", d);
        setData(d);
      })
      .catch((e: any) => {
        console.error("Erro dashboard:", e);
        setErr(String(e?.message || e));
      });
  }, []);

  return (
    <div>
      <Topbar title="Dashboard" />

      <div className="px-4 py-6 md:px-6">
        {err ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Erro ao carregar métricas: {err}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Funcionários ativos"
            value={data ? String(data.employeesActive) : "—"}
          />
          <Metric
            label="Pontos hoje"
            value={data ? String(data.punchesToday) : "—"}
          />
          <Metric
            label="Horas no mês"
            value={data ? String(data.hoursMonth) : "—"}
          />
          <Metric
            label="Atrasos/Faltas"
            value={data ? String(data.lateOrAbsences) : "—"}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Últimos registros" subtitle="Registros mais recentes do dia" />
            <CardContent className="text-sm text-zinc-600">
              {data ? (
                <>
                  Pontos no mês: <b>{data.punchesMonth}</b>
                  {data._warn ? (
                    <div className="mt-2 text-xs text-amber-700">Aviso: {data._warn}</div>
                  ) : null}
                </>
              ) : (
                "(Carregando dados...)"
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Avisos" subtitle="Pendências e eventos importantes" />
            <CardContent className="text-sm text-zinc-600">
              {data ? "Métricas carregadas ✅" : "(Carregando...)"}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
