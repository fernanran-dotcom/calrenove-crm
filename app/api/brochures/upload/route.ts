import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const slug = (formData.get("slug") as string || "").trim();

  if (!file || !slug) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  if (file.type !== "application/pdf") return NextResponse.json({ error: "Solo PDF" }, { status: 400 });
  if (file.size > 30 * 1024 * 1024) return NextResponse.json({ error: "Máximo 30 MB" }, { status: 400 });
  if (!/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });

  const dir = path.join(DATA_DIR, "brochures");
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${slug}.pdf`);
  fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));

  const url = `/api/files/brochures/${slug}.pdf`;
  await query("UPDATE public.boiler_models SET brochure_url = $1 WHERE slug = $2", [url, slug]);

  return NextResponse.json({ url });
}
