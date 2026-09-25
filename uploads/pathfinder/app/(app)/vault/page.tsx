import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getDirections, getStories } from "@/lib/report";
import { db } from "@/lib/db";
import { VaultView } from "@/components/VaultView";

export default async function VaultPage() {
  const user = await getUser(); if (!user) redirect("/login");
  const resumes = db.prepare("SELECT id,name,summary,direction_id FROM resumes WHERE user_id=? ORDER BY id").all(user.id) as { id: number; name: string; summary: string; direction_id: number | null }[];
  const used = db.prepare("SELECT paragraphs FROM applications WHERE user_id=?").all(user.id) as { paragraphs: string }[];
  const counts: Record<number, number> = {};
  used.forEach((u) => (JSON.parse(u.paragraphs) as { storyIds: number[] }[]).forEach((p) => p.storyIds.forEach((id) => (counts[id] = (counts[id] || 0) + 1))));
  return <VaultView dirs={getDirections(user.id)} resumes={resumes} stories={getStories(user.id)} counts={counts} />;
}
