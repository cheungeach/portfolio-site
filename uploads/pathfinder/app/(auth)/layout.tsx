export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth">
      <div className="auth-card">
        <div className="brand">Pathfinder</div>
        {children}
      </div>
      <p className="auth-foot text-muted">Fewer, better, you decide.</p>
    </main>
  );
}
