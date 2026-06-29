import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReminderSettingsForm } from "./reminder-settings-form";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: companies } = await supabase.from("companies").select("*");
  const { data: reminder } = await supabase
    .from("email_reminder_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  const { data: logs } = await supabase
    .from("email_reminder_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("sent_at", { ascending: false })
    .limit(10);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>

      <Card>
        <CardHeader><CardTitle>Perfil</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
          <p><span className="text-muted-foreground">ID:</span> <span className="font-mono text-xs">{user.id}</span></p>
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
            Los recordatorios se envían a tu email ({user.email}) con los presupuestos aceptados pendientes de cobro.
          </p>
          <ReminderSettingsForm
            initialEnabled={reminder?.enabled ?? true}
            initialFrequency={reminder?.frequency_days ?? 7}
          />
        </CardContent>
      </Card>

      {logs && logs.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Últimos avisos enviados</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {logs.map((log) => (
                <div key={log.id} className="flex justify-between text-xs text-muted-foreground border-b pb-1">
                  <span>{new Date(log.sent_at).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  <span>{log.budget_ids?.length || 0} presupuestos</span>
                  <span className={log.status === "sent" ? "text-emerald-600" : "text-red-600"}>{log.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
