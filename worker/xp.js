// The XP rules, in one place so every endpoint agrees.

// Harder work earns more XP: easy = 10, medium = 20, hard = 30.
export const XP_FOR = { 1: 10, 2: 20, 3: 30 };

// Every 100 XP is one level. 0-99 XP is level 1, 100-199 is level 2, and so on.
export function levelFor(xp) {
  return Math.floor(xp / 100) + 1;
}

// Add up the XP from every completion. We add it up each time instead of storing a running
// total, so the total can never get out of sync (for example after un-checking or deleting work).
export async function totalXp(env) {
  const row = await env.DB.prepare("SELECT COALESCE(SUM(xp_earned), 0) AS xp FROM completions").first();
  return row.xp;
}

// The numbers the frontend shows: total XP, level, and how far into the level you are.
export function summarize(xp) {
  return { total_xp: xp, level: levelFor(xp), xp_into_level: xp % 100, xp_for_next_level: 100 };
}
