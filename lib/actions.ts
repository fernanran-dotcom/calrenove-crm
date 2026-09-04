"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { query, queryOne } from "@/lib/db";
import { createSessionToken, COOKIE_NAME, getSessionUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// ============ AUTH ============

export async function login(formData: FormData) {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string;

  const user = await queryOne<{ id: string; password_hash: string }>(
    "SELECT id, password_hash FROM public.users WHERE email = $1",
    [email]
  );
  if (!user) return { error: "Usuario o contraseña incorrectos" };

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return { error: "Usuario o contraseña incorrectos" };

  const { token, maxAge } = createSessionToken(user.id);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge,
  });
  return { success: true };
}

export async function register(formData: FormData) {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string;

  if (password.length < 3) return { error: "La contraseña debe tener al menos 3 caracteres" };

  const existing = await queryOne("SELECT id FROM public.users WHERE email = $1", [email]);
  if (existing) return { error: "Ya existe una cuenta con ese usuario" };

  const hash = await bcrypt.hash(password, 10);
  await query("INSERT INTO public.users (email, password_hash) VALUES ($1, $2)", [email, hash]);
  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  revalidatePath("/");
}

// ============ PRESUPUESTOS ============

async function requireUser(): Promise<string> {
  const user = await getSessionUser();
  if (!user) throw new Error("No autenticado");
  return user.id;
}

export async function createCustomer(data: {
  name: string;
  phone: string | null;
  address: string | null;
  email: string | null;
  dni: string | null;
}) {
  const userId = await requireUser();
  const customer = await queryOne<{ id: string }>(
    `INSERT INTO public.customers (user_id, name, phone, address, email, dni)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [userId, data.name, data.phone, data.address, data.email, data.dni]
  );
  if (!customer) throw new Error("No se pudo crear el cliente");
  return customer;
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
  const userId = await requireUser();

  const numRow = await queryOne<{ next: string }>("SELECT public.get_next_budget_number() AS next");
  const budgetNumber = numRow!.next;

  const budget = await queryOne<{ id: string }>(
    `INSERT INTO public.budgets
      (budget_number, company_id, customer_id, brand_id, model_id, user_id,
       subtotal, iva_rate, iva_amount, total, custom_price, notes,
       brand_name, model_name, description, items, issue_date, valid_until)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     RETURNING id`,
    [
      budgetNumber, data.company_id, data.customer_id, data.brand_id, data.model_id, userId,
      data.subtotal, data.iva_rate, data.iva_amount, data.total,
      data.custom_price || null, data.notes || null,
      data.brand_name || null, data.model_name || null, data.description || null,
      JSON.stringify(data.items || []), data.issue_date, data.valid_until,
    ]
  );
  if (!budget) throw new Error("No se pudo crear el presupuesto");

  if (data.selected_optionals?.length) {
    for (const opt of data.selected_optionals) {
      await query(
        "INSERT INTO public.budget_selected_optionals (budget_id, optional_id, name, price) VALUES ($1,$2,$3,$4)",
        [budget.id, opt.optional_id, opt.name, opt.price]
      );
    }
  }

  revalidatePath("/");
  return budget;
}

export async function updateCommercialStatus(
  budgetId: string,
  newStatus: "pending" | "accepted" | "rejected"
) {
  const userId = await requireUser();

  const current = await queryOne<{ commercial_status: string }>(
    "SELECT commercial_status FROM public.budgets WHERE id = $1 AND user_id = $2",
    [budgetId, userId]
  );
  if (!current) throw new Error("Presupuesto no encontrado");

  const now = new Date().toISOString();
  await query(
    `UPDATE public.budgets SET
       commercial_status = $1,
       accepted_at = $2,
       rejected_at = $3,
       payment_status = $4,
       updated_at = now()
     WHERE id = $5`,
    [
      newStatus,
      newStatus === "accepted" ? now : null,
      newStatus === "rejected" ? now : null,
      newStatus === "rejected" ? "paid" : newStatus === "pending" ? "pending" : null,
      budgetId,
    ]
  );

  await query(
    "INSERT INTO public.budget_status_history (budget_id, user_id, previous_status, new_status) VALUES ($1,$2,$3,$4)",
    [budgetId, userId, current.commercial_status, newStatus]
  );

  revalidatePath("/");
}

export async function registerPayment(data: {
  budget_id: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  notes?: string;
}) {
  await requireUser();

  await query(
    "INSERT INTO public.payments (budget_id, amount, payment_date, payment_method, notes) VALUES ($1,$2,$3,$4,$5)",
    [data.budget_id, data.amount, data.payment_date, data.payment_method || null, data.notes || null]
  );

  const paidRow = await queryOne<{ total: string }>(
    "SELECT COALESCE(SUM(amount),0) AS total FROM public.payments WHERE budget_id = $1",
    [data.budget_id]
  );
  const budgetRow = await queryOne<{ total: string }>(
    "SELECT total FROM public.budgets WHERE id = $1",
    [data.budget_id]
  );

  const totalPaid = Number(paidRow?.total || 0);
  const budgetTotal = Number(budgetRow?.total || 0);
  const status = totalPaid >= budgetTotal ? "paid" : totalPaid > 0 ? "partial" : "pending";

  await query(
    "UPDATE public.budgets SET payment_status = $1, updated_at = now() WHERE id = $2",
    [status, data.budget_id]
  );

  revalidatePath("/");
}

export async function upsertReminderSettings(data: { enabled: boolean; frequency_days: number }) {
  const userId = await requireUser();

  const existing = await queryOne("SELECT id FROM public.email_reminder_settings WHERE user_id = $1", [userId]);
  if (existing) {
    await query(
      "UPDATE public.email_reminder_settings SET enabled = $1, frequency_days = $2, updated_at = now() WHERE user_id = $3",
      [data.enabled, data.frequency_days, userId]
    );
  } else {
    await query(
      "INSERT INTO public.email_reminder_settings (user_id, enabled, frequency_days) VALUES ($1,$2,$3)",
      [userId, data.enabled, data.frequency_days]
    );
  }
  revalidatePath("/");
}

export async function updatePassword(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return { error: "No autenticado" };

  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (password !== confirm) return { error: "Las contraseñas no coinciden" };
  if (password.length < 3) return { error: "La contraseña debe tener al menos 3 caracteres" };

  const hash = await bcrypt.hash(password, 10);
  await query("UPDATE public.users SET password_hash = $1 WHERE id = $2", [hash, user.id]);
  return { success: true };
}

// ============ CATÁLOGO (Otra marca) ============

export async function createCustomBrandAndModel(data: {
  brandName: string;
  modelName: string;
  description: string;
  includes: string[];
  excludes: string[];
  subtotal: number;
}) {
  const brandSlug =
    data.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") +
    "-" + Date.now().toString(36).slice(-4);
  const modelSlug =
    (data.modelName || "personalizado").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") +
    "-" + Date.now().toString(36).slice(-4);

  const brand = await queryOne<{ id: string }>(
    "SELECT id FROM public.boiler_brands WHERE slug = $1",
    [brandSlug]
  );
  let brandId = brand?.id;
  if (!brandId) {
    const nb = await queryOne<{ id: string }>(
      "INSERT INTO public.boiler_brands (name, slug, is_custom) VALUES ($1,$2,true) RETURNING id",
      [data.brandName.trim(), brandSlug]
    );
    brandId = nb!.id;
  }

  const nm = await queryOne<{ id: string }>(
    `INSERT INTO public.boiler_models (brand_id, name, slug, description, price_base, price_final, price_rounded)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [
      brandId,
      data.modelName.trim() || "Personalizado",
      modelSlug,
      data.description || data.modelName.trim() || "Presupuesto personalizado",
      0, data.subtotal, data.subtotal,
    ]
  );
  const modelId = nm!.id;

  const inclLines = data.includes.map((s) => s.trim()).filter(Boolean);
  const exclLines = data.excludes.map((s) => s.trim()).filter(Boolean);
  if (inclLines.length) {
    await query(
      `INSERT INTO public.model_includes (model_id, description, sort_order)
       SELECT $1, d, o FROM unnest($2::text[]) AS d, unnest($3::int[]) AS o`,
      [modelId, inclLines, inclLines.map((_, i) => i + 1)]
    );
  }
  if (exclLines.length) {
    await query(
      `INSERT INTO public.model_excludes (model_id, description, sort_order)
       SELECT $1, d, o FROM unnest($2::text[]) AS d, unnest($3::int[]) AS o`,
      [modelId, exclLines, exclLines.map((_, i) => i + 1)]
    );
  }

  return { brandId, modelId };
}
