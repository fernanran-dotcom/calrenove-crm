import { getSessionUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReminderSettingsForm } from "./reminder-settings-form";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const companies = await query<{ id: string; name: string; color: string }>(
    "SELECT id, name, color FROM public.companies ORDER BY name"
  );
  const reminder = await queryOne<{ enabled: boolean; frequency_days: number }>(
    "SELECT enabled, frequency_days FROM public.email_reminder_settings WHERE user_id = $1",
    [user.id]
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>

      <Card>
        <CardHeader><CardTitle>Perfil</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Usuario:</span> {user.email.split("@")[0]}</p>
          <p><span className="text-muted-foreground">ID:</span> <span className="font-mono text-xs">{user.id}</span></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Folletos de equipos</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Sube el PDF de cada caldera o aire acondicionado. Se añadirá al final del presupuesto al imprimir o compartir.
          </p>
          <a href="/ajustes/folletos" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground shadow h-9 px-4 py-2 text-sm font-medium hover:bg-primary/90">
            Gestionar folletos
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Empresas emisoras</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {companies?.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: c.color }} />
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">Color: {c.color}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recordatorios de cobro</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Los recordatorios de presupuestos pendientes de cobro.
          </p>
          <ReminderSettingsForm
            initialEnabled={reminder?.enabled ?? true}
            initialFrequency={reminder?.frequency_days ?? 7}
          />
        </CardContent>
      </Card>
    </div>
  );
}
