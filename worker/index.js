// StudyQuest backend: a Cloudflare Worker.
//
// Every request to an address starting with /api/ comes here. Everything else
// (the React pages) is served automatically by Cloudflare's static assets.
//
// env.DB is the D1 database (set up in wrangler.jsonc).
import { json, ApiError } from "./helpers.js";
import { listSubjects } from "./subjects.js";
import {
  listAssignments, getAssignment, createAssignment, updateAssignment, deleteAssignment,
} from "./assignments.js";
import { completeAssignment, undoCompletion } from "./completions.js";

// GET /api/health: is the backend running, and can it reach the database?
async function health(env) {
  const row = await env.DB.prepare("SELECT COUNT(*) AS subjects FROM subjects").first();
  return json({ ok: true, database: "connected", subjects: row.subjects });
}

// Each route is [method, address pattern, handler]. ":id" matches any value and is passed to the handler.
const routes = [
  ["GET", "/api/health", health],
  ["GET", "/api/subjects", listSubjects],
  ["GET", "/api/assignments", listAssignments],
  ["POST", "/api/assignments", createAssignment],
  ["GET", "/api/assignments/:id", getAssignment],
  ["PUT", "/api/assignments/:id", updateAssignment],
  ["DELETE", "/api/assignments/:id", deleteAssignment],
  ["POST", "/api/assignments/:id/complete", completeAssignment],
  ["DELETE", "/api/assignments/:id/complete", undoCompletion],
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let addressExists = false;

    for (const [method, pattern, handler] of routes) {
      const match = new URLPattern({ pathname: pattern }).exec(url);
      if (!match) continue;
      addressExists = true;
      if (request.method !== method) continue;

      try {
        return await handler(env, match.pathname.groups, url, request);
      } catch (err) {
        if (err instanceof ApiError) return json({ error: err.message }, err.status);
        // Something unexpected broke. Log the details for us, send a plain message to the user.
        console.error(`${method} ${url.pathname} failed:`, err);
        return json({ error: "Something went wrong on the server. Please try again." }, 500);
      }
    }

    // 405 = the address exists but not with that method (like DELETE /api/subjects).
    return addressExists
      ? json({ error: `${request.method} isn't allowed at ${url.pathname}.` }, 405)
      : json({ error: `There's no API endpoint at ${request.method} ${url.pathname}.` }, 404);
  },
};
