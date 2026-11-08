// The Achievements page: your level and XP, the badges you've earned, and what's still locked.
import useTitle from "../useTitle.js";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../api.js";
import Bar from "../components/Bar.jsx";
import { Loading, ErrorMessage } from "../components/Status.jsx";

// The medal. Gold star when earned, a padlock when locked. Drawn as SVG so it stays sharp,
// and hidden from screen readers because the badge's text already says everything.
function Medal({ earned, tier }) {
  return (
    <span className={`medal ${earned ? `medal-${tier}` : "medal-locked"}`} aria-hidden="true">
      {earned ? (
        <svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" className="lock">
          <rect x="6" y="11" width="12" height="9" rx="2" />
          <path d="M8.5 11V8.5a3.5 3.5 0 017 0V11" />
        </svg>
      )}
    </span>
  );
}

function BadgeCard({ badge }) {
  const shown = Math.min(badge.current, badge.target);
  const percent = Math.round((shown / badge.target) * 100);
  return (
    <li className={`badge${badge.earned ? " is-earned" : ""}`}>
      <Medal earned={badge.earned} tier={badge.tier} />
      <div className="badge-text">
        <h3>{badge.name}</h3>
        <p>{badge.description}</p>
        {badge.earned ? (
          <p className="badge-status">Earned</p>
        ) : (
          <>
            <Bar percent={percent} label={`${badge.name}: ${shown} of ${badge.target}`} tone="xp" />
            <p className="badge-status">{shown} of {badge.target}</p>
          </>
        )}
      </div>
    </li>
  );
}

export default function Achievements() {
  useTitle("Achievements");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await api.achievements());
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <section>
        <h1>Achievements</h1>
        <ErrorMessage message={error} onRetry={load} />
      </section>
    );
  }
  if (!data) {
    return (
      <section>
        <h1>Achievements</h1>
        <Loading what="Loading your badges" />
      </section>
    );
  }

  const earned = data.badges.filter((b) => b.earned);
  // Locked badges: the ones you're closest to unlocking come first.
  const locked = data.badges
    .filter((b) => !b.earned)
    .sort((a, b) => b.current / b.target - a.current / a.target);
  const toNext = data.xp_for_next_level - data.xp_into_level;

  return (
    <section>
      <h1>Achievements</h1>

      <div className="stat-grid">
        <div className="card stat">
          <h2>Level</h2>
          <p className="stat-number">{data.level}</p>
          <Bar percent={data.xp_into_level} label="Progress to the next level" tone="xp" />
          <p className="stat-note">{toNext} XP to level {data.level + 1}</p>
        </div>
        <div className="card stat">
          <h2>Total XP</h2>
          <p className="stat-number">{data.total_xp}</p>
          <p className="stat-note">Best streak: {data.best_streak} {data.best_streak === 1 ? "day" : "days"}</p>
        </div>
        <div className="card stat">
          <h2>Badges</h2>
          <p className="stat-number">{data.earned_count} of {data.total_count}</p>
          <p className="stat-note">
            {data.earned_count === data.total_count ? "You've earned them all!" : "Keep finishing work to unlock more."}
          </p>
        </div>
      </div>

      <h2>Earned</h2>
      {earned.length === 0 ? (
        <div className="empty">
          <p>No badges yet. Finish your first assignment to earn First Quest.</p>
          <Link to="/assignments?status=todo" className="button">See your to-do list</Link>
        </div>
      ) : (
        <ul className="badge-grid">
          {earned.map((b) => <BadgeCard key={b.id} badge={b} />)}
        </ul>
      )}

      {locked.length > 0 && (
        <>
          <h2>Still locked</h2>
          <ul className="badge-grid">
            {locked.map((b) => <BadgeCard key={b.id} badge={b} />)}
          </ul>
        </>
      )}

      <p className="muted badge-note">
        Badges are worked out from the work you've finished. If you un-check an assignment or delete a
        subject, a badge can lock again.
      </p>
    </section>
  );
}
