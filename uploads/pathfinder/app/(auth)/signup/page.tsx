"use client";
import Link from "next/link";
import { useActionState } from "react";
import { signup } from "../actions";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);
  return (
    <form action={action} className="stack">
      <div className="eyebrow">Create account</div>
      <h1 className="section-heading">Start your first weekly report</h1>
      <p className="text-muted">One account, your own directions, résumés and stories. Nothing is sent anywhere until you decide.</p>
      <label className="field"><span>Name</span><input id="name" name="name" className="input" autoComplete="name" defaultValue={state?.name ?? ""} required /></label>
      <label className="field"><span>Email</span><input id="email" name="email" type="email" className="input" autoComplete="email" defaultValue={state?.email ?? ""} required /></label>
      <label className="field"><span>Password</span><input id="password" name="password" type="password" className="input" autoComplete="new-password" minLength={8} required /></label>
      {state?.error && <div className="pf-state" data-kind="error" role="alert"><div className="pf-state-body">{state.error}</div></div>}
      <button className="btn btn-primary btn-block" disabled={pending}>{pending ? "Creating…" : "Create account"}</button>
      <p className="text-muted small">Already have one? <Link href="/login">Sign in</Link></p>
    </form>
  );
}
