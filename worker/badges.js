// The badges, and the rules for earning them. All the rules live in this one list, so adding a
// badge later means adding one line here.
//
// "metric" says which number from the student's history the badge looks at, and "target" is
// how high that number has to get. Badges aren't stored anywhere. They're worked out from the
// completions every time, so they can't get out of sync with the real data.

export const BADGES = [
  { id: "first_quest",   name: "First Quest",   tier: "bronze", metric: "completed",   target: 1,   description: "Finish your first assignment." },
  { id: "high_five",     name: "High Five",     tier: "bronze", metric: "completed",   target: 5,   description: "Finish 5 assignments." },
  { id: "double_digits", name: "Double Digits", tier: "silver", metric: "completed",   target: 10,  description: "Finish 10 assignments." },
  { id: "quest_master",  name: "Quest Master",  tier: "gold",   metric: "completed",   target: 25,  description: "Finish 25 assignments." },
  { id: "on_a_roll",     name: "On a Roll",     tier: "bronze", metric: "best_streak", target: 3,   description: "Finish work 3 days in a row." },
  { id: "week_warrior",  name: "Week Warrior",  tier: "gold",   metric: "best_streak", target: 7,   description: "Finish work 7 days in a row." },
  { id: "century",       name: "Century",       tier: "silver", metric: "total_xp",    target: 100, description: "Earn 100 XP." },
  { id: "xp_legend",     name: "XP Legend",     tier: "gold",   metric: "total_xp",    target: 500, description: "Earn 500 XP." },
  { id: "boss_battle",   name: "Boss Battle",   tier: "silver", metric: "hard",        target: 3,   description: "Finish 3 hard assignments." },
  { id: "head_start",    name: "Head Start",    tier: "silver", metric: "early",       target: 3,   description: "Finish 3 assignments before the day they're due." },
  { id: "triple_play",   name: "Triple Play",   tier: "bronze", metric: "best_day",    target: 3,   description: "Finish 3 assignments in one day." },
  { id: "well_rounded",  name: "Well Rounded",  tier: "bronze", metric: "subjects",    target: 3,   description: "Finish work in 3 different subjects." },
];

// Turn the student's numbers (like { completed: 6, best_streak: 2, ... }) into the badge list,
// each marked earned or not, with how far along the student is.
export function evaluateBadges(metrics) {
  return BADGES.map(({ id, name, tier, description, metric, target }) => {
    const current = metrics[metric] ?? 0;
    return { id, name, tier, description, current, target, earned: current >= target };
  });
}
