// src/components/shell/AppShell.tsx
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex max-w-[1400px]">
        <Sidebar />
        <div className="flex-1">
          <Topbar title="WorkPonto" />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}