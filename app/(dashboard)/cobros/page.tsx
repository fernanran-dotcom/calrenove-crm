import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentStatusBadge } from "@/components/presupuestos/status-badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CobrosPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const budgets = await query<any>(
    `SELECT b.*, c.name AS customer_name, co.name AS company_name,
       COALESCE((SELECT json_agg(json_build_object('amount', p.amount)) FROM public.payments p WHERE p.budget_id = b.id), '[]'::json) AS payments
     FROM public.budgets b
     LEFT JOIN public.customers c ON c.id = b.customer_id
     LEFT JOIN public.companies co ON co.id = b.company_id
     WHERE b.user_id = $1 AND b.commercial_status = 'accepted'
     ORDER BY b.created_at DESC`,
    [user.id]
  );

  const totalAccepted = budgets.reduce((s: number, b: any) => s + Number(b.total), 0);
  const totalPaid = budgets.reduce((s: number, b: any) => {
    return s + (b.payments || []).reduce((ps: number, p: any) => ps + Number(p.amount), 0);
  }, 0);
  const totalPending = totalAccepted - totalPaid;
  const partialCount = budgets.filter((b: any) => b.payment_status === "partial").length;
  const pendingCount = budgets.filter((b: any) => b.payment_status === "pending").length;

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
                    const pend = Number(b.total) - paid;
                    return (
                      <tr key={b.id} className="border-b hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs" data-label="Nº">{b.budget_number}</td>
                        <td className="p-3" data-label="Cliente">{b.customer_name || "—"}</td>
                        <td className="p-3 hidden md:table-cell text-xs text-muted-foreground" data-label="Empresa">{b.company_name}</td>
                        <td className="p-3 text-right" data-label="Total">{formatCurrency(b.total)}</td>
                        <td className="p-3 text-right text-emerald-600" data-label="Cobrado">{formatCurrency(paid)}</td>
                        <td className="p-3 text-right text-amber-600" data-label="Pendiente">{formatCurrency(pend)}</td>
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
