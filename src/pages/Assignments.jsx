// The Assignments page: every assignment, with search, filters and sorting.
//
// The filters live in the address bar (like /assignments?subject=1&status=todo).
// That's why refreshing the page, or sharing the link, keeps them.
import useTitle from "../useTitle.js";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { api, assignments } from "../api.js";
import { todayISO } from "../dates.js";
import AssignmentRow from "../components/AssignmentRow.jsx";
import { Loading, ErrorMessage } from "../components/Status.jsx";

const STATUSES = [
  { value: "all", label: "All" },
  { value: "todo", label: "To do" },
  { value: "done", label: "Done" },
];

const SORTS = [
  { value: "due", label: "Due soonest" },
  { value: "due_desc", label: "Due latest" },
  { value: "newest", label: "Recently added" },
  { value: "difficulty", label: "Hardest first" },
];

export default function Assignments() {
  useTitle("Assignments");
  const [params, setParams] = useSearchParams();
  const subject = params.get("subject") ?? "";
  const status = params.get("status") ?? "all";
  const sort = params.get("sort") ?? "due";

  // The search box updates instantly; the address (and the request) waits until typing pauses.
  const [searchText, setSearchText] = useState(params.get("search") ?? "");
  const search = params.get("search") ?? "";

  const [list, setList] = useState(null);       // null = not loaded yet
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retries, setRetries] = useState(0);    // bumping this reloads the list

  // A short message from the form, like "Assignment added." It's removed from the browser's
  // history right away, so refreshing doesn't show it again, and hides after 5 seconds.
  const location = useLocation();
  const navigate = useNavigate();
  const [flash, setFlash] = useState(location.state?.flash ?? null);
  useEffect(() => {
    if (!location.state?.flash) return;
    setFlash(location.state.flash);
    navigate(location.pathname + location.search, { replace: true, state: null });
    const timer = setTimeout(() => setFlash(null), 5000);
    return () => clearTimeout(timer);
  }, [location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check off (or un-check) an assignment. We wait for the server's answer before changing the row,
  // because the server is the one that decides how much XP it's worth.
  const [busyId, setBusyId] = useState(null);
  const flashTimer = useRef(null);
  function showFlash(message) {
    clearTimeout(flashTimer.current);
    setFlash(message);
    flashTimer.current = setTimeout(() => setFlash(null), 5000);
  }
  useEffect(() => () => clearTimeout(flashTimer.current), []);

  async function toggle(a) {
    setBusyId(a.id);
    try {
      const result = a.completed ? await assignments.undo(a.id) : await assignments.complete(a.id, todayISO());
      // Swap the new version of this one assignment into the list. The row stays where it is
      // until the next reload, so it doesn't jump away under your finger.
      setList((rows) => rows.map((row) => (row.id === a.id ? result.assignment : row)));
      setError(null);
      if (a.completed) {
        showFlash(`Unchecked. −${result.xp_lost} XP. You have ${result.total_xp} XP.`);
      } else if (result.leveled_up) {
        showFlash(`+${result.xp_earned} XP. Level up! You're now level ${result.level}.`);
      } else {
        showFlash(`+${result.xp_earned} XP. You have ${result.total_xp} XP.`);
      }
    } catch (err) {
      showFlash(null);
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  // Change one filter in the address bar, removing it when it's back to its default.
  //
  // It reads the filters straight from the address bar (window.location) at the moment it runs.
  // Bug we fixed: it used to start from a copy saved earlier, so the search box's 250 ms timer
  // put old filters back right after "Clear filters" was clicked.
  function setFilter(name, value, defaultValue = "") {
    const next = new URLSearchParams(window.location.search);
    if (value === defaultValue) next.delete(name);
    else next.set(name, value);
    setParams(next, { replace: true });
  }

  function clearFilters() {
    setSearchText("");
    setParams({}, { replace: true });
  }

  // Wait 250 ms after the last keystroke before searching, so we don't ask the server on every letter.
  useEffect(() => {
    const trimmed = searchText.trim();
    if (trimmed === search) return;
    const timer = setTimeout(() => setFilter("search", trimmed), 250);
    return () => clearTimeout(timer);
  }, [searchText]); // eslint-disable-line react-hooks/exhaustive-deps

  // Subjects for the dropdown. Loaded once.
  useEffect(() => {
    api.subjects().then(setSubjects).catch(() => setSubjects([]));
  }, []);

  // Load the list whenever a filter changes.
  useEffect(() => {
    let stale = false; // if filters change again before this answer arrives, ignore it
    setLoading(true);
    setError(null);
    assignments
      .list({ search, subject, status: status === "all" ? "" : status, sort })
      .then((data) => !stale && setList(data))
      .catch((err) => !stale && setError(err.message))
      .finally(() => !stale && setLoading(false));
    return () => {
      stale = true;
    };
  }, [search, subject, status, sort, retries]);

  const filtered = Boolean(search || subject || status !== "all");

  return (
    <section>
      <h1>Assignments</h1>
      <p className="flash" role="status">{flash}</p>

      <div className="filters">
        <label className="field field-search">
          <span>Search</span>
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Title or notes"
          />
        </label>

        <label className="field">
          <span>Subject</span>
          <select value={subject} onChange={(e) => setFilter("subject", e.target.value)}>
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>

        <fieldset className="field segmented">
          <legend>Show</legend>
          <div>
            {STATUSES.map((s) => (
              <label key={s.value}>
                <input
                  type="radio"
                  name="status"
                  value={s.value}
                  checked={status === s.value}
                  onChange={() => setFilter("status", s.value, "all")}
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="field">
          <span>Sort</span>
          <select value={sort} onChange={(e) => setFilter("sort", e.target.value, "due")}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => setRetries((n) => n + 1)} />}

      {!error && list === null && <Loading what="Loading assignments" />}

      {!error && list !== null && (
        <>
          <p className="result-count" aria-live="polite">
            {loading ? "Updating…" : `${list.length} ${list.length === 1 ? "assignment" : "assignments"}`}
          </p>

          {list.length > 0 ? (
            <ul className={`assignment-list${loading ? " is-updating" : ""}`}>
              {list.map((a) => (
                <AssignmentRow key={a.id} assignment={a} onToggle={toggle} busy={busyId === a.id} />
              ))}
            </ul>
          ) : filtered ? (
            <div className="empty">
              <p>No assignments match these filters.</p>
              <button onClick={clearFilters}>Clear filters</button>
            </div>
          ) : (
            <div className="empty">
              <p>No assignments yet. Add your first one to start earning XP.</p>
              <Link to="/assignments/new" className="button">Add assignment</Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}
