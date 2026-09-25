"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { logout } from "@/app/(auth)/actions";

const LINKS = [["/report", "Report"], ["/tracker", "Tracker"], ["/vault", "Vault"], ["/settings", "Settings"]] as const;

export function Nav({ name, onboarded }: { name: string; onboarded: boolean }) {
  const path = usePathname();
  return (
    <nav className="nav">
      <Link href={onboarded ? "/report" : "/onboarding"} className="nav-brand">Pathfinder</Link>
      {onboarded && LINKS.map(([href, label]) => (
        <Link key={href} href={href} aria-current={path.startsWith(href) || (href === "/report" && path.startsWith("/jobs")) ? "page" : undefined}>{label}</Link>
      ))}
      <ThemeToggle />
      <form action={logout}><button className="btn btn-ghost btn-sm" title={`Signed in as ${name}`}><span className="avatar">{name.charAt(0).toUpperCase()}</span> Sign out</button></form>
    </nav>
  );
}
