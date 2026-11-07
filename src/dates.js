// Date helpers. "Today" always comes from this computer's clock, not the server's,
// because the server uses UTC time, which is 8 hours ahead of California.

// Today's date as YYYY-MM-DD, in local time.
export function todayISO(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// How many days from today until a YYYY-MM-DD date. Negative means it's in the past.
export function daysUntil(iso, today = todayISO()) {
  const toDay = (s) => Date.UTC(...s.split("-").map((n, i) => (i === 1 ? n - 1 : +n)));
  return Math.round((toDay(iso) - toDay(today)) / 86_400_000);
}

// A YYYY-MM-DD date as "Fri, Nov 6".
export function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// What to show for a due date, plus a "tone" the page uses to color it.
//   overdue  in the past and not done
//   soon     due today or tomorrow
//   later    any other day
//   done     already finished
export function dueLabel(iso, completed = false, today = todayISO()) {
  const days = daysUntil(iso, today);
  if (completed) return { text: `Was due ${formatDate(iso)}`, tone: "done" };
  if (days < 0) {
    const n = -days;
    return { text: `${n} ${n === 1 ? "day" : "days"} overdue`, tone: "overdue" };
  }
  if (days === 0) return { text: "Due today", tone: "soon" };
  if (days === 1) return { text: "Due tomorrow", tone: "soon" };
  if (days < 7) {
    const [y, m, d] = iso.split("-").map(Number);
    const weekday = new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long" });
    return { text: `Due ${weekday}`, tone: "later" };
  }
  return { text: `Due ${formatDate(iso)}`, tone: "later" };
}

export const DIFFICULTY = { 1: "Easy", 2: "Medium", 3: "Hard" };

// A YYYY-MM-DD date moved forward (or back, with a negative number) by some days.
export function addDays(iso, days) {
  const [y, m, d] = iso.split("-").map(Number);
  return todayISO(new Date(y, m - 1, d + days));
}

// XP each difficulty is worth when the assignment is finished. Must match the backend.
export const XP = { 1: 10, 2: 20, 3: 30 };
