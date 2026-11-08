// The Subjects page: add a subject, or delete one you don't need.
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { api } from "../api.js";
import { Loading, ErrorMessage } from "../components/Status.jsx";
import { SUBJECT_COLORS } from "../subjectColors.js";

const MAX_NAME = 30; // the same limit the backend checks (worker/subjects.js)

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export default function Subjects() {
  const [subjects, setSubjects] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const [name, setName] = useState("");
  const [color, setColor] = useState(SUBJECT_COLORS[0].value);
  const [problem, setProblem] = useState(null);     // message next to the name box
  const [saving, setSaving] = useState(false);
  const nameBox = useRef(null);

  const [confirmId, setConfirmId] = useState(null); // which subject is showing "are you sure?"
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const [flash, setFlash] = useState(null);
  const flashTimer = useRef(null);
  function showFlash(message) {
    clearTimeout(flashTimer.current);
    setFlash(message);
    flashTimer.current = setTimeout(() => setFlash(null), 5000);
  }
  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setSubjects(await api.subjects());
    } catch (err) {
      setLoadError(err.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  // Start each new subject on a color that isn't taken yet, so they're easy to tell apart.
  function nextFreeColor(list) {
    const used = new Set(list.map((s) => s.color));
    return (SUBJECT_COLORS.find((c) => !used.has(c.value)) ?? SUBJECT_COLORS[0]).value;
  }
  useEffect(() => {
    if (subjects) setColor(nextFreeColor(subjects));
  }, [subjects?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  async function add(event) {
    event.preventDefault();
    setActionError(null);

    const trimmed = name.trim().replace(/\s+/g, " ");
    if (!trimmed) {
      setProblem("Give the subject a name.");
      nameBox.current?.focus();
      return;
    }
    if (trimmed.length > MAX_NAME) {
      setProblem(`Keep the name under ${MAX_NAME} characters.`);
      nameBox.current?.focus();
      return;
    }

    setSaving(true);
    try {
      await api.addSubject({ name: trimmed, color });
      setName("");
      setProblem(null);
      showFlash(`Added ${trimmed}.`);
      await load();
    } catch (err) {
      // The backend's message (like "You already have a subject called Math.") goes by the box.
      setProblem(err.message);
      nameBox.current?.focus();
    } finally {
      setSaving(false);
    }
  }

  async function remove(subject) {
    setDeleting(true);
    setActionError(null);
    try {
      const result = await api.removeSubject(subject.id);
      setConfirmId(null);
      showFlash(
        result.assignments_deleted > 0
          ? `Deleted ${subject.name} and its ${plural(result.assignments_deleted, "assignment")}.`
          : `Deleted ${subject.name}.`
      );
      await load();
    } catch (err) {
      setActionError(err.message);
      setConfirmId(null);
    } finally {
      setDeleting(false);
    }
  }

  if (loadError && !subjects) {
    return (
      <section>
        <h1>Subjects</h1>
        <ErrorMessage message={loadError} onRetry={load} />
      </section>
    );
  }
  if (!subjects) {
    return (
      <section>
        <h1>Subjects</h1>
        <Loading what="Loading subjects" />
      </section>
    );
  }

  return (
    <section className="form-page">
      <h1>Subjects</h1>
      <p className="muted">Subjects group your assignments, and each one gets its own color.</p>
      <p className="flash" role="status">{flash}</p>

      <form onSubmit={add} noValidate className="assignment-form subject-form">
        <label className="field">
          <span>New subject</span>
          <input
            ref={nameBox}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setProblem(null);
            }}
            maxLength={MAX_NAME + 10}
            placeholder="Art, Music, Computer Science…"
            {...(problem ? { "aria-invalid": true, "aria-describedby": "name-problem" } : {})}
          />
          {problem && <p className="field-problem" id="name-problem">{problem}</p>}
        </label>

        <fieldset className="field swatches">
          <legend>Color</legend>
          <div>
            {SUBJECT_COLORS.map((c) => (
              <label key={c.value} title={c.name}>
                <input
                  type="radio"
                  name="color"
                  value={c.value}
                  checked={color === c.value}
                  onChange={() => setColor(c.value)}
                />
                <span style={{ background: c.value }}>
                  <span className="visually-hidden">{c.name}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="submit" disabled={saving}>{saving ? "Adding…" : "Add subject"}</button>
        </div>
      </form>

      {actionError && <ErrorMessage message={actionError} />}

      <h2>Your subjects</h2>
      {subjects.length === 0 ? (
        <div className="empty">
          <p>No subjects yet. Add one above, like Math, then you can add assignments to it.</p>
        </div>
      ) : (
        <ul className="subject-list">
          {subjects.map((s) => (
            <li key={s.id} className="subject-item">
              <div className="subject-row">
                <span className="dot" style={{ background: s.color }} aria-hidden="true" />
                <span className="subject-name">{s.name}</span>
                {s.assignment_count > 0 ? (
                  <Link to={`/assignments?subject=${s.id}`} className="subject-count">
                    {plural(s.assignment_count, "assignment")}
                  </Link>
                ) : (
                  <span className="muted">No assignments</span>
                )}
                {confirmId !== s.id && (
                  <button
                    type="button"
                    className="button-danger-quiet"
                    onClick={() => setConfirmId(s.id)}
                    aria-label={`Delete ${s.name}`}
                  >
                    Delete
                  </button>
                )}
              </div>

              {confirmId === s.id && (
                <div className="confirm" role="alertdialog" aria-labelledby={`confirm-${s.id}`}>
                  <p id={`confirm-${s.id}`}>
                    {s.assignment_count > 0
                      ? `Delete ${s.name}? This also deletes its ${plural(s.assignment_count, "assignment")}${
                          s.xp_earned > 0 ? ` and the ${s.xp_earned} XP you earned from them` : ""
                        }. This can't be undone.`
                      : `Delete ${s.name}? This can't be undone.`}
                  </p>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="button-danger"
                      onClick={() => remove(s)}
                      disabled={deleting}
                      autoFocus
                    >
                      {deleting ? "Deleting…" : "Delete"}
                    </button>
                    <button type="button" className="button-quiet" onClick={() => setConfirmId(null)}>
                      Keep it
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
