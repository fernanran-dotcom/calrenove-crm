import { getSessionUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { BudgetView } from "@/components/presupuestos/budget-view";
import type { Company } from "@/types";

export const dynamic = "force-dynamic";

export default async function BudgetViewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const budgetRow = await queryOne<any>(
    `SELECT b.*,
       json_build_object('id', c.id, 'name', c.name, 'phone', c.phone, 'address', c.address, 'email', c.email, 'dni', c.dni) AS customer,
       json_build_object('id', br.id, 'name', br.name, 'slug', br.slug) AS brand,
       json_build_object(
         'id', m.id, 'name', m.name, 'slug', m.slug, 'description', m.description,
         'price_final', m.price_final, 'price_base', m.price_base, 'notes', m.notes,
         'brochure_url', m.brochure_url,
         'includes', COALESCE((SELECT json_agg(json_build_object('description', i.description) ORDER BY i.sort_order) FROM public.model_includes i WHERE i.model_id = m.id), '[]'::json),
         'excludes', COALESCE((SELECT json_agg(json_build_object('description', e.description) ORDER BY e.sort_order) FROM public.model_excludes e WHERE e.model_id = m.id), '[]'::json)
       ) AS model
     FROM public.budgets b
     LEFT JOIN public.customers c ON c.id = b.customer_id
     LEFT JOIN public.boiler_brands br ON br.id = b.brand_id
     LEFT JOIN public.boiler_models m ON m.id = b.model_id
     WHERE b.id = $1 AND b.user_id = $2`,
    [id, user.id]
  );
  if (!budgetRow) notFound();

  const company = await queryOne<Company>(
    "SELECT * FROM public.companies WHERE id = $1",
    [budgetRow.company_id]
  );
  if (!company) notFound();

  const optionals = await query<{ id: string; name: string; price: number }>(
    "SELECT id, name, price FROM public.budget_selected_optionals WHERE budget_id = $1 ORDER BY created_at",
    [id]
  );
  const payments = await query<{ id: string; amount: string; payment_date: string; payment_method: string | null }>(
    "SELECT id, amount, payment_date, payment_method FROM public.payments WHERE budget_id = $1 ORDER BY payment_date DESC",
    [id]
  );

  const budget = {
    ...budgetRow,
    total: Number(budgetRow.total),
    subtotal: Number(budgetRow.subtotal),
    iva_amount: Number(budgetRow.iva_amount),
  };

  return (
    <BudgetView
      budget={budget}
      company={company}
      optionals={optionals.map((o) => ({ ...o, price: Number(o.price) }))}
      payments={payments.map((p) => ({ ...p, amount: Number(p.amount) }))}
    />
  );
}
