# StudyQuest prompt log

## Prompt 1: Architecture

**ROLE:** You are an experienced full-stack software engineer and a patient programming teacher.

**CONTEXT:** I am an 8th-grade student building StudyQuest. It's a homework planner that turns
schoolwork into a game. Students and parents share one StudyQuest: parents add assignments, and
the student checks them off to earn XP, fill a daily progress bar, level up, keep a streak and
unlock badges. The dashboard shows what's due soon and a clock so the student knows their screen-time limit.

**TASK:** Design the architecture for StudyQuest and set up the starting project so I can begin
building features.

**CONSTRAINTS:**
- Everything must be deployable on free hosting.
- Use React with Vite for the frontend.
- Use Cloudflare Workers for the backend.
- Use Cloudflare D1 for the database.
- Keep the project understandable to an 8th grader, and explain technical terms simply.
- Use made-up sample data only, never real students' information.
- Do not build the whole application at once.

**ACCEPTANCE CRITERIA:**
- The architecture supports all five features in PROJECT.md.
- The frontend can talk to the backend.
- Information is saved permanently in the database.
- The project runs on my computer and can later be deployed for free.

**OUTPUT:**
1. System architecture
2. Database design with at least three related tables
3. API design
4. Folder structure
5. A step-by-step implementation plan
6. AGENTS.md, ARCHITECTURE.md and TASKS.md files

## Prompt 2: Assignments backend

**ROLE:** You are an experienced full-stack software engineer and a patient programming teacher.

**CONTEXT:** StudyQuest's starter project works: React frontend, Cloudflare Worker backend and a
D1 database with subjects, assignments and completions tables. Only /api/health and /api/subjects exist.

**TASK:** Build the assignments API: list (with search, subject filter, done/not done filter and
sorting), get one, add, update and delete.

**CONSTRAINTS:**
- Follow AGENTS.md and the API design in ARCHITECTURE.md.
- Validate everything before saving and reply with error messages a student would understand.
- Use ? placeholders in SQL so typed text can never change a query.
- Backend only for this step. The pages come next.

**ACCEPTANCE CRITERIA:**
- I can add, view, update and delete an assignment, and changes stay saved.
- An empty title, a fake date, a difficulty of 5 or a subject that doesn't exist each give a clear error.
- Search, filter and sort return the right assignments.
- Asking for an assignment that doesn't exist gives a 404 message.

**OUTPUT:** The new endpoints, an explanation of how they work, and commands I can use to test each one.

## Prompt 3: Assignments page

**ROLE:** You are an experienced React developer and a patient programming teacher.

**CONTEXT:** StudyQuest's assignments API works and passes 22 automated checks. The Assignments
page is still a placeholder.

**TASK:** Build the Assignments page: a list of every assignment with a search box, a subject
filter, a to do / done filter and sorting.

**CONSTRAINTS:**
- Follow AGENTS.md. Use the existing api.js and the Loading and ErrorMessage components.
- Make the assignment row a reusable component, because the dashboard will need it later.
- Show due dates in a way a student understands, like "Due tomorrow" or "2 days overdue".
- Must work on a phone.
- Don't add checking off yet. That's step 5.

**ACCEPTANCE CRITERIA:**
- Typing in the search box narrows the list as I type.
- The subject, status and sort controls all change the list correctly.
- Refreshing the page keeps my filters.
- When nothing matches, the page says so and offers a way to clear the filters.
- If the server fails, I see a helpful message and a Try again button.

**OUTPUT:** The working page, an explanation of how it gets its data, and how to test it.

## Prompt 4: Assignment form

**ROLE:** You are an experienced React developer and a patient programming teacher.

**CONTEXT:** StudyQuest's Assignments page lists, searches, filters and sorts assignments.
Clicking an assignment or "Add assignment" goes to a placeholder page.

**TASK:** Build one form used for both adding and editing an assignment, plus a way to delete one.

**CONSTRAINTS:**
- Follow AGENTS.md. Use api.js and the existing Loading and ErrorMessage components.
- Check the fields in the browser before sending, using the same rules as the backend,
  and show each problem next to its field.
- Still show the backend's message if it rejects something.
- Ask "are you sure?" before deleting, without a pop-up window.
- Show how much XP each difficulty is worth, because that's part of the quest.

**ACCEPTANCE CRITERIA:**
- I can add an assignment and see it in the list afterward.
- Editing opens the form already filled in, and saving keeps my changes.
- An empty title, a missing subject or a missing date each show a message next to the field.
- Deleting asks first, then removes it.
- Opening an edit page for an assignment that doesn't exist shows a helpful message.
- After saving or deleting, I see a short message saying it worked.

**OUTPUT:** The working form, an explanation of how adding and editing share one form, and how to test it.

## Prompt 5: Completing work and earning XP

**ROLE:** You are a senior full-stack engineer pair-programming with an 8th-grade student.
I'm the engineer in charge. You're my assistant. Explain what you do in simple
language and define any technical terms.

**CONTEXT:** StudyQuest is a homework planner that works like a game. It uses React and Vite for
the frontend, one Cloudflare Worker for the backend, and Cloudflare D1 for the
database. Steps 1-4 are finished: the subjects, assignments and completions tables
exist (completions.assignment_id is UNIQUE); there are endpoints to list, add, edit
and delete assignments; and there's an Assignments page with search, filters and a
form. Nothing can be checked off yet, so there is no XP. Read AGENTS.md,
ARCHITECTURE.md and TASKS.md first and follow them.

**TASK:** Build step 5 only, "Completing work."
1. Backend: POST /api/assignments/:id/complete records a completion and awards XP by
   difficulty (easy 10, medium 20, hard 30). DELETE /api/assignments/:id/complete
   removes the completion, which takes the XP back.
2. Both endpoints reply with the updated assignment, the XP gained or lost, total XP,
   level, and whether the student just leveled up. Level = floor(XP / 100) + 1.
3. Frontend: a round check button on every assignment row. Clicking it checks the
   assignment off, or un-checks it if it's already done. Show a message such as
   "+20 XP. You have 40 XP." and a different one when the student levels up.
4. Add automated checks for the new endpoints to tests/api-check.js.
5. Check off the finished items in TASKS.md.
Don't build the dashboard, streak or progress bar. Those are step 6.

**CONSTRAINTS:**
- The server decides the XP from the assignment's difficulty. The frontend never
  sends an XP amount, so nobody can cheat.
- Checking off the same assignment twice must not give double XP. It should be refused
  with a clear message (409), even if two clicks arrive at the same moment.
- Don't store a running XP total. Add it up from the completions table each time so it
  can never get out of sync.
- Don't change the database tables or edit old migrations.
- Use ? placeholders in all SQL. All requests from the frontend go through src/api.js.
- Wait for the server's answer before changing the row on screen. Don't guess the XP.
- The button must work with a keyboard, have a clear accessible label, and show a
  visible focus outline.
- It must fit on a phone screen (375px wide).
- Keep the code simple enough that I can explain every part of it.

**ACCEPTANCE CRITERIA:**
- Clicking the circle on a to-do assignment shows it as done (green circle, crossed-out
  title) and shows "+XP" with the right amount for its difficulty.
- Clicking it again un-checks it and shows the XP taken away.
- Total XP and level are right after checking and un-checking.
- Checking off a done assignment, un-checking one that isn't done, and using an ID that
  doesn't exist all give a clear error message instead of crashing.
- Refreshing the page keeps the checked state (it's saved in

## Prompt 6: Quest stats and dashboard

**ROLE:**
You are a senior full-stack engineer pair-programming with an 8th-grade student.
I'm the engineer in charge. You're my assistant. Explain what you do in simple
language and define any technical terms.

**CONTEXT:**
StudyQuest is a homework planner that works like a game (React + Vite frontend, one
Cloudflare Worker backend, Cloudflare D1 database). Steps 1-5 are done: assignments
CRUD, the Assignments page and form, and checking off work for XP (10/20/30). The
dashboard is still a placeholder from step 1. Read AGENTS.md, ARCHITECTURE.md and
TASKS.md first and follow them.

**TASK:**
Build step 6 only, "Quest stats."
1. Backend: GET /api/stats?today=YYYY-MM-DD returns total XP, level, XP into the
   current level, streak, whether something was finished today, and progress
   (done, total, percent) for work due today, tomorrow or overdue.
2. Rebuild the Dashboard page with a level card and XP bar, total XP, streak, a
   "Today's progress" bar, a live clock with a greeting, and an "Up next" list of
   the 5 soonest to-do assignments that I can check off.
3. Add automated checks for the stats endpoint to tests/api-check.js.
4. Update ARCHITECTURE.md and TASKS.md.
Don't build subjects or achievements. Those are steps 7 and 8.

**CONSTRAINTS:**
- "Today" comes from the browser, never the server clock (the server is UTC, 8 hours
  ahead of California). The server must refuse a date that's more than a day off
  from its own date.
- A streak is days in a row ending today. If I haven't finished anything yet today,
  the streak is still alive. It only breaks after a full day with nothing done.
- Streak days must be my local days. If that needs a new column, make a NEW numbered
  migration and don't edit old ones.
- XP and level are calculated from the completions table each time. Don't store totals.
- The progress bar must not be inflated by old overdue work I finished long ago.
- The dashboard needs a loading indicator and a helpful error message with a retry button.
- Progress bars need accessible labels (role="progressbar" with values).
- The clock's timer must be cleaned up when I leave the page. Respect reduced-motion.
- It must work on a phone (375px wide), with no sideways scrolling.

**ACCEPTANCE CRITERIA:**
- After checking off work, XP, level, streak and the progress bar update without
  refreshing the page.
- With no streak, a one-day streak, a streak that's alive from yesterday, and a
  broken streak, the numbers and messages are right.
- With nothing due, the progress card says I'm all clear instead of showing 0 of 0.
- Un-checking work puts XP, streak and progress back.
- Leaving the dashboard open past midnight moves it to the new day.
- npm run test:api and npm run build both pass.

**OUTPUT:**
- Start with your plan in a few sentences, before writing code.
- Then list every file you changed or added, with one line on why.
- Finish with the exact commands to run and test it myself, and what I should try
  by hand.

## Prompt 7: Subjects page

**ROLE:** You are a senior full-stack engineer pair-programming with an 8th-grade student.
I'm the engineer in charge. You're my assistant. Explain what you do in simple
language and define any technical terms.

**CONTEXT:** StudyQuest is a homework planner that works like a game (React + Vite, one Cloudflare
Worker, Cloudflare D1). Steps 1-6 are done, including the dashboard and XP. The
Subjects page is still a "coming soon" placeholder, and GET /api/subjects is the only
subject endpoint. The assignments table has ON DELETE CASCADE on subject_id. Read
AGENTS.md, ARCHITECTURE.md and TASKS.md first and follow them.

**TASK:** Build step 7 only, "Subjects page."
1. Backend: POST /api/subjects (name and color) and DELETE /api/subjects/:id.
2. The subject list also returns each subject's assignment count and XP earned.
3. Frontend: a Subjects page with an add form (name and color swatches) and a list of
   subjects with their colors and assignment counts, and a Delete button on each.
4. Add automated checks to tests/api-check.js.
5. Update ARCHITECTURE.md and TASKS.md.
Don't build achievements or change the design. Those are steps 8 and 9.

**CONSTRAINTS:**
- Validate on the server: name required, trimmed, 30 characters or fewer, valid color,
  no duplicate names (even if the capital letters differ), and at most 12 subjects.
  Duplicates reply 409, other problems 400, all with a message a person can understand.
- Deleting a subject deletes its assignments and their XP. Before deleting, the page
  must say exactly how many assignments and how much XP will be lost. Use an inline
  "are you sure?" box, not a browser pop-up.
- Color can't be the only way to choose: each swatch needs a name for screen readers.
- Messages for mistakes appear next to the name box, and focus goes back to it.
- Use ? placeholders in SQL. Don't change the database tables. All requests go
  through src/api.js.
- Must work on a phone (375px wide) and with only a keyboard.

**ACCEPTANCE CRITERIA:**
- I can add "Art", see it in the list, and see it in the dropdowns on the
  Assignments page and the assignment form.
- Adding an empty name, a name over 30 characters, "math" when "Math" exists, or a 13th
  subject all show a clear message and don't add anything.
- Deleting a subject with assignments shows the warning with the right numbers, then
  removes the subject, its assignments, and the XP from my total.
- Deleting a subject with no assignments shows a shorter question.
- npm run test:api and npm run build both pass.

**OUTPUT:**
- Start with your plan in a few sentences, before writing code.
- Then list every file you changed or added, with one line on why.
- Finish with the exact commands to run and test it myself, and what I should try
  by hand.

## Prompt 8: Achievements page

**ROLE:** You are a senior full-stack engineer pair-programming with an 8th-grade student.
I'm the engineer in charge. You're my assistant. Explain what you do in simple
language and define any technical terms.

**CONTEXT:** StudyQuest is a homework planner that works like a game (React + Vite, one Cloudflare
Worker, Cloudflare D1). Steps 1-7 are done: assignments, check-off with XP, the
dashboard with streak and progress, and subjects. The Achievements page is still a
"coming soon" placeholder. Read AGENTS.md, ARCHITECTURE.md and TASKS.md first and
follow them.

**TASK:** Build step 8 only, "Achievements."
1. Define 12 badges in one list, each with a name, description, tier (bronze, silver
   or gold), the number it looks at, and a target. They use finished assignments, best
   streak, total XP, hard assignments finished, assignments finished before their due
   date, most finished in one day, and number of different subjects finished.
2. Backend: GET /api/achievements returns level, XP, best streak, and every badge with
   how far along I am and whether it's earned.
3. Frontend: an Achievements page with summary cards, "Earned" badges, and "Still
   locked" badges with a progress bar, ordered by how close I am to unlocking them.
4. Add automated checks, including a separate test file for the pure rules (levels,
   streaks and badges) that doesn't need the app running.
5. Update ARCHITECTURE.md and TASKS.md, and remove the placeholder page.
Don't change the design. That's step 9.

**CONSTRAINTS:**
- Don't store badges or counters in the database. Work them out from the completions
  table every time, so they can't get out of sync. Don't change the tables.
- Streak badges use my best streak ever, not my current one, so a badge I earned
  doesn't disappear when a streak ends.
- Put every badge rule in one list so I can add a badge by adding one line.
- Use ? placeholders in SQL. All requests go through src/api.js.
- Show progress as "3 of 5" text as well as a bar, and give each bar an accessible label.
- Don't rely on color alone: locked and earned badges need different icons and text.
- Must work on a phone (375px wide), with a loading indicator and an error message with
  a retry button.

**ACCEPTANCE CRITERIA:**
- A new student with no finished work sees 0 of 12 badges, and a friendly message
  under "Earned".
- Finishing an assignment moves the right counters, and un-checking puts them back.
- A badge is earned exactly when its number reaches its target (4 of 5 is locked, 5
  of 5 is earned).
- Locked badges are in order from closest to unlock to furthest.
- A best streak of 3 earns On a Roll but not Week Warrior.
- npm run test:api, npm run test:rules and npm run build all pass.

**OUTPUT:**
- Start with your plan in a few sentences, before writing code.
- Then list every file you changed or added, with one line on why.
- Finish with the exact commands to run and test it myself, and what I should try
  by hand.

## Prompt 9: Final design, phones and dark mode

**ROLE:** You are a senior front-end engineer and designer pair-programming with an 8th-grade
student. I'm the engineer in charge. You're my assistant. Explain what you do in
simple language and define any technical terms.

**CONTEXT:** StudyQuest is a homework planner that works like a game (React + Vite, Cloudflare
Worker, D1). Steps 1-8 are done and every feature works, but the styling is a basic
starting point: colors are typed in many places, the menu wraps awkwardly on a phone,
and there's no dark mode. My users are students in grades 6-9 who mostly use it on a
phone or a school laptop. Read AGENTS.md, ARCHITECTURE.md and TASKS.md first and follow them.

**TASK:**
Build step 9 only, "Design and phones." Don't change what the app does.
1. Move every color into named CSS variables, with a light set and a dark set.
2. Add a dark mode toggle in the top bar. Remember my choice, follow my computer's
   setting if I haven't chosen, and don't flash the wrong theme while loading.
3. Give it its own look instead of a generic template: keep the readable Lexend font,
   and make the Level card the one bold, game-like element (dark with a gold XP bar).
4. Make every page work on a phone (375px wide): turn the menu into a bottom tab bar
   with icons, keep the layout from scrolling sideways, and keep the add button on one line.
5. Add a skip-to-content link, a title for each page, and a favicon.
6. Update ARCHITECTURE.md and TASKS.md.

**CONSTRAINTS:**
- Text must have a contrast ratio of at least 4.5:1 in both themes (3:1 for icons).
  Check the numbers instead of guessing.
- Buttons, inputs and tabs must be at least 44px tall on a phone. Input text must be
  16px so iPhones don't zoom in.
- Never use color alone to show meaning. Keep text or icons with it.
- Keep keyboard focus visible. Respect "reduce motion". Only animate in response to
  something I did (like checking a box), not on page load.
- If saving the theme isn't allowed by the browser, the toggle must still work.
- Don't add libraries. Don't change the backend or database.
- Don't make it look like every other app: avoid a stock template look.

**ACCEPTANCE CRITERIA:**
- Every page looks right in light and dark, on a computer and a 375px phone, with no
  sideways scrolling.
- The toggle switches the theme, and my choice is still there after a refresh.
- Tab is the first key press: "Skip to content" appears and works.
- Each page has its own title in the browser tab.
- npm run test:api, npm run test:rules and npm run build all pass.

**OUTPUT:**
- Start with your plan in a few sentences, before writing code.
- Then list every file you changed or added, with one line on why.
- Finish with the exact commands to run and test it myself, and what I should try
  by hand (including on my phone).
