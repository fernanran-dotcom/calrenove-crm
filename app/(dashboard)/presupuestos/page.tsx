import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CommercialStatusBadge, PaymentStatusBadge } from "@/components/presupuestos/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HistorialPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const budgets = await query<any>(
    `SELECT b.*, c.name AS customer_name, co.name AS company_name, m.name AS model_name
     FROM public.budgets b
     LEFT JOIN public.customers c ON c.id = b.customer_id
     LEFT JOIN public.companies co ON co.id = b.company_id
     LEFT JOIN public.boiler_models m ON m.id = b.model_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [user.id]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Historial</h1>
        <Link href="/presupuestos/nuevo" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground shadow h-9 px-4 py-2 text-sm font-medium hover:bg-primary/90">
          Nuevo presupuesto
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {budgets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay presupuestos todavía.</p>
              <Link href="/presupuestos/nuevo" className="text-primary underline mt-2 inline-block">Crear el primero</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-mobile-card">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Nº</th>
                    <th className="text-left p-3 font-medium">Fecha</th>
                    <th className="text-left p-3 font-medium">Cliente</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Empresa</th>
                    <th className="text-left p-3 font-medium hidden lg:table-cell">Modelo</th>
                    <th className="text-right p-3 font-medium">Total</th>
                    <th className="text-center p-3 font-medium">Estado</th>
                    <th className="text-center p-3 font-medium">Cobro</th>
                    <th className="text-center p-3 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((b) => (
                    <tr key={b.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs" data-label="Nº">{b.budget_number}</td>
                      <td className="p-3 text-xs" data-label="Fecha">{formatDate(b.issue_date)}</td>
                      <td className="p-3" data-label="Cliente">{b.customer_name || "—"}</td>
                      <td className="p-3 hidden md:table-cell text-xs text-muted-foreground" data-label="Empresa">{b.company_name}</td>
                      <td className="p-3 hidden lg:table-cell text-xs text-muted-foreground" data-label="Modelo">{b.model_name}</td>
                      <td className="p-3 text-right font-medium" data-label="Total">{formatCurrency(Number(b.total))}</td>
                      <td className="p-3 text-center" data-label="Estado"><CommercialStatusBadge status={b.commercial_status} /></td>
                      <td className="p-3 text-center" data-label="Cobro">{b.commercial_status !== "rejected" ? <PaymentStatusBadge status={b.payment_status} /> : <span className="text-xs text-muted-foreground">—</span>}</td>
                      <td className="p-3 text-center" data-label="">
                        <Link href={`/presupuestos/${b.id}`} className="text-primary underline text-xs">Ver</Link>
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
