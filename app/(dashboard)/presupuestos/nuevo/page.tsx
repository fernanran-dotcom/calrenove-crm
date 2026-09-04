import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { redirect } from "next/navigation";
import { NuevoPresupuestoForm } from "@/components/presupuestos/nuevo-form";
import type { Company, BoilerBrand, BoilerModel } from "@/types";

export const dynamic = "force-dynamic";

export default async function NuevoPresupuestoPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const companies = await query<Company>("SELECT * FROM public.companies ORDER BY name");
  const brands = await query<BoilerBrand>(
    "SELECT * FROM public.boiler_brands WHERE is_custom = false ORDER BY name"
  );
  const models = await query<BoilerModel>(`
    SELECT m.*,
      COALESCE((
        SELECT json_agg(i.description ORDER BY i.sort_order)
        FROM public.model_includes i WHERE i.model_id = m.id
      ), '[]'::json) AS includes,
      COALESCE((
        SELECT json_agg(e.description ORDER BY e.sort_order)
        FROM public.model_excludes e WHERE e.model_id = m.id
      ), '[]'::json) AS excludes,
      COALESCE((
        SELECT json_agg(json_build_object('id', o.id, 'name', o.name, 'price', o.price) ORDER BY o.sort_order)
        FROM public.model_optionals o WHERE o.model_id = m.id
      ), '[]'::json) AS optionals
    FROM public.boiler_models m
    WHERE m.brand_id IN (SELECT id FROM public.boiler_brands WHERE is_custom = false)
    ORDER BY m.name
  `);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Nuevo Presupuesto</h1>
      <NuevoPresupuestoForm companies={companies} brands={brands} models={models} />
    </div>
  );
}
