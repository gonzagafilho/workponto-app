"use client";

import { useEffect, useMemo, useState } from "react";
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type Employee = {
  id: string;
  tenantId?: string | null;
  name: string;
  cpf: string;
  phone?: string | null;
  email?: string | null;

  workStart: string;
  lunchStart?: string | null;
  lunchEnd?: string | null;
  workEnd: string;

  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
};

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

function normalizeCpf(v: string) {
  const d = onlyDigits(v);
  return d.slice(0, 11);
}

export default function EmployeesPage() {
  const [items, setItems] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = useMemo(
    () => (editingId ? items.find((x) => x.id === editingId) || null : null),
    [editingId, items],
  );

  const [form, setForm] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    workStart: "08:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    workEnd: "18:00",
    isActive: true,
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((e) => {
      const cpf = (e.cpf || "").toLowerCase();
      const name = (e.name || "").toLowerCase();
      const email = (e.email || "").toLowerCase();
      return name.includes(term) || cpf.includes(term) || email.includes(term);
    });
  }, [items, q]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/employees", { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      // backend retorna array direto (findMany)
      const list = Array.isArray(data) ? data : (data?.employees ?? []);
      setItems(list as Employee[]);
    } catch (e: any) {
      setError(e?.message || "Falha ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetFormFrom(emp?: Employee | null) {
    if (!emp) {
      setEditingId(null);
      setForm({
        name: "",
        cpf: "",
        phone: "",
        email: "",
        workStart: "08:00",
        lunchStart: "12:00",
        lunchEnd: "13:00",
        workEnd: "18:00",
        isActive: true,
      });
      return;
    }

    setEditingId(emp.id);
    setForm({
      name: emp.name || "",
      cpf: emp.cpf || "",
      phone: emp.phone || "",
      email: emp.email || "",
      workStart: emp.workStart || "08:00",
      lunchStart: emp.lunchStart || "",
      lunchEnd: emp.lunchEnd || "",
      workEnd: emp.workEnd || "18:00",
      isActive: emp.isActive ?? true,
    });
  }

  async function submit() {
    setSaving(true);
    setError(null);

    try {
      const payload: any = {
        name: form.name.trim(),
        cpf: normalizeCpf(form.cpf),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        workStart: form.workStart,
        lunchStart: form.lunchStart.trim() ? form.lunchStart : null,
        lunchEnd: form.lunchEnd.trim() ? form.lunchEnd : null,
        workEnd: form.workEnd,
        isActive: !!form.isActive,
      };

      if (!payload.name) throw new Error("Informe o nome");
      if (!payload.cpf || payload.cpf.length !== 11) throw new Error("CPF inválido (11 dígitos)");
      if (!payload.workStart) throw new Error("Informe workStart (ex: 08:00)");
      if (!payload.workEnd) throw new Error("Informe workEnd (ex: 18:00)");

      const isEdit = !!editingId;

      const res = await fetch(isEdit ? `/api/employees/${editingId}` : "/api/employees", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      // create/update retorna { ok:true, employee }
      const updated: Employee | null = (data && (data.employee as Employee)) || null;
      if (updated?.id) {
        setItems((prev) => {
          const idx = prev.findIndex((x) => x.id === updated.id);
          if (idx >= 0) {
            const copy = prev.slice();
            copy[idx] = { ...copy[idx], ...updated };
            return copy;
          }
          return [updated, ...prev];
        });
      } else {
        // fallback: recarrega
        await load();
      }

      resetFormFrom(null);
    } catch (e: any) {
      setError(e?.message || "Falha ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(emp: Employee) {
    setError(null);
    try {
      const res = await fetch(`/api/employees/${emp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !emp.isActive }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      const updated: Employee | null = (data && (data.employee as Employee)) || null;
      if (updated?.id) {
        setItems((prev) => prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
      } else {
        setItems((prev) => prev.map((x) => (x.id === emp.id ? { ...x, isActive: !x.isActive } : x)));
      }
    } catch (e: any) {
      setError(e?.message || "Falha ao ativar/desativar");
    }
  }

  async function remove(emp: Employee) {
    const ok = window.confirm(`Remover funcionário "${emp.name}"? Isso apaga do banco.`);
    if (!ok) return;

    setError(null);
    try {
      const res = await fetch(`/api/employees/${emp.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      setItems((prev) => prev.filter((x) => x.id !== emp.id));
      if (editingId === emp.id) resetFormFrom(null);
    } catch (e: any) {
      setError(e?.message || "Falha ao remover");
    }
  }

  return (
    <div>
      <Topbar title="Funcionários" />
      <div className="px-4 py-6 md:px-6 space-y-4">
        <Card>
          <CardHeader title="Lista de funcionários" subtitle="Criar, editar e ativar/desativar" />
          <CardContent>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por nome, CPF ou email..."
                  className="w-full md:w-96 rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
                <button
                  onClick={load}
                  className="rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50"
                  disabled={loading}
                >
                  Atualizar
                </button>
              </div>

              <div className="text-sm text-zinc-600">
                {loading ? "Carregando..." : `${filtered.length} funcionário(s)`}
              </div>
            </div>

            {error ? (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-zinc-600">
                  <tr className="border-b border-zinc-200">
                    <th className="py-2 pr-3">Nome</th>
                    <th className="py-2 pr-3">CPF</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp) => (
                    <tr key={emp.id} className="border-b border-zinc-100">
                      <td className="py-2 pr-3">{emp.name}</td>
                      <td className="py-2 pr-3">{emp.cpf}</td>
                      <td className="py-2 pr-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                            emp.isActive ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {emp.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => resetFormFrom(emp)}
                            className="rounded-md border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => toggleActive(emp)}
                            className="rounded-md border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50"
                          >
                            {emp.isActive ? "Desativar" : "Ativar"}
                          </button>
                          <button
                            onClick={() => remove(emp)}
                            className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                          >
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-zinc-500">
                        Nenhum funcionário encontrado.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title={editing ? "Editar funcionário" : "Novo funcionário"}
            subtitle={editing ? `ID: ${editing.id}` : "Preencha os dados e salve"}
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-600">Nome *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-600">CPF *</label>
                <input
                  value={form.cpf}
                  onChange={(e) => setForm((p) => ({ ...p, cpf: normalizeCpf(e.target.value) }))}
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-600">Telefone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-600">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-600">Entrada (workStart) *</label>
                <input
                  value={form.workStart}
                  onChange={(e) => setForm((p) => ({ ...p, workStart: e.target.value }))}
                  placeholder="08:00"
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-600">Saída (workEnd) *</label>
                <input
                  value={form.workEnd}
                  onChange={(e) => setForm((p) => ({ ...p, workEnd: e.target.value }))}
                  placeholder="18:00"
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-600">Almoço início (lunchStart)</label>
                <input
                  value={form.lunchStart}
                  onChange={(e) => setForm((p) => ({ ...p, lunchStart: e.target.value }))}
                  placeholder="12:00"
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-600">Almoço fim (lunchEnd)</label>
                <input
                  value={form.lunchEnd}
                  onChange={(e) => setForm((p) => ({ ...p, lunchEnd: e.target.value }))}
                  placeholder="13:00"
                  className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
                <label htmlFor="isActive" className="text-sm text-zinc-700">
                  Ativo
                </label>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={submit}
                disabled={saving}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-60"
              >
                {saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar funcionário"}
              </button>

              <button
                onClick={() => resetFormFrom(null)}
                className="rounded-md border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50"
              >
                Limpar
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}