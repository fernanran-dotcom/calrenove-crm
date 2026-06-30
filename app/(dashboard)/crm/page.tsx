import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommercialStatusBadge } from "@/components/presupuestos/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { UpdateStatusForm } from "./update-status-form";

export const dynamic = "force-dynamic";

async function getCRMData(userId: string) {
  const supabase = await createClient();
  const { data: budgets } = await supabase
    .from("budgets")
    .select("*, customer:customers(*), company:companies(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const total = budgets?.length || 0;
  const accepted = budgets?.filter((b) => b.commercial_status === "accepted").length || 0;
  const rejected = budgets?.filter((b) => b.commercial_status === "rejected").length || 0;
  const pending = budgets?.filter((b) => b.commercial_status === "pending").length || 0;
  const decisions = accepted + rejected;
  const rate = decisions > 0 ? Math.round((accepted / decisions) * 100) : 0;

  return { budgets: budgets || [], total, accepted, rejected, pending, rate };
}

export default async function CRMPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { budgets, total, accepted, rejected, pending, rate } = await getCRMData(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">CRM — Seguimiento de presupuestos</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase">Totales</CardTitle></CardHeader><CardContent className="p-4 pt-0"><p className="text-2xl font-bold">{total}</p></CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase">Pendientes</CardTitle></CardHeader><CardContent className="p-4 pt-0"><p className="text-2xl font-bold text-amber-600">{pending}</p></CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase">Aceptados</CardTitle></CardHeader><CardContent className="p-4 pt-0"><p className="text-2xl font-bold text-emerald-600">{accepted}</p></CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase">Rechazados</CardTitle></CardHeader><CardContent className="p-4 pt-0"><p className="text-2xl font-bold text-red-600">{rejected}</p></CardContent></Card>
        <Card><CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase">Aceptación</CardTitle></CardHeader><CardContent className="p-4 pt-0"><p className="text-2xl font-bold">{rate}%</p></CardContent></Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Índice de aceptación: presupuestos aceptados / (aceptados + rechazados) = {rate}%
      </p>

      <Card>
        <CardContent className="p-0">
          {budgets.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No hay presupuestos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-mobile-card">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Nº</th>
                    <th className="text-left p-3 font-medium">Fecha</th>
                    <th className="text-left p-3 font-medium">Cliente</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Empresa</th>
                    <th className="text-right p-3 font-medium">Total</th>
                    <th className="text-center p-3 font-medium">Estado</th>
                    <th className="text-center p-3 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((b) => (
                    <tr key={b.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs" data-label="Nº">{b.budget_number}</td>
                      <td className="p-3 text-xs" data-label="Fecha">{formatDate(b.issue_date)}</td>
                      <td className="p-3" data-label="Cliente">{b.customer?.name || "—"}</td>
                      <td className="p-3 hidden md:table-cell text-xs text-muted-foreground" data-label="Empresa">{b.company?.name}</td>
                      <td className="p-3 text-right font-medium" data-label="Total">{formatCurrency(b.total)}</td>
                      <td className="p-3 text-center" data-label="Estado">
                        <CommercialStatusBadge status={b.commercial_status} />
                      </td>
                      <td className="p-3 text-center" data-label="">
                        <div className="flex gap-1 justify-center" style={{ display: "inline-flex" }}>
                          <UpdateStatusForm budgetId={b.id} currentStatus={b.commercial_status} />
                          <Link href={`/presupuestos/${b.id}`} className="text-xs text-primary underline ml-2">Ficha</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
