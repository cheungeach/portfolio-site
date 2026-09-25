"use client";
import { useState, useTransition } from "react";
import type { Direction, Story } from "@/lib/types";
import { addResume, addStories, deleteResume, deleteStory, updateStory } from "@/app/(app)/actions";
import { StateCard } from "./ui";

type Resume = { id: number; name: string; summary: string; direction_id: number | null };

export function VaultView({ dirs, resumes, stories, counts }: { dirs: Direction[]; resumes: Resume[]; stories: Story[]; counts: Record<number, number> }) {
  const [tab, setTab] = useState<"stories" | "resumes">("stories");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState({ title: "", body: "", tags: "" });
  const [pending, start] = useTransition();
  const shown = stories.filter((s) => !q || (s.title + s.body + s.tags).toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <h1 className="section-heading">Vault</h1>
      <div className="tabs" role="tablist"><button role="tab" aria-selected={tab === "stories"} className="tab" onClick={() => setTab("stories")}>Stories · {stories.length}</button><button role="tab" aria-selected={tab === "resumes"} className="tab" onClick={() => setTab("resumes")}>Résumés · {resumes.length}</button></div>

      {tab === "stories" && (
        <div className="stack">
          <div className="actions"><input className="input" style={{ maxWidth: 360 }} placeholder="Search stories" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div className="grid3">
            {shown.map((s) => editing === s.id ? (
              <div key={s.id} className="card stack">
                <input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /><textarea className="input" rows={5} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} /><input className="input" value={draft.tags} placeholder="tags" onChange={(e) => setDraft({ ...draft, tags: e.target.value })} />
                <div className="actions"><button className="btn btn-primary btn-sm" disabled={pending} onClick={() => start(async () => { await updateStory(s.id, draft.title, draft.body, draft.tags); setEditing(null); })}>Save</button><button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button></div>
              </div>
            ) : (
              <div key={s.id} className="card">
                <div className="card-kicker">#{s.id} · used in {counts[s.id] || 0} application{(counts[s.id] || 0) === 1 ? "" : "s"}</div>
                <div className="card-title">{s.title}</div>
                <p className="card-body">{s.body}</p>
                {s.tags && <div className="card-meta">{s.tags}</div>}
                <div className="actions"><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(s.id); setDraft({ title: s.title, body: s.body, tags: s.tags }); }}>Edit</button><button className="btn btn-ghost btn-sm" onClick={() => start(() => deleteStory(s.id))}>Delete</button></div>
              </div>
            ))}
          </div>
          {!stories.length && <StateCard kind="empty" title="No stories yet" body="Add one below. Every generated paragraph must cite a story." />}
          <form className="card stack" action={(fd) => start(async () => { await addStories([{ title: String(fd.get("title") || ""), body: String(fd.get("body") || ""), tags: String(fd.get("tags") || "") }]); })}>
            <div className="card-title">New story</div>
            <input id="stitle" name="title" className="input" placeholder="Title" /><textarea id="sbody" name="body" className="input" rows={4} placeholder="What happened, what you did, what changed." required /><input id="stags" name="tags" className="input" placeholder="tags, comma separated" />
            <div><button className="btn btn-primary btn-sm">Add story</button></div>
          </form>
        </div>
      )}

      {tab === "resumes" && (
        <div className="stack">
          <div className="grid3">
            {resumes.map((r) => <div key={r.id} className="card"><div className="card-title">{r.name}</div><div className="card-meta">{dirs.find((d) => d.id === r.direction_id)?.name ?? "No direction"}</div>{r.summary && <p className="card-body">{r.summary}</p>}<div><button className="btn btn-ghost btn-sm" onClick={() => start(() => deleteResume(r.id))}>Remove</button></div></div>)}
          </div>
          {!resumes.length && <StateCard kind="empty" title="No résumés yet" body="One per direction; the agent recommends which to use per job." />}
          <form className="card stack" action={(fd) => start(() => addResume(fd))}>
            <div className="card-title">New résumé</div>
            <input id="rname2" name="name" className="input" placeholder="Name" required /><select id="rdir2" name="direction_id" className="input">{dirs.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select><textarea id="rsum2" name="summary" className="input" rows={3} placeholder="Top bullets" />
            <div><button className="btn btn-primary btn-sm">Add résumé</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
