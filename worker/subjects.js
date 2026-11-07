// Endpoints for subjects (Math, Science...).
import { json } from "./helpers.js";

// GET /api/subjects: every subject, with how many assignments each one has.
export async function listSubjects(env) {
  const { results } = await env.DB.prepare(
    `SELECT s.id, s.name, s.color, COUNT(a.id) AS assignment_count
       FROM subjects s
       LEFT JOIN assignments a ON a.subject_id = s.id
      GROUP BY s.id
      ORDER BY s.name`
  ).all();
  return json(results);
}
