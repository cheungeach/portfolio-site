import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Nav } from "@/components/Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");
  return (
    <>
      <Nav name={user.name} onboarded={!!user.onboarded} />
      <main className="page">{children}</main>
    </>
  );
}
