import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { slug } = await params;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
  }

  const filePath = path.join(DATA_DIR, "brochures", `${slug}.pdf`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await query("UPDATE public.boiler_models SET brochure_url = NULL WHERE slug = $1", [slug]);

  return NextResponse.json({ success: true });
}
