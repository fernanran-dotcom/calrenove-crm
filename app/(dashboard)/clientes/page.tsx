import { createClient } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getCustomers(userId: string) {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("*, budgets:budgets(*)")
    .eq("user_id", userId)
    .order("name");

  return (customers || []).map((c) => ({
    ...c,
    totalBudgeted: (c.budgets || []).reduce((s: number, b: any) => s + Number(b.total), 0),
    totalAccepted: (c.budgets || []).filter((b: any) => b.commercial_status === "accepted").reduce((s: number, b: any) => s + Number(b.total), 0),
    totalPaid: (c.budgets || []).filter((b: any) => b.commercial_status === "accepted").reduce((s: number, b: any) => {
      return s; // We'll get payments in a more detailed query
    }, 0),
    budgetCount: (c.budgets || []).length,
  }));
}

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const customers = await getCustomers(user.id);

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
                      <td className="p-3 hidden sm:table-cell text-muted-foreground text-xs" data-label="Teléfono">{c.phone || "—"}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground text-xs" data-label="Email">{c.email || "—"}</td>
                      <td className="p-3 text-right" data-label="Presupuestos">{c.budgetCount}</td>
                      <td className="p-3 text-right" data-label="Total presupuestado">{formatCurrency(c.totalBudgeted)}</td>
                      <td className="p-3 text-right text-emerald-600" data-label="Aceptado">{formatCurrency(c.totalAccepted)}</td>
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
