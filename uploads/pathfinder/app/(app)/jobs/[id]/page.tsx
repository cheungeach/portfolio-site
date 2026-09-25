import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { ensureMaterials, getApplication, getReportJob, getStories, daysUntil, setMode } from "@/lib/report";
import { db } from "@/lib/db";
import { Workspace } from "@/components/Workspace";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) redirect("/login");
  const jobId = Number((await params).id);
  const rj = getReportJob(user.id, jobId);
  if (!rj) notFound();
  let app = getApplication(user.id, jobId);
  if (!app) { // opened from the report without a decision: default to Assist
    const row = db.prepare("SELECT id FROM report_jobs WHERE user_id=? AND job_id=? ORDER BY week DESC LIMIT 1").get(user.id, jobId) as { id: number };
    setMode(user.id, row.id, "assist");
  }
  app = ensureMaterials(user.id, jobId)!;
  const stories = getStories(user.id);
  return <Workspace app={app} report={rj} stories={stories} days={daysUntil(app.job.deadline)} />;
}
