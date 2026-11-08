// Checks for StudyQuest's game rules: levels, streaks and badges.
// These test plain functions, so the app doesn't need to be running:
//     npm run test:rules
import { levelFor, summarize } from "../worker/xp.js";
import { streakFrom } from "../worker/stats.js";
import { bestStreakFrom } from "../worker/achievements.js";
import { BADGES, evaluateBadges } from "../worker/badges.js";

let passed = 0;
let failed = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  ok ? passed++ : failed++;
  console.log(ok ? `  ✓ ${name}` : `  ✗ ${name}\n      expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
const days = (...d) => new Set(d);

console.log("\nLevels");
check("0 XP is level 1", levelFor(0), 1);
check("99 XP is still level 1", levelFor(99), 1);
check("100 XP is level 2", levelFor(100), 2);
check("250 XP is level 3", levelFor(250), 3);
check("progress inside a level", summarize(250).xp_into_level, 50);

console.log("\nCurrent streak (still alive if today isn't done yet)");
const today = "2026-11-08";
check("no completions: 0", streakFrom(days(), today), 0);
check("only today: 1", streakFrom(days("2026-11-08"), today), 1);
check("yesterday and the day before, nothing yet today: 2", streakFrom(days("2026-11-07", "2026-11-06"), today), 2);
check("today, yesterday and the day before: 3", streakFrom(days("2026-11-08", "2026-11-07", "2026-11-06"), today), 3);
check("last done two days ago: broken, 0", streakFrom(days("2026-11-06"), today), 0);
check("a gap stops the count", streakFrom(days("2026-11-08", "2026-11-06"), today), 1);
check("counts across a month boundary", streakFrom(days("2026-10-31", "2026-11-01"), "2026-11-01"), 2);
check("counts across a leap day", streakFrom(days("2028-02-28", "2028-02-29", "2028-03-01"), "2028-03-01"), 3);

console.log("\nBest streak ever");
check("no days: 0", bestStreakFrom(days()), 0);
check("one day: 1", bestStreakFrom(days("2026-11-01")), 1);
check("finds the longest run, not the latest", bestStreakFrom(days("2026-11-01", "2026-11-02", "2026-11-03", "2026-11-07")), 3);
check("order of the days doesn't matter", bestStreakFrom(days("2026-11-03", "2026-11-01", "2026-11-02")), 3);
check("two separate runs: the bigger one wins", bestStreakFrom(days("2026-11-01", "2026-11-02", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13")), 4);

console.log("\nBadges");
const nothing = evaluateBadges({});
check("a brand-new student has no badges", nothing.filter((b) => b.earned).length, 0);
check("every badge reports 0 progress when there's no data", nothing.every((b) => b.current === 0), true);
check("badge IDs are all different", new Set(BADGES.map((b) => b.id)).size, BADGES.length);
const earnedIds = (m) => evaluateBadges(m).filter((b) => b.earned).map((b) => b.id);
check("1 finished assignment earns First Quest only", earnedIds({ completed: 1 }), ["first_quest"]);
check("4 finished is one short of High Five", earnedIds({ completed: 4 }).includes("high_five"), false);
check("5 finished earns High Five", earnedIds({ completed: 5 }).includes("high_five"), true);
check("a 3-day best streak earns On a Roll, not Week Warrior", earnedIds({ best_streak: 3 }), ["on_a_roll"]);
check("100 XP earns Century exactly at the target", earnedIds({ total_xp: 100 }), ["century"]);
check("progress can go past the target", evaluateBadges({ completed: 30 }).find((b) => b.id === "quest_master").current, 30);

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
