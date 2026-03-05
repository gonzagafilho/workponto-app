// src/components/shell/AppShell.tsx
"use client";

import { Sidebar } from "@/components/shell/Sidebar";
import { SidebarProvider } from "@/components/shell/SidebarContext";
import { Topbar } from "@/components/shell/Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-zinc-50">
        <div className="mx-auto flex max-w-[1400px]">
          <Sidebar />
          <div className="flex-1 min-w-0">
            <Topbar title="WorkPonto" />
            <main>{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}