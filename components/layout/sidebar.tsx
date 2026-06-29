"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions";
import {
  LayoutDashboard,
  FilePlus,
  History,
  Users,
  Handshake,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/presupuestos/nuevo", label: "Nuevo Presupuesto", icon: FilePlus },
  { href: "/presupuestos", label: "Historial", icon: History },
  { href: "/crm", label: "CRM", icon: Handshake },
  { href: "/cobros", label: "Cobros", icon: DollarSign },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="fixed top-3 left-3 z-50 lg:hidden no-print"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform duration-200 lg:relative lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-lg text-[#cc092f]">Calrenove</span>
            <span className="text-xs text-muted-foreground">CRM</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <form action={logout}>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
