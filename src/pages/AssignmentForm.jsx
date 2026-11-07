// One form for both adding and editing an assignment.
//   /assignments/new        -> empty form, "Add assignment"
//   /assignments/7/edit     -> loads assignment 7 into the form, "Save changes" and "Delete"
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api, assignments } from "../api.js";
import { Loading, ErrorMessage } from "../components/Status.jsx";
import { todayISO, addDays, XP, DIFFICULTY } from "../dates.js";

// The same limits the backend checks (worker/assignments.js).
const MAX_TITLE = 120;
const MAX_NOTES = 1000;

const EMPTY = {
  title: "",
  subject_id: "",
  due_date: addDays(todayISO(), 1), // tomorrow
  difficulty: 1,
  notes: "",
};

// Check the form before sending it. Returns { fieldName: "message" } for each problem.
function check(form) {
  const problems = {};
  if (!form.title.trim()) problems.title = "Give the assignment a title.";
  else if (form.title.trim().length > MAX_TITLE) problems.title = `Keep the title under ${MAX_TITLE} characters.`;
  if (!form.subject_id) problems.subject_id = "Choose a subject.";
  if (!form.due_date) problems.due_date = "Pick a due date.";
  if (form.notes.length > MAX_NOTES) problems.notes = `Keep the notes under ${MAX_NOTES} characters.`;
  return problems;
}

export default function AssignmentForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [subjects, setSubjects] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [problems, setProblems] = useState({});      // messages next to fields
  const [saveError, setSaveError] = useState(null);  // message from the backend
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const fields = useRef({});                          // so we can jump to the first problem

  // Load the subjects, and the assignment too when editing.
  useEffect(() => {
    setLoadError(null);
    Promise.all([api.subjects(), editing ? assignments.get(id) : null])
      .then(([subjectList, assignment]) => {
        setSubjects(subjectList);
        if (assignment) {
          setForm({
            title: assignment.title,
            subject_id: String(assignment.subject_id),
            due_date: assignment.due_date,
            difficulty: assignment.difficulty,
            notes: assignment.notes,
          });
        }
      })
      .catch((err) => setLoadError(err.message));
  }, [id, editing]);

  // Update one field, and clear its message once the user starts fixing it.
  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    if (problems[name]) setProblems((p) => ({ ...p, [name]: undefined }));
  }

  async function save(event) {
    event.preventDefault();
    setSaveError(null);

    const found = check(form);
    setProblems(found);
    const first = Object.keys(found)[0];
    if (first) {
      fields.current[first]?.focus();
      return;
    }

    const data = {
      ...form,
      title: form.title.trim(),
      subject_id: Number(form.subject_id),
      difficulty: Number(form.difficulty),
    };

    setSaving(true);
    try {
      if (editing) {
        await assignments.update(id, data);
        navigate("/assignments", { state: { flash: "Changes saved." } });
      } else {
        await assignments.create(data);
        navigate("/assignments", { state: { flash: "Assignment added." } });
      }
    } catch (err) {
      setSaveError(err.message);
      setSaving(false);
    }
  }

  async function remove() {
    setSaving(true);
    try {
      await assignments.remove(id);
      navigate("/assignments", { state: { flash: "Assignment deleted." } });
    } catch (err) {
      setSaveError(err.message);
      setSaving(false);
      setConfirmingDelete(false);
    }
  }

  const title = editing ? "Edit assignment" : "Add assignment";

  if (loadError) {
    return (
      <section>
        <h1>{title}</h1>
        <ErrorMessage message={loadError} />
        <p><Link to="/assignments">Back to assignments</Link></p>
      </section>
    );
  }

  if (!subjects) {
    return (
      <section>
        <h1>{title}</h1>
        <Loading what={editing ? "Loading the assignment" : "Loading"} />
      </section>
    );
  }

  if (subjects.length === 0) {
    return (
      <section>
        <h1>{title}</h1>
        <div className="empty">
          <p>Add a subject first, so your assignment has somewhere to go.</p>
          <Link to="/subjects" className="button">Go to subjects</Link>
        </div>
      </section>
    );
  }

  // Connects a field's message to the field, so screen readers read it out.
  const describe = (name) => (problems[name] ? { "aria-invalid": true, "aria-describedby": `${name}-problem` } : {});
  const Problem = ({ name }) =>
    problems[name] ? <p className="field-problem" id={`${name}-problem`}>{problems[name]}</p> : null;

  return (
    <section className="form-page">
      <Link to="/assignments" className="back-link">Back to assignments</Link>
      <h1>{title}</h1>

      {saveError && <ErrorMessage message={saveError} />}

      <form onSubmit={save} noValidate className="assignment-form">
        <label className="field">
          <span>Title</span>
          <input
            ref={(el) => (fields.current.title = el)}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            maxLength={MAX_TITLE + 20}
            placeholder="Fractions worksheet, page 42"
            {...describe("title")}
          />
          <Problem name="title" />
        </label>

        <div className="form-row">
          <label className="field">
            <span>Subject</span>
            <select
              ref={(el) => (fields.current.subject_id = el)}
              value={form.subject_id}
              onChange={(e) => update("subject_id", e.target.value)}
              {...describe("subject_id")}
            >
              <option value="">Choose a subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <Problem name="subject_id" />
          </label>

          <label className="field">
            <span>Due date</span>
            <input
              type="date"
              ref={(el) => (fields.current.due_date = el)}
              value={form.due_date}
              onChange={(e) => update("due_date", e.target.value)}
              {...describe("due_date")}
            />
            <Problem name="due_date" />
          </label>
        </div>

        <fieldset className="field segmented difficulty-picker">
          <legend>Difficulty</legend>
          <div>
            {[1, 2, 3].map((level) => (
              <label key={level}>
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  checked={Number(form.difficulty) === level}
                  onChange={() => update("difficulty", level)}
                />
                <span>
                  {DIFFICULTY[level]} <small>{XP[level]} XP</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field">
          <span>Notes (optional)</span>
          <textarea
            ref={(el) => (fields.current.notes = el)}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            placeholder="Which problems, pages or materials"
            {...describe("notes")}
          />
          <Problem name="notes" />
        </label>

        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add assignment"}
          </button>
          <Link to="/assignments" className="button button-quiet">Cancel</Link>

          {editing && !confirmingDelete && (
            <button type="button" className="button-danger-quiet" onClick={() => setConfirmingDelete(true)}>
              Delete assignment
            </button>
          )}
        </div>

        {editing && confirmingDelete && (
          <div className="confirm" role="alertdialog" aria-labelledby="confirm-text">
            <p id="confirm-text">
              Delete “{form.title || "this assignment"}”? Any XP you earned from it goes too. This can't be undone.
            </p>
            <div className="form-actions">
              <button type="button" className="button-danger" onClick={remove} disabled={saving} autoFocus>
                {saving ? "Deleting…" : "Delete"}
              </button>
              <button type="button" className="button-quiet" onClick={() => setConfirmingDelete(false)}>
                Keep it
              </button>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}
