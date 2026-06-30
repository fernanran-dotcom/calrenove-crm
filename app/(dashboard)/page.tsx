import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus, History, Handshake, DollarSign, Users, Settings } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

async function getMetrics(userId: string) {
  const supabase = await createClient();

  const { data: budgets } = await supabase
    .from("budgets")
    .select("commercial_status, payment_status, total")
    .eq("user_id", userId);

  const total = budgets?.length || 0;
  const pending = budgets?.filter((b) => b.commercial_status === "pending").length || 0;
  const accepted = budgets?.filter((b) => b.commercial_status === "accepted").length || 0;
  const rejected = budgets?.filter((b) => b.commercial_status === "rejected").length || 0;
  const decisions = accepted + rejected;
  const rate = decisions > 0 ? Math.round((accepted / decisions) * 100) : 0;
  const totalAccepted = budgets?.filter((b) => b.commercial_status === "accepted")
    .reduce((s, b) => s + Number(b.total), 0) || 0;
  const totalPendingPayment = budgets?.filter((b) => b.commercial_status === "accepted" && (b.payment_status === "pending" || b.payment_status === "partial"))
    .reduce((s, b) => s + Number(b.total), 0) || 0;
  const partialCount = budgets?.filter((b) => b.payment_status === "partial").length || 0;
  const noPaymentCount = budgets?.filter((b) => b.commercial_status === "accepted" && b.payment_status === "pending").length || 0;

  return { total, pending, accepted, rejected, rate, totalAccepted, totalPendingPayment, partialCount, noPaymentCount };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const m = await getMetrics(user.id);

  const quickActions = [
    { href: "/presupuestos/nuevo", label: "Nuevo presupuesto", icon: FilePlus, color: "bg-blue-600" },
    { href: "/presupuestos", label: "Historial", icon: History, color: "bg-slate-600" },
    { href: "/crm", label: "Seguimiento CRM", icon: Handshake, color: "bg-emerald-600" },
    { href: "/cobros", label: "Cobros pendientes", icon: DollarSign, color: "bg-amber-600" },
    { href: "/clientes", label: "Clientes", icon: Users, color: "bg-purple-600" },
    { href: "/ajustes", label: "Ajustes", icon: Settings, color: "bg-gray-600" },
  ];

  const metrics = [
    { label: "Presupuestos generados", value: m.total },
    { label: "Pendientes", value: m.pending, color: "text-amber-600" },
    { label: "Aceptados", value: m.accepted, color: "text-emerald-600" },
    { label: "Rechazados", value: m.rejected, color: "text-red-600" },
    { label: "Índice aceptación", value: `${m.rate}%` },
    { label: "Total aceptado", value: formatCurrency(m.totalAccepted) },
    { label: "Total pendiente cobro", value: formatCurrency(m.totalPendingPayment), color: "text-amber-600" },
    { label: "Cobro parcial", value: m.partialCount, color: "text-blue-600" },
    { label: "Sin cobro", value: m.noPaymentCount, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
              <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider leading-tight">
                {m.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
              <p className={`text-lg sm:text-2xl font-bold ${m.color || ""}`}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-base sm:text-lg font-semibold mt-6 sm:mt-8 mb-2 sm:mb-3">Accesos rápidos</h2>
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {quickActions.map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.href} href={a.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="flex flex-col items-center justify-center p-4 gap-2 text-center">
                  <div className={`${a.color} text-white p-2 rounded-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">{a.label}</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
