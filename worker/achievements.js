// GET /api/achievements: level, XP and every badge (earned or still locked).
import { json, addDays } from "./helpers.js";
import { totalXp, summarize } from "./xp.js";
import { evaluateBadges } from "./badges.js";

// The longest run of days in a row that had a finished assignment, ever. We use the best run
// (not the current streak) so a badge you've earned doesn't vanish when a streak ends.
export function bestStreakFrom(days) {
  let best = 0;
  let run = 0;
  let previous = null;
  for (const day of [...days].sort()) {
    run = previous && addDays(previous, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }
  return best;
}

export async function getAchievements(env) {
  const total_xp = await totalXp(env);

  // One row of counts about all finished work. "early" means finished on an earlier day than the
  // due date. (In SQLite a true comparison is 1 and false is 0, so SUM counts the true ones.)
  const counts = await env.DB.prepare(
    `SELECT COUNT(*)                                  AS completed,
            COALESCE(SUM(a.difficulty = 3), 0)        AS hard,
            COALESCE(SUM(c.completed_on < a.due_date), 0) AS early,
            COUNT(DISTINCT a.subject_id)              AS subjects
       FROM completions c
       JOIN assignments a ON a.id = c.assignment_id`
  ).first();

  const perDay = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM completions WHERE completed_on IS NOT NULL GROUP BY completed_on"
  ).all();
  const best_day = Math.max(0, ...perDay.results.map((r) => r.n));

  const { results } = await env.DB.prepare(
    "SELECT DISTINCT completed_on FROM completions WHERE completed_on IS NOT NULL"
  ).all();
  const best_streak = bestStreakFrom(new Set(results.map((r) => r.completed_on)));

  const badges = evaluateBadges({ ...counts, total_xp, best_streak, best_day });

  return json({
    ...summarize(total_xp),
    best_streak,
    earned_count: badges.filter((b) => b.earned).length,
    total_count: badges.length,
    badges,
  });
}
