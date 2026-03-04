// src/components/shell/Topbar.tsx
import { Badge } from "@/components/ui/Badge";
import { UserMenu } from "@/components/shell/UserMenu";

export function Topbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-zinc-900">
              {title}
            </h1>
            <Badge className="hidden sm:inline-flex">PROD</Badge>
          </div>
          <p className="truncate text-sm text-zinc-500">
            WorkPonto Enterprise — Painel administrativo
          </p>
        </div>

        <UserMenu />
      </div>
    </header>
  );
}
