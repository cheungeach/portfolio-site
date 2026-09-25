"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { Mode, ReportJob, Story } from "@/lib/types";
import { decide, regenerate, runFirstReport } from "@/app/(app)/actions";
import { DeadlineBadge, MatchRing, ModeSwitch, ReasonTag, StateCard, StoryChip, Tag, REASON_LABEL } from "./ui";

type Filter = "all" | "DL" | "MT" | "BT" | "EZ" | "undecided";
const FILTERS: [Filter, string][] = [["all", "All"], ["DL", "Closing soon"], ["MT", "Strong match"], ["BT", "Big title"], ["EZ", "Easy to get"], ["undecided", "Undecided"]];

export function ReportView({ jobs: initial, stories, weekLabel }: { jobs: ReportJob[]; stories: Story[]; weekLabel: string }) {
  const [jobs, setJobs] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<number | null>(initial[0]?.id ?? null);
  const [sheet, setSheet] = useState(false);
  const [help, setHelp] = useState(false);
  const [pending, start] = useTransition();
  useEffect(() => setJobs(initial), [initial]);

  const visible = useMemo(() => jobs.filter((j) => filter === "all" ? true : filter === "undecided" ? !j.mode : j.reasons.some((r) => r.code === filter)), [jobs, filter]);
  const counts = { focus: jobs.filter((j) => j.mode === "focus").length, assist: jobs.filter((j) => j.mode === "assist").length, skipped: jobs.filter((j) => j.mode === "skip").length, undecided: jobs.filter((j) => !j.mode).length, closing: jobs.filter((j) => j.deadlineDays <= 7).length };
  const current = jobs.find((j) => j.id === selected) ?? visible[0];

  function setMode(id: number, mode: Mode) {
    setJobs((js) => js.map((j) => (j.id === id ? { ...j, mode } : j))); // optimistic
    start(() => decide(id, mode));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      const idx = visible.findIndex((j) => j.id === current?.id);
      if (e.key === "j" || e.key === "J") setSelected(visible[Math.min(visible.length - 1, idx + 1)]?.id ?? null);
      else if (e.key === "k" || e.key === "K") setSelected(visible[Math.max(0, idx - 1)]?.id ?? null);
      else if (current && e.key === "1") setMode(current.id, "focus");
      else if (current && e.key === "2") setMode(current.id, "assist");
      else if (current && (e.key === "s" || e.key === "S")) setMode(current.id, "skip");
      else if (e.key === "?") setHelp((h) => !h);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!jobs.length) {
    return (
      <div className="report-empty">
        <StateCard kind="empty" eyebrow="Empty · before first run" title={weekLabel} body="Your first report lands Monday 8:00. Twenty jobs, chosen for your directions — you decide what happens to each." action="Run it now" onAction={() => start(() => runFirstReport())} />
      </div>
    );
  }

  return (
    <div className="report">
      <header className="pf-week">
        <div>
          <h1>{weekLabel}</h1>
          <div className="pf-week-sub">{jobs.length} jobs · {counts.closing} closing this week · {counts.focus} focus, {counts.assist} assist</div>
        </div>
        <div className="pf-week-actions">
          <button className="btn btn-secondary" disabled={pending} onClick={() => start(() => regenerate())}>Regenerate</button>
          <Link className="btn btn-primary" href="/tracker">Send {counts.focus + counts.assist} to Tracker</Link>
        </div>
      </header>

      <div className="filters" role="tablist" aria-label="Filter">
        {FILTERS.map(([k, label]) => <button key={k} role="tab" aria-selected={filter === k} className={`chip${filter === k ? " chip-on" : ""}`} onClick={() => setFilter(k)}>{label}</button>)}
      </div>

      <div className="report-grid">
        <div className="job-list" role="list">
          {visible.map((r) => (
            <article key={r.id} role="listitem" className={`pf-job${current?.id === r.id ? " pf-job-current" : ""}`} data-status={r.mode === "skip" ? "skipped" : r.mode ? "decided" : "undecided"} data-mode={r.mode ?? ""} tabIndex={0}
              onClick={() => { setSelected(r.id); setSheet(true); }} onFocus={() => setSelected(r.id)}>
              <div className="pf-job-avatar" aria-hidden="true">{r.job.org.charAt(0)}</div>
              <div className="pf-job-main">
                <div className="pf-job-head">
                  <div style={{ minWidth: 0 }}>
                    <div className="pf-job-title">{r.job.title}</div>
                    <div className="pf-job-meta"><span>{r.job.org}</span><Tag label={r.job.type} /><DeadlineBadge days={r.deadlineDays} /></div>
                  </div>
                  <MatchRing score={r.score} />
                </div>
                <div className="pf-job-foot">
                  <div className="pf-job-reasons">{r.reasons.map((x) => <ReasonTag key={x.code} {...x} />)}</div>
                  <div onClick={(e) => e.stopPropagation()}><ModeSwitch value={r.mode} onChange={(m) => setMode(r.id, m)} /></div>
                </div>
              </div>
            </article>
          ))}
          {!visible.length && <StateCard kind="empty" title="Nothing under this filter" body="Try another filter, or regenerate the report." />}
        </div>

        {current && (
          <aside className={`detail${sheet ? " detail-open" : ""}`} aria-label="Job detail">
            <button className="btn btn-ghost btn-sm detail-close" onClick={() => setSheet(false)}>Close</button>
            <div className="text-muted small">{current.job.org} · <Tag label={current.job.type} /> · closes {current.job.deadline}</div>
            <h2 className="section-heading">{current.job.title}</h2>
            <div className="detail-row">
              <div className="detail-match"><MatchRing score={current.score} size="lg" /><div><b>Match</b><div className="text-muted small">{current.storyIds.length} of your stories fit</div></div></div>
              <div><b>Your mode</b><div className="text-muted small">{current.mode ? current.mode : "Undecided — press 1, 2 or S"}</div><div style={{ marginTop: 6 }}><ModeSwitch value={current.mode} onChange={(m) => setMode(current.id, m)} /></div></div>
            </div>
            <div className="eyebrow eyebrow-muted">Why it&apos;s on your list</div>
            <ul className="why">{current.reasons.map((x) => <li key={x.code}><ReasonTag {...x} /><span>{x.why}</span></li>)}</ul>
            <div className="eyebrow eyebrow-muted">Stories that fit</div>
            <div className="chips">{current.storyIds.length ? current.storyIds.map((id) => { const s = stories.find((x) => x.id === id); return s ? <StoryChip key={id} id={id} title={s.title} /> : null; }) : <span className="text-muted small">None yet — add a story about this area in the Vault.</span>}</div>
            <p>{current.rationale}</p>
            <div className="actions">
              <Link className="btn btn-primary" href={`/jobs/${current.job.id}`} onClick={() => { if (!current.mode) setMode(current.id, "assist"); }}>Open workspace</Link>
              {current.job.url ? <a className="btn btn-secondary" href={current.job.url} target="_blank" rel="noreferrer">View posting</a> : <button className="btn btn-secondary" disabled>View posting</button>}
            </div>
          </aside>
        )}
      </div>

      <footer className="report-foot">
        <div><b>{counts.focus} focus</b> · <b>{counts.assist} assist</b> · <b>{counts.skipped} skipped</b> · <span className="text-muted">{counts.undecided} undecided</span></div>
        <div className="text-muted small kbd">J/K move · 1/2 set mode · S skip · <button className="linkish" onClick={() => setHelp(!help)}>? help</button></div>
        <Link className="btn btn-primary btn-sm" href="/tracker">Send {counts.focus + counts.assist} to Tracker</Link>
      </footer>

      {help && (
        <div className="dialog-backdrop" onClick={() => setHelp(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">Keyboard</div>
            <table className="table"><tbody>
              <tr><td><kbd>J</kbd> / <kbd>K</kbd></td><td>Next / previous job</td></tr>
              <tr><td><kbd>1</kbd></td><td>Set Focus</td></tr>
              <tr><td><kbd>2</kbd></td><td>Set Assist</td></tr>
              <tr><td><kbd>S</kbd></td><td>Skip</td></tr>
              <tr><td><kbd>?</kbd></td><td>This sheet</td></tr>
            </tbody></table>
            <div className="dialog-actions"><button className="btn btn-secondary" onClick={() => setHelp(false)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
export { REASON_LABEL };
