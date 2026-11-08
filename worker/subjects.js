// Endpoints for subjects (Math, Science...): list, add and delete.
import { json, ApiError, readJson, parseId } from "./helpers.js";

const MAX_NAME = 30;
const MAX_SUBJECTS = 12; // keeps the dropdowns and the page a sensible size

// Every subject, with how many assignments it has and how much XP those assignments earned.
// The frontend uses the numbers to warn before deleting.
async function subjectsWithCounts(env) {
  const { results } = await env.DB.prepare(
    `SELECT s.id, s.name, s.color,
            (SELECT COUNT(*) FROM assignments a WHERE a.subject_id = s.id) AS assignment_count,
            (SELECT COALESCE(SUM(c.xp_earned), 0)
               FROM completions c JOIN assignments a ON a.id = c.assignment_id
              WHERE a.subject_id = s.id) AS xp_earned
       FROM subjects s
      ORDER BY s.name COLLATE NOCASE`
  ).all();
  return results;
}

// GET /api/subjects
export async function listSubjects(env) {
  return json(await subjectsWithCounts(env));
}

// POST /api/subjects  { name, color }
export async function createSubject(env, _params, _url, request) {
  const input = await readJson(request);

  // Trim, and squash repeated spaces so "Social   Studies" and "Social Studies" match.
  const name = typeof input.name === "string" ? input.name.trim().replace(/\s+/g, " ") : "";
  if (!name) throw new ApiError("Give the subject a name.");
  if (name.length > MAX_NAME) throw new ApiError(`Keep the name under ${MAX_NAME} characters.`);

  const color = input.color ?? "#7c8cff";
  if (typeof color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(color)) {
    throw new ApiError("Pick a color for the subject.");
  }

  const { count } = await env.DB.prepare("SELECT COUNT(*) AS count FROM subjects").first();
  if (count >= MAX_SUBJECTS) {
    throw new ApiError(`You can have up to ${MAX_SUBJECTS} subjects. Delete one you don't use first.`);
  }

  // The database's UNIQUE rule ignores capital letters, so check "math" vs "Math" ourselves.
  const clash = await env.DB.prepare("SELECT name FROM subjects WHERE lower(name) = lower(?)").bind(name).first();
  if (clash) throw new ApiError(`You already have a subject called ${clash.name}.`, 409);

  const result = await env.DB.prepare("INSERT INTO subjects (name, color) VALUES (?, ?)")
    .bind(name, color.toLowerCase()).run();

  return json({ id: result.meta.last_row_id, name, color: color.toLowerCase(), assignment_count: 0, xp_earned: 0 }, 201);
}

// DELETE /api/subjects/:id
// The database deletes the subject's assignments too (ON DELETE CASCADE), and their
// completions go with them. We count them first so we can tell the student what was removed.
export async function deleteSubject(env, params) {
  const id = parseId(params.id, "subject");
  const subject = (await subjectsWithCounts(env)).find((s) => s.id === id);
  if (!subject) throw new ApiError(`There's no subject with ID ${id}. It may have been deleted already.`, 404);

  await env.DB.prepare("DELETE FROM subjects WHERE id = ?").bind(id).run();
  return json({
    deleted: true,
    id,
    assignments_deleted: subject.assignment_count,
    xp_lost: subject.xp_earned,
  });
}
