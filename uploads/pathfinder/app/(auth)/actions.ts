"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, clearSession, hashPassword, checkPassword } from "@/lib/auth";
import { DEFAULT_DIRECTIONS, seedJobsIfEmpty } from "@/lib/seed";

const SignupSchema = z.object({ name: z.string().trim().min(1, "Tell us your name"), email: z.string().trim().toLowerCase().email("That email doesn't look right"), password: z.string().min(8, "Use at least 8 characters") });
const LoginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });

export type AuthState = { error?: string; email?: string; name?: string } | undefined;

export async function signup(_prev: AuthState, form: FormData): Promise<AuthState> {
  const parsed = SignupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message, email: String(form.get("email") || ""), name: String(form.get("name") || "") };
  const { name, email, password } = parsed.data;
  const exists = db.prepare("SELECT id FROM users WHERE email=?").get(email);
  if (exists) return { error: "There is already an account with that email. Sign in instead.", email, name };
  seedJobsIfEmpty();
  const info = db.prepare("INSERT INTO users (email,name,password_hash) VALUES (?,?,?)").run(email, name, hashPassword(password));
  const uid = Number(info.lastInsertRowid);
  const ins = db.prepare("INSERT INTO directions (user_id,name,hint,rank) VALUES (?,?,?,?)");
  DEFAULT_DIRECTIONS.forEach((d, i) => ins.run(uid, d.name, d.hint, i + 1));
  await createSession(uid);
  redirect("/onboarding");
}

export async function login(_prev: AuthState, form: FormData): Promise<AuthState> {
  const parsed = LoginSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Enter your email and password.", email: String(form.get("email") || "") };
  const row = db.prepare("SELECT id, password_hash, onboarded FROM users WHERE email=?").get(parsed.data.email) as { id: number; password_hash: string; onboarded: number } | undefined;
  if (!row || !checkPassword(parsed.data.password, row.password_hash)) return { error: "Email or password doesn't match.", email: parsed.data.email };
  await createSession(row.id);
  redirect(row.onboarded ? "/report" : "/onboarding");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
