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
