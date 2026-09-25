import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getApplications } from "@/lib/report";
import { TrackerView } from "@/components/TrackerView";

export default async function TrackerPage() {
  const user = await getUser(); if (!user) redirect("/login");
  return <TrackerView apps={getApplications(user.id)} />;
}
