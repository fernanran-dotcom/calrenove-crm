import crypto from "crypto";
import { queryOne } from "@/lib/db";

const COOKIE_NAME = "crm_session";
const SESSION_DAYS = 30;

function getSecret(): string {
  return process.env.SESSION_SECRET || "cambia-esta-clave-secreta-en-produccion";
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: string): { token: string; maxAge: number } {
  const maxAge = SESSION_DAYS * 86400;
  const payload = b64url(Buffer.from(JSON.stringify({ uid: userId, exp: Math.floor(Date.now() / 1000) + maxAge })));
  return { token: `${payload}.${sign(payload)}`, maxAge };
}

export function verifySessionToken(token: string): string | null {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.uid || !data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data.uid;
  } catch {
    return null;
  }
}

export interface SessionUser {
  id: string;
  email: string;
}

/** Lee la cookie de sesión (Server Components / Actions) y devuelve el usuario. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const uid = verifySessionToken(token || "");
  if (!uid) return null;
  const user = await queryOne<{ id: string; email: string }>(
    "SELECT id, email FROM public.users WHERE id = $1",
    [uid]
  );
  return user || null;
}

export { COOKIE_NAME };
