// GET /api/stats?today=YYYY-MM-DD: everything the dashboard shows, worked out from the database.
import { json, addDays, checkToday } from "./helpers.js";
import { totalXp, summarize } from "./xp.js";

// The streak is how many days in a row (ending today) have at least one finished assignment.
// If nothing is finished yet today, the streak is still alive: it only breaks once a whole day
// goes by with nothing. So we start counting from yesterday in that case.
export function streakFrom(days, today) {
  let day = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

export async function getStats(env, _params, url) {
  const today = checkToday(url.searchParams.get("today"));
  const tomorrow = addDays(today, 1);

  const xp = await totalXp(env);

  const { results } = await env.DB.prepare(
    "SELECT DISTINCT completed_on FROM completions WHERE completed_on <= ?"
  ).bind(today).all();
  const days = new Set(results.map((r) => r.completed_on));

  // The progress bar covers work due today or tomorrow, plus anything overdue that isn't done.
  // An overdue assignment you finished earlier is old news, so it doesn't count. (If you finish
  // it today it does, so the bar moves forward when you catch up.)
  const progress = await env.DB.prepare(
    `SELECT COUNT(*) AS total, COUNT(c.id) AS done
       FROM assignments a
       LEFT JOIN completions c ON c.assignment_id = a.id
      WHERE a.due_date <= ?
        AND (c.id IS NULL OR a.due_date >= ? OR c.completed_on = ?)`
  ).bind(tomorrow, today, today).first();

  return json({
    today,
    ...summarize(xp),
    streak: streakFrom(days, today),
    done_today: days.has(today),
    progress: {
      done: progress.done,
      total: progress.total,
      percent: progress.total === 0 ? 0 : Math.round((progress.done / progress.total) * 100),
    },
  });
}
