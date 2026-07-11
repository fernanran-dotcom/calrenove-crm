"use server";

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
}

export async function register(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error, data } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  if (data.user) {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      await fetch(`${url}/auth/v1/admin/users/${data.user.id}`, {
        method: "PUT",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email_confirm: true }),
      });
    } catch {}
  }

  return { success: true, user: data.user };
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const redirectTo = typeof window !== "undefined"
    ? `${window.location.origin}/auth/callback?next=/reset-password`
    : "https://calrenove-main.vercel.app/auth/callback?next=/reset-password";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (password !== confirm) return { error: "Las contraseñas no coinciden" };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres" };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { success: true };
}

export async function getNextBudgetNumber() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_next_budget_number");
  if (error) throw new Error(error.message);
  return data as string;
}

export async function createBudget(data: {
  company_id: string;
  customer_id: string;
  brand_id: string;
  model_id: string;
  subtotal: number;
  iva_rate: number;
  iva_amount: number;
  total: number;
  custom_price?: number | null;
  notes?: string | null;
  brand_name?: string | null;
  model_name?: string | null;
  description?: string | null;
  items?: any[];
  issue_date: string;
  valid_until: string;
  selected_optionals?: Array<{ optional_id: string; name: string; price: number }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const budgetNumber = await getNextBudgetNumber();

  const insertData: Record<string, any> = {
    budget_number: budgetNumber,
    company_id: data.company_id,
    customer_id: data.customer_id,
    brand_id: data.brand_id,
    model_id: data.model_id,
    user_id: user.id,
    subtotal: data.subtotal,
    iva_rate: data.iva_rate,
    iva_amount: data.iva_amount,
    total: data.total,
    custom_price: data.custom_price || null,
    notes: data.notes || null,
    brand_name: data.brand_name || null,
    model_name: data.model_name || null,
    description: data.description || null,
    items: data.items || [],
    issue_date: data.issue_date,
    valid_until: data.valid_until,
  };

  const { data: budget, error } = await supabase
    .from("budgets")
    .insert(insertData)
    .select()
    .single();

  if (error) throw new Error("Error al insertar presupuesto: " + error.message);
  if (!budget) throw new Error("No se pudo crear el presupuesto (sin respuesta)");

  if (data.selected_optionals?.length) {
    const { error: optError } = await supabase.from("budget_selected_optionals").insert(
      data.selected_optionals.map((opt) => ({
        budget_id: budget.id,
        ...opt,
      }))
    );
    if (optError) throw new Error("Error al guardar opcionales: " + optError.message);
  }

  revalidatePath("/");
  return budget;
}

export async function updateCommercialStatus(
  budgetId: string,
  newStatus: "pending" | "accepted" | "rejected"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: current } = await supabase
    .from("budgets")
    .select("commercial_status")
    .eq("id", budgetId)
    .single();

  const now = new Date().toISOString();
  const updateData: Record<string, any> = {
    commercial_status: newStatus,
    accepted_at: newStatus === "accepted" ? now : null,
    rejected_at: newStatus === "rejected" ? now : null,
    payment_status: newStatus === "rejected" ? "paid" : newStatus === "pending" ? "pending" : undefined,
  };

  const { error } = await supabase
    .from("budgets")
    .update(updateData)
    .eq("id", budgetId);

  if (error) throw new Error(error.message);

  await supabase.from("budget_status_history").insert({
    budget_id: budgetId,
    user_id: user.id,
    previous_status: current?.commercial_status || null,
    new_status: newStatus,
  });

  revalidatePath("/");
}

export async function registerPayment(data: {
  budget_id: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  notes?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("payments").insert({
    budget_id: data.budget_id,
    amount: data.amount,
    payment_date: data.payment_date,
    payment_method: data.payment_method || null,
    notes: data.notes || null,
  });

  if (error) throw new Error(error.message);

  const { data: payments } = await supabase
    .from("payments")
    .select("amount")
    .eq("budget_id", data.budget_id);

  const totalPaid = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  const { data: budget } = await supabase
    .from("budgets")
    .select("total")
    .eq("id", data.budget_id)
    .single();

  let paymentStatus: string;
  if (totalPaid >= Number(budget?.total || 0)) {
    paymentStatus = "paid";
  } else if (totalPaid > 0) {
    paymentStatus = "partial";
  } else {
    paymentStatus = "pending";
  }

  await supabase
    .from("budgets")
    .update({ payment_status: paymentStatus })
    .eq("id", data.budget_id);

  revalidatePath("/");
}

export async function upsertReminderSettings(data: {
  enabled: boolean;
  frequency_days: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("email_reminder_settings").upsert(
    {
      user_id: user.id,
      enabled: data.enabled,
      frequency_days: data.frequency_days,
    },
    { onConflict: "user_id" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/");
}
