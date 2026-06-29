// Supabase Edge Function: send-reminders
// Triggered by pg_cron or external scheduler to email users about pending collection budgets
// Sends to the authenticated user's email (not the client's)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.12";
import { Resend } from "https://esm.sh/resend@4.0.0";

interface ReminderBudget {
  budget_number: string;
  customer_name: string;
  company_name: string;
  total: number;
  total_paid: number;
  pending: number;
  accepted_at: string;
  budget_id: string;
}

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get all users with reminder settings enabled, along with their pending-collection budgets
  const { data: settings, error: settingsError } = await supabase
    .from("email_reminder_settings")
    .select("*, user:auth.users!inner(email)")
    .eq("enabled", true);

  if (settingsError) {
    return new Response(JSON.stringify({ error: settingsError.message }), { status: 500 });
  }

  const results: { user: string; sent: number }[] = [];

  for (const setting of settings || []) {
    const userEmail = (setting.user as any)?.email;
    if (!userEmail) continue;

    // Get budgets that are accepted and not fully paid
    const { data: budgets } = await supabase
      .from("budgets")
      .select(`
        budget_number,
        total,
        customer:customers(name),
        company:companies(name),
        accepted_at,
        id,
        payments:payments(amount)
      `)
      .eq("user_id", setting.user_id)
      .eq("commercial_status", "accepted")
      .in("payment_status", ["pending", "partial"]);

    if (!budgets || budgets.length === 0) continue;

    const reminderBudgets: ReminderBudget[] = budgets.map((b: any) => {
      const totalPaid = (b.payments || []).reduce((s: number, p: any) => s + Number(p.amount), 0);
      return {
        budget_number: b.budget_number,
        customer_name: b.customer?.name || "—",
        company_name: b.company?.name || "—",
        total: Number(b.total),
        total_paid: totalPaid,
        pending: Number(b.total) - totalPaid,
        accepted_at: b.accepted_at,
        budget_id: b.id,
      };
    });

    let emailSent = false;

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const budgetList = reminderBudgets
          .map(
            (rb) =>
              `- Nº ${rb.budget_number} | ${rb.customer_name} | ${rb.company_name} | Total: ${rb.total.toFixed(2)} € | Cobrado: ${rb.total_paid.toFixed(2)} € | Pendiente: ${rb.pending.toFixed(2)} €`
          )
          .join("\n");

        await resend.emails.send({
          from: "Calrenove CRM <recordatorios@calrenove.com>",
          to: userEmail,
          subject: `Recordatorio de cobro — ${reminderBudgets.length} presupuesto(s) pendiente(s)`,
          text: `Tienes ${reminderBudgets.length} presupuesto(s) aceptados pendientes de cobro:\n\n${budgetList}\n\nAccede a tu panel para gestionarlos.`,
        });
        emailSent = true;
      } catch (err: any) {
        console.error(`Failed to send email to ${userEmail}:`, err.message);
      }
    }

    // Log the reminder
    await supabase.from("email_reminder_logs").insert({
      user_id: setting.user_id,
      budget_ids: reminderBudgets.map((rb) => rb.budget_id),
      status: emailSent ? "sent" : "failed",
      error_message: emailSent ? null : "No Resend API key configured or send failed",
    });

    results.push({ user: userEmail, sent: reminderBudgets.length });
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
