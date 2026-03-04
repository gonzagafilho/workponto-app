// src/components/shell/UserMenu.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function UserMenu({
  name = "Usuário",
  email = "admin@workponto.com.br",
}: {
  name?: string;
  email?: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:block text-right leading-tight">
        <div className="text-sm font-semibold text-zinc-900">{name}</div>
        <div className="text-xs text-zinc-500">{email}</div>
      </div>

      <div className="grid h-10 w-10 place-items-center rounded-2xl border border-zinc-200 bg-white text-sm font-bold text-zinc-900 shadow-sm">
        {name?.slice(0, 1).toUpperCase()}
      </div>

      <Button variant="ghost" size="sm" onClick={handleLogout}>
        Sair
      </Button>
    </div>
  );
}
