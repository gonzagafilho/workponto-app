"use client";

import { useEffect, useMemo, useState } from "react";

type Worksite = {
  id: string;
  name: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  requireSelfie: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function toNumber(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function WorksitesPage() {
  const [items, setItems] = useState<Worksite[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Worksite | null>(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    radiusMeters: "200",
    requireSelfie: true,
    isActive: true,
  });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/worksites", { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          (data && typeof data === "object" && ((data as any).error || (data as any).message)) ||
          `HTTP ${res.status}`;
        throw new Error(String(msg));
      }

      // backend lista retorna array direto
      setItems(Array.isArray(data) ? data : (data?.worksites ?? []));
    } catch (e: any) {
      alert(e?.message || "Falha ao carregar obras");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((w) => {
      const a = (w.address || "").toLowerCase();
      return w.name.toLowerCase().includes(s) || a.includes(s);
    });
  }, [items, q]);

  function openCreate() {
    setEditing(null);
    setForm({
      name: "",
      address: "",
      latitude: "",
      longitude: "",
      radiusMeters: "200",
      requireSelfie: true,
      isActive: true,
    });
    setOpen(true);
  }

  function openEdit(w: Worksite) {
    setEditing(w);
    setForm({
      name: w.name || "",
      address: w.address || "",
      latitude: String(w.latitude ?? ""),
      longitude: String(w.longitude ?? ""),
      radiusMeters: String(w.radiusMeters ?? 200),
      requireSelfie: !!w.requireSelfie,
      isActive: !!w.isActive,
    });
    setOpen(true);
  }

  async function submit() {
    if (!form.name.trim()) return alert("Informe o nome");
    if (form.latitude === "" || form.longitude === "") return alert("Informe latitude e longitude");

    const payload = {
      name: form.name.trim(),
      address: form.address?.trim() || undefined,
      latitude: toNumber(form.latitude, 0),
      longitude: toNumber(form.longitude, 0),
      radiusMeters: toNumber(form.radiusMeters, 200),
      requireSelfie: !!form.requireSelfie,
      isActive: !!form.isActive,
    };

    setSaving(true);
    try {
      if (!editing) {
        const res = await fetch("/api/worksites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const msg = (data && ((data as any).error || (data as any).message)) || `HTTP ${res.status}`;
          throw new Error(String(msg));
        }
      } else {
        const res = await fetch(`/api/worksites/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const msg = (data && ((data as any).error || (data as any).message)) || `HTTP ${res.status}`;
          throw new Error(String(msg));
        }
      }

      setOpen(false);
      await load();
    } catch (e: any) {
      alert(e?.message || "Falha ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(w: Worksite) {
    const next = !w.isActive;
    if (!confirm(`Confirmar ${next ? "ATIVAR" : "DESATIVAR"} a obra "${w.name}"?`)) return;

    try {
      const res = await fetch(`/api/worksites/${w.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = (data && ((data as any).error || (data as any).message)) || `HTTP ${res.status}`;
        throw new Error(String(msg));
      }
      await load();
    } catch (e: any) {
      alert(e?.message || "Falha ao atualizar status");
    }
  }

  async function remove(w: Worksite) {
    if (!confirm(`Remover a obra "${w.name}"? Essa ação não pode ser desfeita.`)) return;

    try {
      const res = await fetch(`/api/worksites/${w.id}`, { method: "DELETE", cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = (data && ((data as any).error || (data as any).message)) || `HTTP ${res.status}`;
        throw new Error(String(msg));
      }
      await load();
    } catch (e: any) {
      alert(e?.message || "Falha ao remover");
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Obras</h1>
          <p className="text-sm text-neutral-500">
            Cadastre e gerencie obras, raio (geofence) e exigência de selfie.
          </p>
        </div>

        <button onClick={openCreate} className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90">
          Nova obra
        </button>
      </div>

      <div className="flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome ou endereço..."
          className="w-full max-w-lg px-3 py-2 border rounded-lg"
        />
        <div className="text-sm text-neutral-500">
          {loading ? "Carregando..." : `${filtered.length} de ${items.length}`}
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Endereço</th>
              <th className="text-left p-3">Raio</th>
              <th className="text-left p-3">Selfie</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4 text-neutral-500" colSpan={6}>
                  Carregando...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="p-4 text-neutral-500" colSpan={6}>
                  Nenhuma obra encontrada.
                </td>
              </tr>
            ) : (
              filtered.map((w) => (
                <tr key={w.id} className="border-t">
                  <td className="p-3 font-medium">{w.name}</td>
                  <td className="p-3 text-neutral-600">{w.address || "-"}</td>
                  <td className="p-3">{w.radiusMeters}m</td>
                  <td className="p-3">{w.requireSelfie ? "Sim" : "Não"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        w.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {w.isActive ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button className="px-3 py-1 rounded-lg border" onClick={() => openEdit(w)}>
                      Editar
                    </button>
                    <button className="px-3 py-1 rounded-lg border" onClick={() => toggleActive(w)}>
                      {w.isActive ? "Desativar" : "Ativar"}
                    </button>
                    <button className="px-3 py-1 rounded-lg border" onClick={() => remove(w)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing ? "Editar obra" : "Nova obra"}</h2>
              <button className="text-sm px-2 py-1" onClick={() => setOpen(false)}>
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-neutral-500">Nome</label>
                <input
                  className="w-full px-3 py-2 border rounded-lg"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-500">Endereço (opcional)</label>
                <input
                  className="w-full px-3 py-2 border rounded-lg"
                  value={form.address}
                  onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-500">Latitude</label>
                <input
                  className="w-full px-3 py-2 border rounded-lg"
                  value={form.latitude}
                  onChange={(e) => setForm((s) => ({ ...s, latitude: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-500">Longitude</label>
                <input
                  className="w-full px-3 py-2 border rounded-lg"
                  value={form.longitude}
                  onChange={(e) => setForm((s) => ({ ...s, longitude: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-500">Raio (metros)</label>
                <input
                  className="w-full px-3 py-2 border rounded-lg"
                  value={form.radiusMeters}
                  onChange={(e) => setForm((s) => ({ ...s, radiusMeters: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-500">Exigir selfie</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={form.requireSelfie ? "1" : "0"}
                  onChange={(e) => setForm((s) => ({ ...s, requireSelfie: e.target.value === "1" }))}
                >
                  <option value="1">Sim</option>
                  <option value="0">Não</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-500">Ativa</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={form.isActive ? "1" : "0"}
                  onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.value === "1" }))}
                >
                  <option value="1">Sim</option>
                  <option value="0">Não</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button className="px-4 py-2 rounded-lg border" onClick={() => setOpen(false)} disabled={saving}>
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90"
                onClick={submit}
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}