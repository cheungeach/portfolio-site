import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getReport, getStories, currentWeek, weekLabel } from "@/lib/report";
import { ReportView } from "@/components/ReportView";

export default async function ReportPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  if (!user.onboarded) redirect("/onboarding");
  const week = currentWeek();
  const jobs = getReport(user.id, week);
  const stories = getStories(user.id);
  return <ReportView jobs={jobs} stories={stories} weekLabel={weekLabel(week)} />;
}
