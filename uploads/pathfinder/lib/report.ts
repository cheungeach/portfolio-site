import { db } from "./db";
import { seedJobsIfEmpty } from "./seed";

export * from "./types";
import { type Mode, type Reason, type Job, type ReportJob, type Story, type Direction, type Paragraph, type Application, STATUSES, daysUntil } from "./types";

export function currentWeek() {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // Monday = 0
  const mon = new Date(now); mon.setDate(now.getDate() - day);
  return mon.toISOString().slice(0, 10);
}
export function weekLabel(week: string) {
  const dt = new Date(week + "T00:00:00");
  return "Week of " + dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getDirections(userId: number): Direction[] {
  return db.prepare("SELECT id,name,hint,rank,resume_id FROM directions WHERE user_id=? ORDER BY rank").all(userId) as Direction[];
}
export function getStories(userId: number): Story[] {
  return db.prepare("SELECT id,title,body,tags FROM stories WHERE user_id=? ORDER BY id").all(userId) as Story[];
}

/** The scoring pipeline, mocked: rank by direction match + base score; tag reasons by rule. Replace with embeddings + LLM rerank in the worker. */
export function generateReport(userId: number, week = currentWeek(), quota = 20) {
  seedJobsIfEmpty();
  const dirs = getDirections(userId);
  const stories = getStories(userId);
  const jobs = db.prepare("SELECT * FROM jobs").all() as (Job & { big_title: number; easy_get: number; base_score: number })[];
  const scored = jobs.map((j) => {
    const di = dirs.findIndex((d) => d.name === j.direction_hint);
    const dirBoost = di === -1 ? -12 : Math.max(0, 10 - di * 2);
    const score = Math.max(40, Math.min(99, j.base_score + dirBoost));
    const days = daysUntil(j.deadline);
    const reasons: Reason[] = [];
    if (days <= 7) reasons.push({ code: "DL", why: `Deadline in ${days} day${days === 1 ? "" : "s"}` });
    if (score >= 80) reasons.push({ code: "MT", why: di >= 0 ? `Matches your #${di + 1} direction, ${dirs[di].name}` : "Strong fit with your résumé" });
    if (j.big_title) reasons.push({ code: "BT", why: `${j.org} is on the watchlist` });
    if (j.easy_get) reasons.push({ code: "EZ", why: j.type === "On-campus" ? "On-campus; no cover letter required" : "Low competition; short application" });
    const fit = stories.filter((s) => s.tags.split(",").some((t) => t.trim() && j.description.toLowerCase().includes(t.trim().toLowerCase())) || (j.direction_hint && s.tags.toLowerCase().includes(j.direction_hint.toLowerCase().split(" ")[0]))).slice(0, 2);
    const rationale = `${j.description} ${fit.length ? "Your stories " + fit.map((s) => `#${s.id}`).join(" and ") + " speak to this directly." : "Add a story about this area to strengthen the materials."}`;
    return { j, score, reasons, rationale, fit, days };
  }).filter((x) => x.days >= 0)
    .sort((a, b) => (a.days <= 7 ? 0 : 1) - (b.days <= 7 ? 0 : 1) || b.score - a.score)
    .slice(0, quota);
  const ins = db.prepare("INSERT OR IGNORE INTO report_jobs (user_id,job_id,week,score,reasons,rationale,story_ids) VALUES (?,?,?,?,?,?,?)");
  const tx = db.transaction(() => scored.forEach((s) => ins.run(userId, s.j.id, week, s.score, JSON.stringify(s.reasons), s.rationale, JSON.stringify(s.fit.map((f) => f.id)))));
  tx();
}

export function regenerateReport(userId: number, week = currentWeek(), quota = 20) {
  db.prepare("DELETE FROM report_jobs WHERE user_id=? AND week=? AND mode IS NULL").run(userId, week);
  generateReport(userId, week, quota);
}

export function getReport(userId: number, week = currentWeek()): ReportJob[] {
  const rows = db.prepare(`SELECT r.id, r.score, r.reasons, r.rationale, r.story_ids, r.mode, j.id AS jid, j.org, j.title, j.type, j.url, j.deadline, j.description, j.direction_hint
    FROM report_jobs r JOIN jobs j ON j.id=r.job_id WHERE r.user_id=? AND r.week=?`).all(userId, week) as any[];
  return rows.map((r) => ({
    id: r.id, score: r.score, reasons: JSON.parse(r.reasons), rationale: r.rationale, storyIds: JSON.parse(r.story_ids), mode: r.mode,
    job: { id: r.jid, org: r.org, title: r.title, type: r.type, url: r.url, deadline: r.deadline, description: r.description, direction_hint: r.direction_hint },
    deadlineDays: daysUntil(r.deadline),
  })).sort((a, b) => (a.deadlineDays <= 7 ? 0 : 1) - (b.deadlineDays <= 7 ? 0 : 1) || b.score - a.score);
}

export function getReportJob(userId: number, jobId: number): ReportJob | undefined {
  return getReport(userId).find((r) => r.job.id === jobId) ?? getReport(userId, latestWeek(userId)).find((r) => r.job.id === jobId);
}
function latestWeek(userId: number) {
  const r = db.prepare("SELECT week FROM report_jobs WHERE user_id=? ORDER BY week DESC LIMIT 1").get(userId) as { week: string } | undefined;
  return r?.week ?? currentWeek();
}

export function setMode(userId: number, reportId: number, mode: Mode) {
  const row = db.prepare("SELECT job_id FROM report_jobs WHERE id=? AND user_id=?").get(reportId, userId) as { job_id: number } | undefined;
  if (!row) return;
  db.prepare("UPDATE report_jobs SET mode=? WHERE id=?").run(mode, reportId);
  if (mode === "skip") {
    db.prepare("DELETE FROM applications WHERE user_id=? AND job_id=? AND status='drafting'").run(userId, row.job_id);
  } else {
    db.prepare("INSERT INTO applications (user_id,job_id,mode) VALUES (?,?,?) ON CONFLICT(user_id,job_id) DO UPDATE SET mode=excluded.mode, updated_at=datetime('now')").run(userId, row.job_id, mode);
  }
}

export function getApplications(userId: number): Application[] {
  const rows = db.prepare(`SELECT j.*, j.id AS jid, a.id AS id, a.mode, a.status, a.paragraphs, a.strategy, a.updated_at FROM applications a JOIN jobs j ON j.id=a.job_id WHERE a.user_id=? ORDER BY a.updated_at DESC`).all(userId) as any[];
  return rows.map(toApp);
}
export function getApplication(userId: number, jobId: number): Application | undefined {
  const r = db.prepare(`SELECT j.*, j.id AS jid, a.id AS id, a.mode, a.status, a.paragraphs, a.strategy, a.updated_at FROM applications a JOIN jobs j ON j.id=a.job_id WHERE a.user_id=? AND a.job_id=?`).get(userId, jobId) as any;
  return r ? toApp(r) : undefined;
}
function toApp(r: any): Application {
  return { id: r.id, mode: r.mode, status: r.status, paragraphs: JSON.parse(r.paragraphs), strategy: JSON.parse(r.strategy), updated_at: r.updated_at,
    job: { id: r.jid, org: r.org, title: r.title, type: r.type, url: r.url, deadline: r.deadline, description: r.description, direction_hint: r.direction_hint } };
}
export function setStatus(userId: number, appId: number, status: string) {
  if (!(STATUSES as readonly string[]).includes(status)) return;
  db.prepare("UPDATE applications SET status=?, updated_at=datetime('now') WHERE id=? AND user_id=?").run(status, appId, userId);
}

/** Draft materials, mocked: one paragraph per fitting story plus one deliberately uncited paragraph, so the provenance UI has something to show. Replace with the LLM call in packages/ai. */
export function ensureMaterials(userId: number, jobId: number) {
  const app = getApplication(userId, jobId);
  if (!app || app.paragraphs.length) return app;
  const rj = getReportJob(userId, jobId);
  const stories = getStories(userId);
  const fit = stories.filter((s) => rj?.storyIds.includes(s.id));
  const paras: Paragraph[] = [];
  paras.push({ text: `I am applying to ${app.job.org} for the ${app.job.title} role because ${app.job.description.split(".")[0].toLowerCase()} — the kind of problem I want to spend the next year on.`, storyIds: fit[0] ? [fit[0].id] : [] });
  fit.forEach((s) => paras.push({ text: s.body.split(/(?<=\.)\s/).slice(0, 2).join(" "), storyIds: [s.id] }));
  paras.push({ text: "I am a fast learner who thrives in collaborative environments and brings energy to every team.", storyIds: [] });
  const strategy = [
    `Use the résumé bound to "${app.job.direction_hint || "your top direction"}".`,
    `Lead with ${fit[0] ? `story #${fit[0].id} (${fit[0].title})` : "a concrete project"} in the first paragraph.`,
    `Mirror the posting's own words: ${app.job.description.split(" ").slice(0, 8).join(" ")}…`,
    "Likely questions: why this team, a time you shipped something with limited guidance, what you would build in the first month.",
  ];
  db.prepare("UPDATE applications SET paragraphs=?, strategy=? WHERE id=?").run(JSON.stringify(paras), JSON.stringify(strategy), app.id);
  return getApplication(userId, jobId);
}
export function saveParagraphs(userId: number, appId: number, paragraphs: Paragraph[]) {
  db.prepare("UPDATE applications SET paragraphs=?, updated_at=datetime('now') WHERE id=? AND user_id=?").run(JSON.stringify(paragraphs), appId, userId);
}
