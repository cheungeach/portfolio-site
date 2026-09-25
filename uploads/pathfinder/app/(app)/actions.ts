"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { setMode, regenerateReport, setStatus, saveParagraphs, generateReport, type Mode, type Paragraph } from "@/lib/report";

async function uid() { const u = await getUser(); if (!u) redirect("/login"); return u; }

export async function decide(reportId: number, mode: Mode) {
  const u = await uid(); setMode(u.id, reportId, mode); revalidatePath("/report"); revalidatePath("/tracker");
}
export async function regenerate() {
  const u = await uid(); regenerateReport(u.id, undefined, u.quota); revalidatePath("/report");
}
export async function runFirstReport() {
  const u = await uid(); generateReport(u.id, undefined, u.quota); revalidatePath("/report");
}
export async function updateStatus(appId: number, status: string) {
  const u = await uid(); setStatus(u.id, appId, status); revalidatePath("/tracker");
}
export async function saveMaterials(appId: number, paragraphs: Paragraph[]) {
  const u = await uid(); saveParagraphs(u.id, appId, paragraphs); revalidatePath("/jobs");
}

// Onboarding + vault
export async function saveDirections(dirs: { id?: number; name: string; hint: string }[]) {
  const u = await uid();
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM directions WHERE user_id=?").run(u.id);
    const ins = db.prepare("INSERT INTO directions (user_id,name,hint,rank) VALUES (?,?,?,?)");
    dirs.forEach((d, i) => d.name.trim() && ins.run(u.id, d.name.trim(), d.hint.trim(), i + 1));
  });
  tx(); revalidatePath("/onboarding"); revalidatePath("/vault");
}
export async function addResume(form: FormData) {
  const u = await uid();
  const name = String(form.get("name") || "").trim(); const summary = String(form.get("summary") || "").trim(); const dir = Number(form.get("direction_id") || 0) || null;
  if (!name) return;
  db.prepare("INSERT INTO resumes (user_id,name,summary,direction_id) VALUES (?,?,?,?)").run(u.id, name, summary, dir);
  revalidatePath("/onboarding"); revalidatePath("/vault");
}
export async function deleteResume(id: number) {
  const u = await uid(); db.prepare("DELETE FROM resumes WHERE id=? AND user_id=?").run(id, u.id); revalidatePath("/vault"); revalidatePath("/onboarding");
}
export async function addStories(stories: { title: string; body: string; tags: string }[]) {
  const u = await uid();
  const ins = db.prepare("INSERT INTO stories (user_id,title,body,tags) VALUES (?,?,?,?)");
  const tx = db.transaction(() => stories.forEach((s) => s.body.trim() && ins.run(u.id, s.title.trim() || s.body.trim().split(/\s+/).slice(0, 5).join(" "), s.body.trim(), s.tags.trim())));
  tx(); revalidatePath("/onboarding"); revalidatePath("/vault");
}
export async function updateStory(id: number, title: string, body: string, tags: string) {
  const u = await uid(); db.prepare("UPDATE stories SET title=?, body=?, tags=? WHERE id=? AND user_id=?").run(title, body, tags, id, u.id); revalidatePath("/vault");
}
export async function deleteStory(id: number) {
  const u = await uid(); db.prepare("DELETE FROM stories WHERE id=? AND user_id=?").run(id, u.id); revalidatePath("/vault");
}
export async function finishOnboarding() {
  const u = await uid();
  db.prepare("UPDATE users SET onboarded=1 WHERE id=?").run(u.id);
  generateReport(u.id, undefined, u.quota);
  redirect("/report");
}
export async function saveSettings(form: FormData) {
  const u = await uid();
  const quota = Math.max(5, Math.min(40, Number(form.get("quota") || 20)));
  db.prepare("UPDATE users SET quota=?, report_day=?, report_channel=?, school_pack=?, name=? WHERE id=?").run(quota, String(form.get("report_day") || "Monday"), String(form.get("report_channel") || "email"), String(form.get("school_pack") || "berkeley"), String(form.get("name") || u.name).trim() || u.name, u.id);
  revalidatePath("/settings");
}
export async function deleteAccount() {
  const u = await uid(); db.prepare("DELETE FROM users WHERE id=?").run(u.id);
  const { clearSession } = await import("@/lib/auth"); await clearSession(); redirect("/signup");
}
