"use client";
import { useState, useTransition } from "react";
import type { Direction, Story } from "@/lib/types";
import { addResume, addStories, deleteResume, finishOnboarding, saveDirections } from "@/app/(app)/actions";
import { StateCard } from "./ui";

type Resume = { id: number; name: string; summary: string; direction_id: number | null };

export function Onboarding({ dirs: initialDirs, resumes, stories }: { dirs: Direction[]; resumes: Resume[]; stories: Story[] }) {
  const [step, setStep] = useState(0);
  const [dirs, setDirs] = useState<{ id?: number; name: string; hint: string }[]>(initialDirs.map((d) => ({ id: d.id, name: d.name, hint: d.hint })));
  const [raw, setRaw] = useState("");
  const [cards, setCards] = useState<{ title: string; body: string; tags: string }[]>([]);
  const [pending, start] = useTransition();

  const move = (i: number, d: -1 | 1) => { const j = i + d; if (j < 0 || j >= dirs.length) return; const n = [...dirs]; [n[i], n[j]] = [n[j], n[i]]; setDirs(n); };
  const split = () => setCards(raw.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean).map((b) => ({ title: b.split(/\s+/).slice(0, 5).join(" "), body: b, tags: "" })));

  return (
    <div className="onboarding">
      <div className="dots" aria-label={`Step ${step + 1} of 3`}>{[0, 1, 2].map((i) => <span key={i} className={`dot${i === step ? " on" : ""}`} />)}</div>
      <div className="eyebrow">Step {step + 1} of 3</div>

      {step === 0 && (
        <div className="ob-grid">
          <div><h1 className="section-heading">Rank your directions</h1><p className="text-muted">Reorder. The top direction gets the most of your weekly quota. Rename or add your own.</p></div>
          <div className="stack">
            {dirs.map((d, i) => (
              <div key={i} className="rank-row">
                <div className="rank-num">{i + 1}</div>
                <div className="rank-fields"><input className="input" value={d.name} onChange={(e) => setDirs(dirs.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} aria-label="Direction" /><input className="input" value={d.hint} placeholder="What kind of roles" onChange={(e) => setDirs(dirs.map((x, k) => (k === i ? { ...x, hint: e.target.value } : x)))} aria-label="Hint" /></div>
                <div className="rank-btns"><button className="btn btn-ghost btn-sm" onClick={() => move(i, -1)} aria-label="Move up">↑</button><button className="btn btn-ghost btn-sm" onClick={() => move(i, 1)} aria-label="Move down">↓</button><button className="btn btn-ghost btn-sm" onClick={() => setDirs(dirs.filter((_, k) => k !== i))} aria-label="Remove">×</button></div>
              </div>
            ))}
            <div className="actions"><button className="btn btn-secondary btn-sm" onClick={() => setDirs([...dirs, { name: "", hint: "" }])}>Add direction</button><span style={{ flex: 1 }} /><button className="btn btn-primary" disabled={pending} onClick={() => start(async () => { await saveDirections(dirs); setStep(1); })}>Continue</button></div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="ob-grid">
          <div><h1 className="section-heading">Add your résumés</h1><p className="text-muted">One per direction. For now, paste a short summary; PDF parsing arrives with the worker.</p></div>
          <div className="stack">
            {resumes.map((r) => <div key={r.id} className="card"><div className="card-title">{r.name}</div><div className="card-meta">{dirs.find((d) => d.id === r.direction_id)?.name ?? "No direction"}</div>{r.summary && <p className="card-body">{r.summary}</p>}<div><button className="btn btn-ghost btn-sm" onClick={() => start(() => deleteResume(r.id))}>Remove</button></div></div>)}
            {!resumes.length && <StateCard kind="empty" title="No résumés yet" body="Add one per direction so the agent knows which to recommend." />}
            <form action={(fd) => start(() => addResume(fd))} className="stack card">
              <label className="field"><span>Name</span><input id="rname" name="name" className="input" placeholder="PM résumé" required /></label>
              <label className="field"><span>Bound to direction</span><select id="rdir" name="direction_id" className="input">{initialDirs.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
              <label className="field"><span>Summary (top bullets)</span><textarea id="rsum" name="summary" className="input" rows={3} placeholder="UX at UC Health · founded a 400-member photography alliance · …" /></label>
              <div><button className="btn btn-secondary btn-sm">Add résumé</button></div>
            </form>
            <div className="actions"><button className="btn btn-ghost" onClick={() => setStep(0)}>Back</button><span style={{ flex: 1 }} /><button className="btn btn-primary" onClick={() => setStep(2)}>Continue</button></div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="ob-grid wide">
          <div><h1 className="section-heading">Add your stories</h1><p className="text-muted">Paste anything about yourself — projects, roles, what you care about. Blank lines split it into stories. Every generated paragraph will cite one.</p>
            <textarea className="input" rows={14} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={"At the Photography Alliance I rebuilt the darkroom booking system, cutting no-shows by a third across two semesters.\n\nLast summer I ran a wayfinding study with twelve museum visitors and synthesized it into a journey map the client still uses."} />
            <div className="actions"><button className="btn btn-secondary btn-sm" onClick={split}>Split into stories</button></div>
          </div>
          <div className="stack">
            {stories.map((s) => <div key={s.id} className="card"><div className="card-kicker">#{s.id}</div><div className="card-title">{s.title}</div><p className="card-body">{s.body}</p></div>)}
            {cards.map((c, i) => <div key={i} className="card"><input className="input" value={c.title} onChange={(e) => setCards(cards.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)))} aria-label="Title" /><p className="card-body">{c.body}</p><input className="input" value={c.tags} placeholder="tags: ux, research, photography" onChange={(e) => setCards(cards.map((x, k) => (k === i ? { ...x, tags: e.target.value } : x)))} aria-label="Tags" /></div>)}
            {!stories.length && !cards.length && <StateCard kind="empty" eyebrow="Empty · no stories found" title="Nothing to split yet" body="Stories are what every generated paragraph cites — without them, nothing can be sourced." />}
            <div className="actions"><button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button><span style={{ flex: 1 }} />
              {cards.length > 0 && <button className="btn btn-secondary" disabled={pending} onClick={() => start(async () => { await addStories(cards); setCards([]); setRaw(""); })}>Save {cards.length} stories</button>}
              <button className="btn btn-primary" disabled={pending || (!stories.length && !cards.length)} onClick={() => start(async () => { if (cards.length) await addStories(cards); await finishOnboarding(); })}>Finish and run my first report</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
