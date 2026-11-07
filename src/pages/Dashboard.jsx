// The home screen. For now it proves all three layers work:
// React (this page) -> Worker (/api/health, /api/subjects) -> D1 (the subjects table).
import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import { Loading, ErrorMessage } from "../components/Status.jsx";

export default function Dashboard() {
  const [health, setHealth] = useState(null);
  const [subjects, setSubjects] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setSubjects(null);
    try {
      const [h, s] = await Promise.all([api.health(), api.subjects()]);
      setHealth(h);
      setSubjects(s);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section>
      <h1>Dashboard</h1>
      <p className="muted">
        Your progress bar, XP and what's due soon will live here. Right now this page checks that the
        frontend, backend and database are all talking to each other.
      </p>

      {error && <ErrorMessage message={error} onRetry={load} />}
      {!error && !subjects && <Loading what="Connecting to the database" />}

      {subjects && (
        <>
          <p className="connected">
            Backend {health.ok ? "running" : "not running"}, database {health.database}
          </p>
          <h2>Your subjects</h2>
          <ul className="subject-list">
            {subjects.map((s) => (
              <li key={s.id}>
                <span className="dot" style={{ background: s.color }} aria-hidden="true" />
                <span className="subject-name">{s.name}</span>
                <span className="muted">
                  {s.assignment_count} {s.assignment_count === 1 ? "assignment" : "assignments"}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
