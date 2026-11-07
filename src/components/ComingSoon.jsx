// A placeholder for pages we haven't built yet.
export default function ComingSoon({ title, step, children }) {
  return (
    <section>
      <h1>{title}</h1>
      <p className="muted">{children}</p>
      <p className="muted">This page gets built in step {step} of TASKS.md.</p>
    </section>
  );
}
