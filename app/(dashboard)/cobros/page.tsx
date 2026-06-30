import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentStatusBadge } from "@/components/presupuestos/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getPaymentsData(userId: string) {
  const supabase = await createClient();
  const { data: budgets } = await supabase
    .from("budgets")
    .select("*, customer:customers(*), company:companies(*), payments:payments(*)")
    .eq("user_id", userId)
    .eq("commercial_status", "accepted")
    .order("created_at", { ascending: false });

  const totalAccepted = budgets?.reduce((s, b) => s + Number(b.total), 0) || 0;
  const totalPaid = budgets?.reduce((s: number, b: any) => {
    const paid = (b.payments || []).reduce((ps: number, p: any) => ps + Number(p.amount), 0);
    return s + paid;
  }, 0) || 0;
  const totalPending = totalAccepted - totalPaid;
  const partialCount = budgets?.filter((b) => b.payment_status === "partial").length || 0;
  const pendingCount = budgets?.filter((b) => b.payment_status === "pending").length || 0;

  return { budgets: budgets || [], totalAccepted, totalPaid, totalPending, partialCount, pendingCount };
}

export default async function CobrosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { budgets, totalAccepted, totalPaid, totalPending, partialCount, pendingCount } = await getPaymentsData(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Cobros</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase">Total aceptado</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold">{formatCurrency(totalAccepted)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase">Total cobrado</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase">Pendiente</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase">Cobro parcial</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold text-blue-600">{partialCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2"><CardTitle className="text-xs font-medium text-muted-foreground uppercase">Sin cobro</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0"><p className="text-2xl font-bold text-red-600">{pendingCount}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {budgets.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No hay presupuestos aceptados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-mobile-card">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Nº</th>
                    <th className="text-left p-3 font-medium">Cliente</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Empresa</th>
                    <th className="text-right p-3 font-medium">Total</th>
                    <th className="text-right p-3 font-medium">Cobrado</th>
                    <th className="text-right p-3 font-medium">Pendiente</th>
                    <th className="text-center p-3 font-medium">Estado</th>
                    <th className="text-center p-3 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((b: any) => {
                    const paid = (b.payments || []).reduce((s: number, p: any) => s + Number(p.amount), 0);
                    const pending = Number(b.total) - paid;
                    return (
                      <tr key={b.id} className="border-b hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs" data-label="Nº">{b.budget_number}</td>
                        <td className="p-3" data-label="Cliente">{b.customer?.name || "—"}</td>
                        <td className="p-3 hidden md:table-cell text-xs text-muted-foreground" data-label="Empresa">{b.company?.name}</td>
                        <td className="p-3 text-right" data-label="Total">{formatCurrency(b.total)}</td>
                        <td className="p-3 text-right text-emerald-600" data-label="Cobrado">{formatCurrency(paid)}</td>
                        <td className="p-3 text-right text-amber-600" data-label="Pendiente">{formatCurrency(pending)}</td>
                        <td className="p-3 text-center" data-label="Estado"><PaymentStatusBadge status={b.payment_status} /></td>
                        <td className="p-3 text-center" data-label="">
                          <Link href={`/presupuestos/${b.id}`} className="text-primary underline text-xs">Gestionar</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
