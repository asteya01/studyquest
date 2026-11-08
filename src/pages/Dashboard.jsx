// The home screen: level, XP, streak, today's progress bar and what to do next.
import useTitle from "../useTitle.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { api, assignments } from "../api.js";
import Bar from "../components/Bar.jsx";
import AssignmentRow from "../components/AssignmentRow.jsx";
import Clock from "../components/Clock.jsx";
import { Loading, ErrorMessage } from "../components/Status.jsx";
import { todayISO } from "../dates.js";

// Today's date, checked every 30 seconds. The page only redraws when the date actually changes,
// so if the dashboard is left open past midnight it moves on to the new day by itself.
function useToday() {
  const [today, setToday] = useState(todayISO());
  useEffect(() => {
    const timer = setInterval(() => setToday(todayISO()), 30_000);
    return () => clearInterval(timer);
  }, []);
  return today;
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export default function Dashboard() {
  useTitle("Dashboard");
  const today = useToday();
  const [stats, setStats] = useState(null);
  const [upNext, setUpNext] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [flash, setFlash] = useState(null);
  const flashTimer = useRef(null);

  // Load the numbers and the to-do list together. Runs again when the date changes.
  const load = useCallback(async () => {
    setError(null);
    try {
      const [s, todo] = await Promise.all([
        api.stats(today),
        assignments.list({ status: "todo", sort: "due" }),
      ]);
      setStats(s);
      setUpNext(todo.slice(0, 5));
    } catch (err) {
      setError(err.message);
    }
  }, [today]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  async function checkOff(a) {
    setBusyId(a.id);
    try {
      const result = await assignments.complete(a.id, today);
      clearTimeout(flashTimer.current);
      setFlash(
        result.leveled_up
          ? `+${result.xp_earned} XP. Level up! You're now level ${result.level}.`
          : `+${result.xp_earned} XP. You have ${result.total_xp} XP.`
      );
      flashTimer.current = setTimeout(() => setFlash(null), 5000);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const header = (
    <div className="dash-header">
      <h1>Dashboard</h1>
      <Clock />
    </div>
  );

  if (!stats && !error) {
    return <section>{header}<Loading what="Loading your quest" /></section>;
  }
  if (!stats) {
    return <section>{header}<ErrorMessage message={error} onRetry={load} /></section>;
  }

  const { progress } = stats;
  const toNext = stats.xp_for_next_level - stats.xp_into_level;
  const allDone = progress.total > 0 && progress.done === progress.total;

  return (
    <section>
      {header}
      <p className="flash" role="status">{flash}</p>
      {error && <ErrorMessage message={error} onRetry={load} />}

      <div className="stat-grid">
        <div className="card stat">
          <h2>Level</h2>
          <p className="stat-number">{stats.level}</p>
          <Bar percent={stats.xp_into_level} label="Progress to the next level" tone="xp" />
          <p className="stat-note">{toNext} XP to level {stats.level + 1}</p>
        </div>

        <div className="card stat">
          <h2>Total XP</h2>
          <p className="stat-number">{stats.total_xp}</p>
          <p className="stat-note">Easy 10, medium 20, hard 30</p>
        </div>

        <div className="card stat">
          <h2>Streak</h2>
          <p className="stat-number">{plural(stats.streak, "day")}</p>
          <p className="stat-note">
            {stats.done_today
              ? "You've kept it going today."
              : stats.streak > 0
                ? "Finish something today to keep it going."
                : "Finish an assignment to start one."}
          </p>
        </div>
      </div>

      <div className="card progress-card">
        <h2>Today's progress</h2>
        {progress.total === 0 ? (
          <p className="stat-note">Nothing is due today or tomorrow. You're all clear.</p>
        ) : (
          <>
            <p className="progress-line">
              <strong>{progress.done} of {progress.total}</strong> done
              {allDone && " – great work!"}
            </p>
            <Bar percent={progress.percent} label="Today's progress" />
            <p className="stat-note">Counts work due today, tomorrow or overdue.</p>
          </>
        )}
      </div>

      <h2>Up next</h2>
      {upNext.length === 0 ? (
        <div className="empty">
          <p>Everything is checked off. Nice! Add more work when you get it.</p>
          <Link to="/assignments/new" className="button">Add assignment</Link>
        </div>
      ) : (
        <>
          <ul className="assignment-list">
            {upNext.map((a) => (
              <AssignmentRow key={a.id} assignment={a} onToggle={checkOff} busy={busyId === a.id} />
            ))}
          </ul>
          <p className="see-all"><Link to="/assignments?status=todo">See all to-do assignments</Link></p>
        </>
      )}
    </section>
  );
}
