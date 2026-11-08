// Automated checks for StudyQuest's API.
//
// Start the app first (npm run dev), then in another Terminal tab run:
//     npm run test:api
//
// Each check sends a request and compares the answer with what should happen.
// It creates one test assignment and deletes it at the end, so your data isn't changed.

const BASE = process.env.API_URL ?? "http://localhost:5173/api";

let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}${detail ? `\n      ${detail}` : ""}`);
  }
}

async function call(method, path, body) {
  const response = await fetch(BASE + path, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
  return { status: response.status, data: await response.json().catch(() => null) };
}

async function main() {
  try {
    await fetch(`${BASE}/health`);
  } catch {
    console.log(`Can't reach ${BASE}. Start the app with "npm run dev" first.`);
    process.exit(1);
  }

  console.log("\nBackend and database");
  const health = await call("GET", "/health");
  check("health check says the database is connected", health.data?.database === "connected");

  const subjects = await call("GET", "/subjects");
  check("subjects load", subjects.status === 200 && Array.isArray(subjects.data) && subjects.data.length > 0);
  const subjectId = subjects.data?.[0]?.id;

  console.log("\nAdding, reading, updating and deleting");
  const created = await call("POST", "/assignments", {
    title: "  Automated test assignment  ",
    subject_id: subjectId,
    due_date: "2030-01-15",
    difficulty: 2,
  });
  const id = created.data?.id;
  check("adding an assignment replies 201", created.status === 201, JSON.stringify(created.data));
  check("extra spaces are trimmed from the title", created.data?.title === "Automated test assignment");

  const fetched = await call("GET", `/assignments/${id}`);
  check("the new assignment can be read back", fetched.status === 200 && fetched.data?.id === id);
  check("a new assignment isn't completed yet", fetched.data?.completed === false);

  const updated = await call("PUT", `/assignments/${id}`, { title: "Updated test assignment" });
  check("updating the title works", updated.data?.title === "Updated test assignment");
  check("fields that weren't sent stay the same", updated.data?.difficulty === 2);

  console.log("\nSearch, filter and sort");
  const search = await call("GET", "/assignments?search=Updated%20test");
  check("search finds it", search.data?.some((a) => a.id === id));
  const bySubject = await call("GET", `/assignments?subject=${subjectId}`);
  check("subject filter only returns that subject", bySubject.data?.every((a) => a.subject_id === subjectId));
  const todo = await call("GET", "/assignments?status=todo");
  check("'todo' filter only returns unfinished work", todo.data?.every((a) => !a.completed));
  const sorted = await call("GET", "/assignments?sort=due");
  const dates = sorted.data?.map((a) => a.due_date) ?? [];
  check("sorting by due date puts the soonest first", dates.every((d, i) => i === 0 || dates[i - 1] <= d));
  const wildcard = await call("GET", "/assignments?search=%25");
  check("searching for % doesn't match everything", wildcard.data?.length === 0);

  console.log("\nChecking off work and earning XP");
  const statsBefore = await call("POST", `/assignments/${id}/complete`);
  check("checking off a medium assignment replies 200", statsBefore.status === 200, JSON.stringify(statsBefore.data));
  check("a medium assignment earns 20 XP", statsBefore.data?.xp_earned === 20);
  check("the assignment now shows as completed", statsBefore.data?.assignment?.completed === true);
  const xpAfter = statsBefore.data?.total_xp;
  check("level follows the 100-XP rule", statsBefore.data?.level === Math.floor(xpAfter / 100) + 1);
  const twice = await call("POST", `/assignments/${id}/complete`);
  check("checking off twice is refused (no double XP)", twice.status === 409 && typeof twice.data?.error === "string");
  const undone = await call("DELETE", `/assignments/${id}/complete`);
  check("un-checking takes the XP back", undone.data?.undone === true && undone.data?.total_xp === xpAfter - 20);
  const undoneTwice = await call("DELETE", `/assignments/${id}/complete`);
  check("un-checking something not done is refused", undoneTwice.status === 409);
  const noSuch = await call("POST", "/assignments/999999/complete");
  check("checking off an assignment that doesn't exist replies 404", noSuch.status === 404);

  console.log("\nBad input gets a clear error");
  const bad = [
    ["empty title", { title: "  ", subject_id: subjectId, due_date: "2030-01-15" }],
    ["a date that doesn't exist (Feb 30)", { title: "x", subject_id: subjectId, due_date: "2030-02-30" }],
    ["difficulty 5", { title: "x", subject_id: subjectId, due_date: "2030-01-15", difficulty: 5 }],
    ["a subject that doesn't exist", { title: "x", subject_id: 999999, due_date: "2030-01-15" }],
    ["a title that's too long", { title: "a".repeat(200), subject_id: subjectId, due_date: "2030-01-15" }],
    ["text that isn't JSON", "hello"],
  ];
  for (const [what, body] of bad) {
    const r = await call("POST", "/assignments", body);
    check(`${what} is rejected with a message`, r.status === 400 && typeof r.data?.error === "string",
      `got ${r.status} ${JSON.stringify(r.data)}`);
  }
  const missing = await call("GET", "/assignments/999999");
  check("an assignment that doesn't exist replies 404", missing.status === 404);

  console.log("\nCleaning up");
  const deleted = await call("DELETE", `/assignments/${id}`);
  check("deleting works", deleted.data?.deleted === true);
  const gone = await call("GET", `/assignments/${id}`);
  check("after deleting, it's gone", gone.status === 404);

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
}

main();
