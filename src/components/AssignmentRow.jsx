// One assignment in a list. Used on the Assignments page, and later on the dashboard.
import { useState } from "react";
import { Link } from "react-router";
import { dueLabel, DIFFICULTY, XP } from "../dates.js";

export default function AssignmentRow({ assignment: a, onToggle, busy = false }) {
  const due = dueLabel(a.due_date, a.completed);

  // A quick "pop" on the check button, only right after you check something off (not for rows
  // that were already done when the page loaded).
  const [pop, setPop] = useState(false);
  function handleClick() {
    if (!a.completed) setPop(true);
    onToggle(a);
  }

  return (
    <li className={`assignment${a.completed ? " is-done" : ""}`} style={{ "--subject": a.subject_color }}>
      {onToggle && (
        <button
          type="button"
          className={`check${pop ? " is-pop" : ""}`}
          onClick={handleClick}
          onAnimationEnd={() => setPop(false)}
          disabled={busy}
          aria-pressed={a.completed}
          aria-label={a.completed ? `Mark "${a.title}" as not done` : `Mark "${a.title}" as done`}
          title={a.completed ? "Mark as not done" : `Check off for ${XP[a.difficulty]} XP`}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M5 10.5l3.2 3.2L15 6.8" />
          </svg>
        </button>
      )}
      <div className="assignment-main">
        <Link to={`/assignments/${a.id}/edit`} className="assignment-title">
          {a.title}
        </Link>
        <p className="assignment-meta">
          <span className="assignment-subject">{a.subject_name}</span>
          <span className={`difficulty difficulty-${a.difficulty}`}>{DIFFICULTY[a.difficulty]} · {a.completed ? a.xp_earned : XP[a.difficulty]} XP</span>
          {a.completed && <span className="done-tag">Done</span>}
        </p>
        {a.notes && <p className="assignment-notes">{a.notes}</p>}
      </div>
      <p className={`due due-${due.tone}`}>{due.text}</p>
    </li>
  );
}
