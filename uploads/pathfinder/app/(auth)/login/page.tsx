"use client";
import Link from "next/link";
import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="stack">
      <div className="eyebrow">Sign in</div>
      <h1 className="section-heading">Welcome back</h1>
      <label className="field"><span>Email</span><input id="email" name="email" type="email" className="input" autoComplete="email" defaultValue={state?.email ?? ""} required /></label>
      <label className="field"><span>Password</span><input id="password" name="password" type="password" className="input" autoComplete="current-password" required /></label>
      {state?.error && <div className="pf-state" data-kind="error" role="alert"><div className="pf-state-body">{state.error}</div></div>}
      <button className="btn btn-primary btn-block" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      <p className="text-muted small">New here? <Link href="/signup">Create an account</Link></p>
    </form>
  );
}
