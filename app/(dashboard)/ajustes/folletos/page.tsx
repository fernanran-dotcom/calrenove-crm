import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { redirect } from "next/navigation";
import { FolletosManager } from "@/components/ajustes/folletos-manager";
import type { BoilerBrand, BoilerModel } from "@/types";

export const dynamic = "force-dynamic";

export default async function FolletosPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const brands = await query<BoilerBrand>(
    "SELECT * FROM public.boiler_brands WHERE is_custom = false ORDER BY name"
  );
  const models = await query<BoilerModel>(
    `SELECT m.id, m.brand_id, m.name, m.slug, m.price_final, m.brochure_url
     FROM public.boiler_models m
     WHERE m.brand_id IN (SELECT id FROM public.boiler_brands WHERE is_custom = false)
     ORDER BY m.name`
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Folletos de equipos</h1>
      <p className="text-sm text-muted-foreground">
        Sube el folleto en PDF de cada equipo. Se añadirá automáticamente al final del PDF del presupuesto al imprimir o compartir.
      </p>
      <FolletosManager brands={brands} models={models} />
    </div>
  );
}
