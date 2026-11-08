// Checks for the date helpers the frontend uses (src/dates.js).
// They're plain functions, so the app doesn't need to be running:
//     npm run test:dates
//
// Dates are where apps most often go wrong, so we test the tricky moments on purpose:
// just before midnight, the clocks changing for daylight saving, month and year ends.

// Run these checks as if the computer were in California.
process.env.TZ = "America/Los_Angeles";

const { todayISO, daysUntil, addDays, formatDate, dueLabel, XP } = await import("../src/dates.js");
const { XP_FOR } = await import("../worker/xp.js");

let passed = 0;
let failed = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  ok ? passed++ : failed++;
  console.log(ok ? `  ✓ ${name}` : `  ✗ ${name}\n      expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

console.log("\nToday's date (always the computer's own day, never UTC's)");
check("9 PM in California on Nov 7 is still Nov 7, even though UTC is already Nov 8",
  todayISO(new Date("2026-11-08T05:00:00Z")), "2026-11-07");
check("just after midnight in California is the new day", todayISO(new Date("2026-11-08T08:01:00Z")), "2026-11-08");
check("single-digit months and days are padded", todayISO(new Date("2026-03-05T20:00:00Z")), "2026-03-05");
check("New Year's Eve at 11:59 PM stays in the old year", todayISO(new Date("2027-01-01T07:59:00Z")), "2026-12-31");

console.log("\nAdding days");
check("tomorrow", addDays("2026-11-08", 1), "2026-11-09");
check("yesterday", addDays("2026-11-08", -1), "2026-11-07");
check("end of month", addDays("2026-10-31", 1), "2026-11-01");
check("end of year", addDays("2026-12-31", 1), "2027-01-01");
check("leap day exists in 2028", addDays("2028-02-28", 1), "2028-02-29");
check("no leap day in 2027", addDays("2027-02-28", 1), "2027-03-01");
check("daylight saving ends Nov 1, 2026 (a 25-hour day) and it still moves one day", addDays("2026-11-01", 1), "2026-11-02");
check("daylight saving starts Mar 8, 2026 (a 23-hour day) and it still moves one day", addDays("2026-03-08", 1), "2026-03-09");

console.log("\nDays until");
check("same day is 0", daysUntil("2026-11-08", "2026-11-08"), 0);
check("tomorrow is 1", daysUntil("2026-11-09", "2026-11-08"), 1);
check("two days ago is -2", daysUntil("2026-11-06", "2026-11-08"), -2);
check("counts across the daylight saving change correctly", daysUntil("2026-11-03", "2026-10-31"), 3);
check("counts across a year end", daysUntil("2027-01-02", "2026-12-30"), 3);

console.log("\nWhat the due date says (today is Sunday, Nov 8, 2026)");
const today = "2026-11-08";
const label = (due, done = false) => dueLabel(due, done, today);
check("due today", label("2026-11-08"), { text: "Due today", tone: "soon" });
check("due tomorrow", label("2026-11-09"), { text: "Due tomorrow", tone: "soon" });
check("this week shows the day's name", label("2026-11-11"), { text: "Due Wednesday", tone: "later" });
check("a week or more away shows the date", label("2026-11-20"), { text: "Due Fri, Nov 20", tone: "later" });
check("1 day overdue (singular)", label("2026-11-07"), { text: "1 day overdue", tone: "overdue" });
check("4 days overdue (plural)", label("2026-11-04"), { text: "4 days overdue", tone: "overdue" });
check("finished work says when it was due, and is never overdue", label("2026-11-04", true), { text: "Was due Wed, Nov 4", tone: "done" });
check("formatDate writes a short date", formatDate("2026-11-06"), "Fri, Nov 6");

console.log("\nThe frontend and backend agree");
check("XP per difficulty is the same on both sides", XP, XP_FOR);

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
