// One assignment in a list. Used on the Assignments page, and later on the dashboard.
import { Link } from "react-router";
import { dueLabel, DIFFICULTY } from "../dates.js";

export default function AssignmentRow({ assignment: a }) {
  const due = dueLabel(a.due_date, a.completed);

  return (
    <li className={`assignment${a.completed ? " is-done" : ""}`} style={{ "--subject": a.subject_color }}>
      <div className="assignment-main">
        <Link to={`/assignments/${a.id}/edit`} className="assignment-title">
          {a.title}
        </Link>
        <p className="assignment-meta">
          <span className="assignment-subject">{a.subject_name}</span>
          <span className={`difficulty difficulty-${a.difficulty}`}>{DIFFICULTY[a.difficulty]}</span>
          {a.completed && <span className="done-tag">Done</span>}
        </p>
        {a.notes && <p className="assignment-notes">{a.notes}</p>}
      </div>
      <p className={`due due-${due.tone}`}>{due.text}</p>
    </li>
  );
}
