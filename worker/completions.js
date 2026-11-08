// Endpoints for checking off an assignment and un-checking it.
import { json, ApiError, parseId, readJson, checkToday } from "./helpers.js";
import { findAssignment } from "./assignments.js";
import { XP_FOR, totalXp, summarize } from "./xp.js";

// POST /api/assignments/:id/complete
// The server decides the XP from the assignment's difficulty, so nobody can ask for extra.
// The browser sends its own date, like {"today": "2026-11-08"}, so the streak counts the
// student's days instead of UTC days.
export async function completeAssignment(env, params, _url, request) {
  const id = parseId(params.id, "assignment");
  const today = checkToday((await readJson(request)).today);
  const assignment = await findAssignment(env, id);
  if (assignment.completed) {
    throw new ApiError("That assignment is already checked off.", 409);
  }

  const xp = XP_FOR[assignment.difficulty];
  const before = summarize(await totalXp(env));

  // completions.assignment_id is UNIQUE, so even two clicks at the same moment can't pay twice.
  try {
    await env.DB.prepare(
      "INSERT INTO completions (assignment_id, completed_at, completed_on, xp_earned) VALUES (?, ?, ?, ?)"
    ).bind(id, new Date().toISOString(), today, xp).run();
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
      throw new ApiError("That assignment is already checked off.", 409);
    }
    throw err;
  }

  const stats = summarize(before.total_xp + xp);
  return json({
    assignment: await findAssignment(env, id),
    xp_earned: xp,
    leveled_up: stats.level > before.level,
    ...stats,
  });
}

// DELETE /api/assignments/:id/complete: un-check it, which takes its XP back.
export async function undoCompletion(env, params) {
  const id = parseId(params.id, "assignment");
  const assignment = await findAssignment(env, id);
  if (!assignment.completed) {
    throw new ApiError("That assignment isn't checked off, so there's nothing to undo.", 409);
  }

  await env.DB.prepare("DELETE FROM completions WHERE assignment_id = ?").bind(id).run();

  return json({
    undone: true,
    xp_lost: assignment.xp_earned,
    assignment: await findAssignment(env, id),
    ...summarize(await totalXp(env)),
  });
}
