"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import type { Application, Paragraph, ReportJob, Story } from "@/lib/types";
import { saveMaterials } from "@/app/(app)/actions";
import { DeadlineBadge, StateCard, StoryChip, Tag } from "./ui";

type TabKey = "strategy" | "materials" | "submit" | "activity";

export function Workspace({ app, report, stories, days }: { app: Application; report: ReportJob; stories: Story[]; days: number }) {
  const [tab, setTab] = useState<TabKey>(app.mode === "focus" ? "strategy" : "materials");
  const [paras, setParas] = useState<Paragraph[]>(app.paragraphs);
  const [saved, setSaved] = useState<string>("Saved");
  const [pending, start] = useTransition();
  const uncited = paras.filter((p) => !p.storyIds.length).length;
  const [picking, setPicking] = useState<number | null>(null);

  function save(next: Paragraph[]) {
    setParas(next); setSaved("Saving…");
    start(async () => { await saveMaterials(app.id, next); setSaved("Saved just now"); });
  }
  const cite = (i: number, sid: number) => save(paras.map((p, k) => (k === i ? { ...p, storyIds: Array.from(new Set([...p.storyIds, sid])) } : p)));
  const uncite = (i: number, sid: number) => save(paras.map((p, k) => (k === i ? { ...p, storyIds: p.storyIds.filter((x) => x !== sid) } : p)));
  const edit = (i: number, text: string) => setParas(paras.map((p, k) => (k === i ? { ...p, text } : p)));
  const regen = (i: number) => { const s = stories.find((x) => paras[i].storyIds[0] === x.id); if (s) save(paras.map((p, k) => (k === i ? { ...p, text: s.body.split(/(?<=\.)\s/).slice(1, 3).join(" ") || s.body } : p))); };
  const copyAll = () => { navigator.clipboard?.writeText(paras.map((p) => p.text).join("\n\n")).catch(() => {}); };

  return (
    <div className="workspace">
      <div className="text-muted small crumbs"><Link href="/report">← Report</Link> · {app.job.org} · <Tag label={app.job.type} /> · <DeadlineBadge days={days} /></div>
      <div className="ws-head">
        <h1 className="section-heading">{app.job.title}</h1>
        <div className="ws-actions">
          <span className="mode-dot" data-mode={app.mode} /> <span className="small">{app.mode[0].toUpperCase() + app.mode.slice(1)}</span>
          <button className="btn btn-secondary" onClick={() => save(paras)} disabled={pending}>Save draft</button>
          <button className="btn btn-primary" disabled={uncited > 0} title={uncited ? `${uncited} paragraph${uncited > 1 ? "s" : ""} still need a source` : "Continue"} onClick={() => setTab("submit")}>Continue to Submit</button>
        </div>
      </div>
      <div className="tabs" role="tablist">
        {(["strategy", "materials", "submit", "activity"] as TabKey[]).map((k) => <button key={k} role="tab" aria-selected={tab === k} className="tab" onClick={() => setTab(k)}>{k[0].toUpperCase() + k.slice(1)}</button>)}
      </div>

      {tab === "strategy" && (
        <section className="ws-body">
          <div className="eyebrow eyebrow-muted">Strategy brief</div>
          <ul className="strategy">{app.strategy.map((s, i) => <li key={i}>{s}</li>)}</ul>
          <div className="eyebrow eyebrow-muted">Why it&apos;s on your list</div>
          <p>{report.rationale}</p>
        </section>
      )}

      {tab === "materials" && (
        <section className="ws-grid">
          <div className="editor">
            <div className="editor-head"><span className="eyebrow eyebrow-muted">Cover note · {paras.length} paragraphs · {uncited ? `${uncited} needs a source` : "all sourced"}</span><span className="text-muted small">{saved}</span></div>
            {paras.map((p, i) => (
              <div key={i} className="pf-para" data-cited={p.storyIds.length > 0}>
                <p contentEditable suppressContentEditableWarning onBlur={(e) => { edit(i, e.currentTarget.textContent || ""); save(paras.map((q, k) => (k === i ? { ...q, text: e.currentTarget.textContent || "" } : q))); }}>{p.text}</p>
                <div className="chips">
                  {p.storyIds.map((sid) => { const s = stories.find((x) => x.id === sid); return s ? <StoryChip key={sid} id={sid} title={s.title} state="selected" onClick={() => uncite(i, sid)} /> : null; })}
                  {!p.storyIds.length && <span className="pf-para-note">Needs a source · <a href="#" onClick={(e) => { e.preventDefault(); setPicking(i); }}>attach a story</a></span>}
                </div>
                <div className="para-tools">
                  <button className="btn btn-ghost btn-sm" onClick={() => regen(i)}>Regenerate</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setPicking(i)}>Swap story</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard?.writeText(p.text).catch(() => {})}>Copy</button>
                </div>
                {picking === i && (
                  <div className="picker">
                    {stories.map((s) => <StoryChip key={s.id} id={s.id} title={s.title} onClick={() => { cite(i, s.id); setPicking(null); }} />)}
                    {!stories.length && <span className="text-muted small">No stories yet — add some in the Vault.</span>}
                  </div>
                )}
              </div>
            ))}
            <div className="actions">
              <button className="btn btn-secondary" onClick={copyAll}>Copy all</button>
              <button className="btn btn-secondary" disabled title="Browser extension — Phase 2">Autofill with extension</button>
            </div>
          </div>
          <aside className="cite-panel">
            <div className="eyebrow eyebrow-muted">Story cite panel</div>
            <p className="text-muted small">Click a paragraph&apos;s “attach a story”, then pick one here. Click a cited chip to remove it.</p>
            <div className="chips col">{stories.map((s) => <StoryChip key={s.id} id={s.id} title={s.title} onClick={() => picking !== null && cite(picking, s.id)} />)}</div>
            {!stories.length && <StateCard kind="empty" title="No stories yet" body="Every paragraph must cite one." action="Add stories" actionHref="/vault" />}
          </aside>
        </section>
      )}

      {tab === "submit" && (
        <section className="ws-body">
          {app.mode === "managed" ? <StateCard kind="empty" title="Managed submit is coming in Phase 3" body="The agent will submit on Greenhouse, Lever and Ashby with a screenshot before and after." /> : (
            <>
              <div className="eyebrow eyebrow-muted">You submit</div>
              <p>Materials are ready{uncited ? ` except ${uncited} uncited paragraph` : ""}. Open the posting, paste the cover note, and mark it submitted in the Tracker.</p>
              <div className="actions">
                {app.job.url && <a className="btn btn-primary" href={app.job.url} target="_blank" rel="noreferrer">Open posting</a>}
                <Link className="btn btn-secondary" href="/tracker">Go to Tracker</Link>
              </div>
            </>
          )}
        </section>
      )}

      {tab === "activity" && (
        <section className="ws-body">
          <ul className="timeline">
            <li><span className="text-muted small">{app.updated_at}</span> Draft updated</li>
            <li><span className="text-muted small">this week</span> Added to report · score {report.score}</li>
            <li><span className="text-muted small">this week</span> Mode set to {app.mode}</li>
          </ul>
        </section>
      )}
    </div>
  );
}
