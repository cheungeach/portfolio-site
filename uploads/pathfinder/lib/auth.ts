import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";

const COOKIE = "pf_session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "pathfinder-dev-secret-change-me");

export type User = {
  id: number; email: string; name: string; onboarded: number; quota: number;
  report_day: string; report_channel: string; school_pack: string;
};

export async function createSession(userId: number) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function getUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const uid = payload.uid as number;
    const row = db.prepare("SELECT id, email, name, onboarded, quota, report_day, report_channel, school_pack FROM users WHERE id = ?").get(uid) as User | undefined;
    return row ?? null;
  } catch {
    return null;
  }
}

export function hashPassword(pw: string) { return bcrypt.hashSync(pw, 10); }
export function checkPassword(pw: string, hash: string) { return bcrypt.compareSync(pw, hash); }
