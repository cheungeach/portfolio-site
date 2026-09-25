import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { deleteAccount, saveSettings } from "../actions";

export default async function SettingsPage() {
  const u = await getUser(); if (!u) redirect("/login");
  return (
    <div className="page-narrow stack">
      <h1 className="section-heading">Settings</h1>
      <form action={saveSettings} className="stack">
        <label className="field"><span>Name</span><input id="name" name="name" className="input" defaultValue={u.name} /></label>
        <label className="field"><span>Email</span><input className="input" value={u.email} readOnly /></label>
        <label className="field"><span>Weekly quota (jobs per report)</span><input id="quota" name="quota" type="number" min={5} max={40} className="input" defaultValue={u.quota} /></label>
        <label className="field"><span>Report day</span><select id="report_day" name="report_day" className="input" defaultValue={u.report_day}>{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => <option key={d}>{d}</option>)}</select></label>
        <label className="field"><span>Channel</span><select id="report_channel" name="report_channel" className="input" defaultValue={u.report_channel}><option value="email">Email</option><option value="push">Push</option><option value="both">Both</option></select></label>
        <label className="field"><span>School pack</span><select id="school_pack" name="school_pack" className="input" defaultValue={u.school_pack}><option value="berkeley">UC Berkeley</option><option value="davis">UC Davis</option><option value="none">None</option></select></label>
        <div className="eyebrow eyebrow-muted">Connected sources</div>
        <p className="text-muted small">Greenhouse / Lever / Ashby boards and the school pack are wired in the worker (Phase 1). The browser extension arrives in Phase 2.</p>
        <div><button className="btn btn-primary">Save</button></div>
      </form>
      <hr className="hr" />
      <form action={deleteAccount}><button className="btn btn-secondary">Delete my account and data</button></form>
    </div>
  );
}
