import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  let { slug } = await params;
  if (slug.endsWith(".pdf")) slug = slug.slice(0, -4);
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
  }

  const filePath = path.join(DATA_DIR, "brochures", `${slug}.pdf`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Folleto no encontrado" }, { status: 404 });
  }

  const buf = fs.readFileSync(filePath);
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${slug}.pdf"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
