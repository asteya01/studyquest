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
