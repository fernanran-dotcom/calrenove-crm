import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string; filename: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { userId, filename } = await params;
  if (userId !== user.id) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
  }

  const filePath = path.join(DATA_DIR, "pdfs", userId, filename);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Fichero no encontrado" }, { status: 404 });
  }

  const buf = fs.readFileSync(filePath);
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
