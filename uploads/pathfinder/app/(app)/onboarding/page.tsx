import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getDirections, getStories } from "@/lib/report";
import { db } from "@/lib/db";
import { Onboarding } from "@/components/Onboarding";

export default async function OnboardingPage() {
  const user = await getUser(); if (!user) redirect("/login");
  const dirs = getDirections(user.id);
  const resumes = db.prepare("SELECT id,name,summary,direction_id FROM resumes WHERE user_id=? ORDER BY id").all(user.id) as { id: number; name: string; summary: string; direction_id: number | null }[];
  return <Onboarding dirs={dirs} resumes={resumes} stories={getStories(user.id)} />;
}
