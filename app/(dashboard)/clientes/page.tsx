import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const customers = await query<any>(
    `SELECT c.id, c.name, c.phone, c.email, c.dni,
       count(b.id) AS budget_count,
       COALESCE(SUM(b.total), 0) AS total_budgeted,
       COALESCE(SUM(b.total) FILTER (WHERE b.commercial_status = 'accepted'), 0) AS total_accepted
     FROM public.customers c
     LEFT JOIN public.budgets b ON b.customer_id = c.id
     WHERE c.user_id = $1
     GROUP BY c.id, c.name, c.phone, c.email, c.dni
     ORDER BY c.name`,
    [user.id]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>

      <Card>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No hay clientes registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-mobile-card">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Nombre</th>
                    <th className="text-left p-3 font-medium hidden lg:table-cell">DNI</th>
                    <th className="text-left p-3 font-medium hidden sm:table-cell">Teléfono</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Email</th>
                    <th className="text-right p-3 font-medium">Presupuestos</th>
                    <th className="text-right p-3 font-medium">Total presupuestado</th>
                    <th className="text-right p-3 font-medium">Aceptado</th>
                    <th className="text-center p-3 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium" data-label="Nombre">{c.name}</td>
                      <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs" data-label="DNI">{c.dni || "—"}</td>
                      <td className="p-3 hidden sm:table-cell text-muted-foreground text-xs" data-label="Teléfono">{c.phone || "—"}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground text-xs" data-label="Email">{c.email || "—"}</td>
                      <td className="p-3 text-right" data-label="Presupuestos">{Number(c.budget_count)}</td>
                      <td className="p-3 text-right" data-label="Total presupuestado">{formatCurrency(c.total_budgeted)}</td>
                      <td className="p-3 text-right text-emerald-600" data-label="Aceptado">{formatCurrency(c.total_accepted)}</td>
                      <td className="p-3 text-center" data-label="">
                        <Link href={`/presupuestos?cliente=${encodeURIComponent(c.name)}`} className="text-xs text-primary underline">Ver presupuestos</Link>
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
