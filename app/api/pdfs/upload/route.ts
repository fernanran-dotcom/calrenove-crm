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

  if (!file) return NextResponse.json({ error: "Falta el fichero" }, { status: 400 });

  const dir = path.join(DATA_DIR, "pdfs", user.id);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, file.name);
  fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));

  const url = `/api/files/pdfs/${user.id}/${encodeURIComponent(file.name)}`;
  return NextResponse.json({ url });
}
