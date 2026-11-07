// Endpoints for assignments: list, get one, add, update and delete.
import { json, ApiError, readJson, parseId, isRealDate } from "./helpers.js";

const MAX_TITLE = 120;
const MAX_NOTES = 1000;

// Every assignment query starts from this, so each one comes back with its subject's
// name and color, and whether it has been completed.
const SELECT_ASSIGNMENT = `
  SELECT a.id, a.title, a.notes, a.due_date, a.difficulty, a.created_at,
         a.subject_id, s.name AS subject_name, s.color AS subject_color,
         c.completed_at, c.xp_earned
    FROM assignments a
    JOIN subjects s         ON s.id = a.subject_id
    LEFT JOIN completions c ON c.assignment_id = a.id`;

// The database stores "completed" as a completed_at date or nothing. Make it a clear true/false.
function shape(row) {
  return { ...row, completed: row.completed_at !== null };
}

async function findAssignment(env, id) {
  const row = await env.DB.prepare(`${SELECT_ASSIGNMENT} WHERE a.id = ?`).bind(id).first();
  if (!row) throw new ApiError(`There's no assignment with ID ${id}. It may have been deleted.`, 404);
  return shape(row);
}

// ------------------------------------------------------------------
//  Validation: check the information before it goes in the database
// ------------------------------------------------------------------
async function validate(env, input) {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (!title) throw new ApiError("Give the assignment a title.");
  if (title.length > MAX_TITLE) throw new ApiError(`Keep the title under ${MAX_TITLE} characters.`);

  const notes = input.notes == null ? "" : input.notes;
  if (typeof notes !== "string") throw new ApiError("Notes need to be text.");
  if (notes.length > MAX_NOTES) throw new ApiError(`Keep the notes under ${MAX_NOTES} characters.`);

  if (!isRealDate(input.due_date)) {
    throw new ApiError("Pick a real due date, written like 2026-11-05.");
  }

  const difficulty = input.difficulty == null ? 1 : Number(input.difficulty);
  if (![1, 2, 3].includes(difficulty)) {
    throw new ApiError("Difficulty must be 1 (easy), 2 (medium) or 3 (hard).");
  }

  const subjectId = Number(input.subject_id);
  if (!Number.isInteger(subjectId)) throw new ApiError("Choose a subject for the assignment.");
  const subject = await env.DB.prepare("SELECT id FROM subjects WHERE id = ?").bind(subjectId).first();
  if (!subject) throw new ApiError("That subject doesn't exist. Choose one from the list.");

  return { title, notes: notes.trim(), due_date: input.due_date, difficulty, subject_id: subjectId };
}

// ------------------------------------------------------------------
//  Endpoints
// ------------------------------------------------------------------

// GET /api/assignments?search=&subject=&status=&sort=
//   search   words to look for in the title or notes
//   subject  a subject ID, to show only that subject
//   status   "todo", "done" or "all" (default)
//   sort     "due" (soonest first, default), "due_desc", "newest" or "difficulty"
export async function listAssignments(env, _params, url) {
  const where = [];
  const values = [];

  const search = url.searchParams.get("search")?.trim();
  if (search) {
    // Escape % and _ so they're searched for literally instead of acting as wildcards.
    const pattern = `%${search.replace(/[\\%_]/g, (ch) => "\\" + ch)}%`;
    where.push("(a.title LIKE ? ESCAPE '\\' OR a.notes LIKE ? ESCAPE '\\')");
    values.push(pattern, pattern);
  }

  const subject = url.searchParams.get("subject");
  if (subject) {
    const subjectId = Number(subject);
    if (!Number.isInteger(subjectId)) throw new ApiError("The subject filter needs to be a subject ID.");
    where.push("a.subject_id = ?");
    values.push(subjectId);
  }

  const status = url.searchParams.get("status") ?? "all";
  if (status === "todo") where.push("c.id IS NULL");
  else if (status === "done") where.push("c.id IS NOT NULL");
  else if (status !== "all") throw new ApiError('Status must be "todo", "done" or "all".');

  const sorts = {
    due: "a.due_date ASC, a.id ASC",
    due_desc: "a.due_date DESC, a.id DESC",
    newest: "a.created_at DESC, a.id DESC",
    difficulty: "a.difficulty DESC, a.due_date ASC",
  };
  const sort = url.searchParams.get("sort") ?? "due";
  if (!sorts[sort]) throw new ApiError('Sort must be "due", "due_desc", "newest" or "difficulty".');

  const sql = `${SELECT_ASSIGNMENT}
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY ${sorts[sort]}`;
  const { results } = await env.DB.prepare(sql).bind(...values).all();
  return json(results.map(shape));
}

// GET /api/assignments/:id
export async function getAssignment(env, params) {
  return json(await findAssignment(env, parseId(params.id, "assignment")));
}

// POST /api/assignments
export async function createAssignment(env, _params, _url, request) {
  const a = await validate(env, await readJson(request));
  const result = await env.DB.prepare(
    `INSERT INTO assignments (subject_id, title, notes, due_date, difficulty)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(a.subject_id, a.title, a.notes, a.due_date, a.difficulty).run();
  return json(await findAssignment(env, result.meta.last_row_id), 201);
}

// PUT /api/assignments/:id: change any of the fields. Fields you don't send stay the same.
export async function updateAssignment(env, params, _url, request) {
  const id = parseId(params.id, "assignment");
  const existing = await findAssignment(env, id);
  const changes = await readJson(request);
  const a = await validate(env, { ...existing, ...changes });
  await env.DB.prepare(
    `UPDATE assignments SET subject_id = ?, title = ?, notes = ?, due_date = ?, difficulty = ?
      WHERE id = ?`
  ).bind(a.subject_id, a.title, a.notes, a.due_date, a.difficulty, id).run();
  return json(await findAssignment(env, id));
}

// DELETE /api/assignments/:id: also removes its completion (ON DELETE CASCADE).
export async function deleteAssignment(env, params) {
  const id = parseId(params.id, "assignment");
  const result = await env.DB.prepare("DELETE FROM assignments WHERE id = ?").bind(id).run();
  if (result.meta.changes === 0) {
    throw new ApiError(`There's no assignment with ID ${id}. It may have been deleted already.`, 404);
  }
  return json({ deleted: true, id });
}
