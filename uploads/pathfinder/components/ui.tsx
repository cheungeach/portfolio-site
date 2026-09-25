"use client";
// Pathfinder signature components — same class names and data attributes as the Pathfinder Design System (components/bundle.css), so the CSS applies unchanged.
import type { Mode, Reason } from "@/lib/types";

export const REASON_LABEL: Record<Reason["code"], string> = { DL: "Closes soon", MT: "Strong match", BT: "Big title", EZ: "Easy to get" };
const MODES: [Mode, string][] = [["skip", "Skip"], ["focus", "Focus"], ["assist", "Assist"], ["managed", "Managed"]];

const Lock = () => (
  <svg width="10" height="10" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M208 80h-32V56a48 48 0 0 0-96 0v24H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16ZM96 56a32 32 0 0 1 64 0v24H96Z" /></svg>
);

export function ModeSwitch({ value, onChange, locked = ["managed"], label = "Mode" }: { value: Mode | null; onChange?: (m: Mode) => void; locked?: Mode[]; label?: string }) {
  return (
    <div className="pf-mode" role="radiogroup" aria-label={label}>
      {MODES.map(([k, text]) => {
        const isLocked = locked.includes(k);
        return (
          <button key={k} type="button" role="radio" className="pf-mode-opt" data-mode={k} aria-checked={value === k} disabled={isLocked}
            title={isLocked ? `${text} — coming soon` : `Set ${text}`} onClick={() => !isLocked && onChange?.(k)}>
            {text}{isLocked && <Lock />}
          </button>
        );
      })}
    </div>
  );
}

export function ReasonTag({ code, why, label }: Reason & { label?: string }) {
  return (
    <span className="pf-reason" data-code={code} tabIndex={0} aria-label={`${label ?? REASON_LABEL[code]}. ${why}`}>
      <b>{code}</b><span>{label ?? REASON_LABEL[code]}</span>
      {why && <span className="pf-why" role="tooltip">{why}</span>}
    </span>
  );
}

export function DeadlineBadge({ days }: { days: number }) {
  const urgent = days <= 7;
  return <span className="pf-ddl" data-urgent={urgent} title={`Closes in ${days} days`}>{days}d</span>;
}

export function MatchRing({ score, size = "md" }: { score: number; size?: "md" | "lg" }) {
  const lg = size === "lg";
  const r = lg ? 19 : 12, dim = lg ? 44 : 28, c = dim / 2, circ = 2 * Math.PI * r;
  const t = Math.max(0, Math.min(1, (score - 60) / 30));
  const color = `color-mix(in oklch, var(--pf-match) ${Math.round(t * 100)}%, var(--color-neutral-500))`;
  return (
    <span className={`pf-ring${lg ? " pf-ring-lg" : ""}`} role="img" aria-label={`Match ${score}`}>
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} aria-hidden="true">
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--color-neutral-300)" strokeWidth={lg ? 3 : 2} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={lg ? 3 : 2} strokeLinecap="round" strokeDasharray={`${(circ * score) / 100} ${circ}`} transform={`rotate(-90 ${c} ${c})`} />
      </svg>
      <span className="pf-ring-val">{score}</span>
    </span>
  );
}

export function Tag({ label, variant = "neutral" }: { label: string; variant?: "neutral" | "accent" | "accent-2" | "outline" }) {
  return <span className={`tag tag-${variant}`}>{label}</span>;
}

export function StoryChip({ id, title, state, onClick }: { id: number; title: string; state?: "default" | "hover" | "selected"; onClick?: () => void }) {
  return <button type="button" className="pf-story" data-state={state ?? "default"} onClick={onClick}><b>#{id}</b><span>{title}</span></button>;
}

export function StateCard({ kind, eyebrow, title, body, action, onAction, actionHref }: { kind: "empty" | "loading" | "error"; eyebrow?: string; title?: string; body?: string; action?: string; onAction?: () => void; actionHref?: string }) {
  return (
    <div className="pf-state" data-kind={kind} role={kind === "error" ? "alert" : undefined}>
      {eyebrow && <div className="eyebrow eyebrow-muted">{eyebrow}</div>}
      {kind === "loading" ? (<><div className="pf-skel" style={{ width: "55%" }} /><div className="pf-skel" style={{ width: "80%" }} /><div className="pf-skel pf-skel-block" /><div className="pf-skel pf-skel-block" /></>) : (
        <>
          {title && <div className="pf-state-title">{title}</div>}
          {body && <div className="pf-state-body">{body}</div>}
          {action && (actionHref ? <a className={`btn btn-sm ${kind === "error" ? "btn-secondary" : "btn-primary"}`} href={actionHref}>{action}</a> : <button type="button" className={`btn btn-sm ${kind === "error" ? "btn-secondary" : "btn-primary"}`} onClick={onAction}>{action}</button>)}
        </>
      )}
    </div>
  );
}
