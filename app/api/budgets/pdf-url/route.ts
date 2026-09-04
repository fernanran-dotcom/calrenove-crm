import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { budgetId, url } = await req.json();
  if (!budgetId || !url) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

  await query(
    "UPDATE public.budgets SET pdf_url = $1, updated_at = now() WHERE id = $2 AND user_id = $3",
    [url, budgetId, user.id]
  );

  return NextResponse.json({ success: true });
}
