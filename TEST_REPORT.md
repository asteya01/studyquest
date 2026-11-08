# StudyQuest test report

**What this covers:** how I tested StudyQuest, what the tests found, and what I fixed.
**Last automated run:** Nov 8, 2026. **Run on my Mac on:** ____________ ← fill in after you run the commands below.

## 1. Summary

| Suite | Command | Needs the app running? | What it checks | Tests | Result |
| --- | --- | --- | --- | --- | --- |
| API | `npm run test:api` | Yes (`npm run dev`) | Every backend endpoint, including bad input | 97 | All pass |
| Game rules | `npm run test:rules` | No | Levels, streaks, best streak, badge thresholds | 27 | All pass |
| Dates | `npm run test:dates` | No | Today's date, due-date labels, daylight saving, month and year ends | 26 | All pass |
| Build | `npm run build` | No | The production version builds with no errors | n/a | Passes |
| Manual | Checklist in section 4 | Yes | What a person sees and does, on a computer and a phone | 24 | ← fill in |

**150 automated tests**, plus the manual checklist.
`npm test` runs the two suites that don't need the app (53 tests).

## 2. What the automated tests check

**API tests (97)**, grouped by what they check:

| Group | Tests | Examples |
| --- | --- | --- |
| Backend and database | 2 | The health check says the database is connected; subjects load |
| Add, read, update, delete | 6 | Extra spaces are trimmed; fields I don't send stay the same |
| Search, filter, sort | 5 | Searching for `%` doesn't match everything; sorting really is in order |
| Bad input | 7 | Empty title, Feb 30, difficulty 5, missing subject, title too long, not JSON: each gives a 400 and a clear message |
| Checking off work | 10 | Medium gives 20 XP; checking twice is refused (409); undo takes the XP back; made-up dates are refused |
| Quest stats | 13 | Level follows the 100-XP rule; the progress bar total and done count move; the streak comes back after undo |
| Achievements and badges | 10 | Each badge is earned exactly when it reaches its target; finishing a hard assignment early moves the right counters |
| Subjects | 16 | Duplicate names (even with different capitals) get a 409; the 13th subject is refused; deleting a subject removes its assignments and their XP |
| More edge cases | 26 | Unknown address (404), wrong method (405), bad filters, refused updates change nothing, text like `'; DROP TABLE subjects; --` is stored as plain text |
| Cleaning up | 2 | The test data is deleted at the end, so my real data isn't changed |

**Rules tests (27):** 0, 99 and 100 XP; a streak that is alive, broken, has a gap, or crosses a month
end or a leap day; best streak with separate runs; badges at one below and exactly at the target.

**Date tests (26):** 9 PM in California on Nov 7 is still Nov 7 even though UTC says Nov 8; adding a
day across daylight saving (Mar 8 and Nov 1, 2026), leap day 2028 and New Year; "1 day overdue" vs
"4 days overdue"; and that the XP values in the frontend and backend match.

**What a test looks like.** Every test follows the same pattern: do something, then compare the answer
with what should happen:

```js
const twice = await call("POST", `/assignments/${id}/complete`, { today: TODAY });
check("checking off twice is refused (no double XP)", twice.status === 409);
```

## 3. Bugs the testing found, and how they were fixed

| # | Where | What went wrong | How it was found | Fix |
| --- | --- | --- | --- | --- |
| 1 | Assignments page | Clicking "Clear filters" put the old filters back about a quarter of a second later | Clicking it in a browser | The search box's timer was using an old copy of the filters. The first fix didn't work because the router's copy was also old. The real fix reads the filters from the address bar at the moment it runs |
| 2 | Assignments page, phone | The filters were squeezed and hard to use | Looking at a 375px-wide screen | Filters rearrange into two columns, with Search and the To do / Done switch on their own rows |
| 3 | Add assignment form | On a narrow screen the Difficulty picker jumped to the wrong place in the form | Checking the form at phone width | A style meant for the filters was leaking into the form. It's now limited to `.filters .segmented` |
| 4 | Streak (design, step 6) | The server saves times in UTC, which is 8 hours ahead of California, so checking off homework at 9 PM would count as tomorrow and break streaks | Reasoning about time zones before building | A new migration saves the browser's own date with each completion. The server only accepts a date within one day of its own. Date tests now cover "9 PM in California" |
| 5 | Phone layout (step 9) | The "Add assignment" button wrapped onto two lines, and the three stat cards stacked so tall the progress bar was off the screen | Screenshots at 375px | The button says "+ Add" on phones; Total XP and Streak sit side by side |
| 6 | Dark mode (step 9) | The white check mark on a green circle had a contrast ratio of 2.27 to 1 (needs 3 to 1) | Measuring every color pair with a script | The check mark is dark in dark mode |
| 7 | API test (step 10) | The new test "deleting an assignment that doesn't exist replies 404" failed once, on the first run | The test run | **Not explained.** Checking the endpoint by hand returned the correct 404, and the test then passed in 8 more runs, 3 of them right after a fresh start of the dev server. The most likely cause is the dev server still warming up. The test now prints the status it received, so if it fails again the report will show why |

## 4. Manual test checklist

I did these by hand on my Mac in a browser and on my phone. Start with `npm run dev`.
Put **Pass** or **Fail** in the last column, and write down anything odd.

| # | What I do | What should happen | Result |
| --- | --- | --- | --- |
| 1 | Open the Dashboard | I see the clock, Level, Total XP, Streak, Today's progress and Up next | |
| 2 | Click a circle in "Up next" | It leaves "Up next", a "+XP" message shows, and XP, streak and the progress bar change | |
| 3 | Open Assignments | All assignments show with their subject color, difficulty and due date | |
| 4 | Type a word from a title in Search | The list narrows after a short pause, and the address bar shows `?search=...` | |
| 5 | Choose a subject, then "To do" | Only that subject's unfinished work shows | |
| 6 | Refresh the page | The filters are still there | |
| 7 | Type nonsense in Search | "No assignments match these filters" with a Clear filters button, and the button works | |
| 8 | Click an assignment's circle, then click it again | It becomes green with a line through the title, then goes back, and XP is added and taken away | |
| 9 | Press Tab until a circle is focused, then Enter | It checks off, using only the keyboard | |
| 10 | Add assignment with everything empty | A message appears next to each missing field, and focus jumps to the first one | |
| 11 | Add a real assignment | "Assignment added." shows and it's in the list. Refreshing doesn't show the message again | |
| 12 | Edit it, change the difficulty, save | "Changes saved." and the XP label on the row changes | |
| 13 | Delete it | An "are you sure?" box (not a pop-up) appears, then "Assignment deleted." | |
| 14 | Subjects: add "Art" | It appears in the list and in the subject dropdowns | |
| 15 | Subjects: add "art" again | "You already have a subject called Art." appears next to the box | |
| 16 | Subjects: delete one that has assignments | The warning says how many assignments and how much XP will be lost | |
| 17 | Achievements | Earned badges are in color, locked badges show a padlock and a progress bar | |
| 18 | Click the moon button | The whole app goes dark. After a refresh it's still dark | |
| 19 | Make the browser window narrow, or open the site on my phone | The menu moves to the bottom and nothing scrolls sideways | |
| 20 | On my phone, tap a circle, a tab and the Add button | They're easy to hit, and typing in a box doesn't zoom the page | |
| 21 | Stop the app (Ctrl + C in the Terminal), then refresh a page | A message says it can't reach the server, with a "Try again" button | |
| 22 | Start the app again and click "Try again" | The page loads normally | |
| 23 | Go to a made-up address like `/hello` | "Page not found" with a link to the dashboard | |
| 24 | Press Tab once on a fresh page | "Skip to content" appears and works | |

## 5. What isn't tested (and why)

- **No automated tests for the React pages.** The checks above are manual. Adding a browser-testing tool
  would be the next step, but it downloads a whole browser, which is a lot for a project this size.
- **The "overdue work I finished long ago" rule for the progress bar** can't be tested through the API,
  because the API doesn't let anyone finish work on a past date (that's what stops fake streaks). I
  checked it by hand against the sample data.
- **The deployed website.** Testing the live workers.dev address happens in step 11.
- **Many people at once, logins and passwords.** StudyQuest is a one-person app and has no accounts.

## 6. How to run everything again

```bash
cd ~/studyquest
npm test                 # rules + dates, no app needed (53 tests)
npm run dev              # leave this running, then in a second Terminal tab:
npm run test:api         # 97 tests
npm run build            # the production build
```

If a test fails, it prints the name of the check and what it expected. The tests clean up the
assignments and subjects they create, so it's safe to run them again.
