// Small tools every endpoint uses.

// Reply with JSON data. 200 = it worked, 201 = something new was created.
export function json(data, status = 200) {
  return Response.json(data, { status });
}

// A problem the user can fix, like an empty title. The router turns it into a reply.
export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

// Read the JSON a request sent. Throws a friendly error if it isn't valid JSON.
export async function readJson(request) {
  try {
    const body = await request.json();
    if (body === null || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body;
  } catch {
    throw new ApiError("Send the information as a JSON object, like {\"title\": \"Math homework\"}.");
  }
}

// Turn the :id in an address into a number, or reply 404 if it isn't one.
export function parseId(value, what = "item") {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new ApiError(`There's no ${what} with ID "${value}".`, 404);
  return id;
}

// True if text is a real calendar date written as YYYY-MM-DD (so 2026-02-30 is rejected).
export function isRealDate(text) {
  if (typeof text !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const date = new Date(`${text}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(text);
}
