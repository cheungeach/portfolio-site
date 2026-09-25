"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import type { Application } from "@/lib/types";
import { STATUSES, daysUntil } from "@/lib/types";
import { updateStatus } from "@/app/(app)/actions";
import { DeadlineBadge, StateCard, Tag } from "./ui";

export function TrackerView({ apps: initial }: { apps: Application[] }) {
  const [apps, setApps] = useState(initial);
  const [view, setView] = useState<"board" | "table">("board");
  const [, start] = useTransition();
  const move = (id: number, status: string) => { setApps((a) => a.map((x) => (x.id === id ? { ...x, status } : x))); start(() => updateStatus(id, status)); };

  if (!apps.length) return <div className="page-narrow"><h1 className="section-heading">Tracker</h1><StateCard kind="empty" title="Nothing tracked yet" body="Set Focus or Assist on a job in this week's report and it lands here." action="Open report" actionHref="/report" /></div>;

  return (
    <div>
      <div className="ws-head"><div><h1 className="section-heading">Tracker</h1><div className="text-muted small">{apps.length} applications</div></div>
        <div className="seg" role="tablist"><button className={`seg-opt${view === "board" ? " on" : ""}`} onClick={() => setView("board")}>Board</button><button className={`seg-opt${view === "table" ? " on" : ""}`} onClick={() => setView("table")}>Table</button></div></div>
      {view === "board" ? (
        <div className="board">
          {STATUSES.map((s) => (
            <div key={s} className="col" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const id = Number(e.dataTransfer.getData("id")); if (id) move(id, s); }}>
              <div className="eyebrow eyebrow-muted">{s} · {apps.filter((a) => a.status === s).length}</div>
              {apps.filter((a) => a.status === s).map((a) => (
                <div key={a.id} className="card tcard" draggable onDragStart={(e) => e.dataTransfer.setData("id", String(a.id))}>
                  <div className="tcard-head"><span className="mode-dot" data-mode={a.mode} /><Link href={`/jobs/${a.job.id}`} className="card-title">{a.job.title}</Link></div>
                  <div className="card-meta">{a.job.org} · <Tag label={a.job.type} /> · <DeadlineBadge days={daysUntil(a.job.deadline)} /></div>
                  <select className="input small-select" value={a.status} onChange={(e) => move(a.id, e.target.value)} aria-label="Status">{STATUSES.map((x) => <option key={x} value={x}>{x}</option>)}</select>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <table className="table"><thead><tr><th>Job</th><th>Org</th><th>Type</th><th>Mode</th><th>Deadline</th><th>Status</th></tr></thead><tbody>
          {apps.map((a) => <tr key={a.id}><td><Link href={`/jobs/${a.job.id}`}>{a.job.title}</Link></td><td>{a.job.org}</td><td><Tag label={a.job.type} /></td><td>{a.mode}</td><td><DeadlineBadge days={daysUntil(a.job.deadline)} /></td><td><select className="input small-select" value={a.status} onChange={(e) => move(a.id, e.target.value)}>{STATUSES.map((x) => <option key={x} value={x}>{x}</option>)}</select></td></tr>)}
        </tbody></table>
      )}
    </div>
  );
}
