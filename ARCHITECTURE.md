# StudyQuest architecture

How the three parts of StudyQuest fit together, in plain language.

## The big picture

```
   You, in the browser                 Cloudflare (or your computer while developing)
 ┌─────────────────────┐   asks for   ┌──────────────────────┐   reads and   ┌─────────────────┐
 │  Frontend (React)   │ ───────────▶ │  Backend (Worker)    │ ────────────▶ │  Database (D1)  │
 │  the pages you see  │ ◀─────────── │  the rules and API   │ ◀──────────── │  saved forever  │
 └─────────────────────┘  JSON data   └──────────────────────┘    writes     └─────────────────┘
```

- **Frontend:** everything you see and click, built with **React**, a library for building pages
  out of reusable pieces called components. **Vite** is the tool that runs it while we develop
  and packages it for the internet.
- **Backend:** a **Cloudflare Worker**, a small program that runs on Cloudflare's servers.
  The frontend never touches the database directly. It asks the Worker, and the Worker checks
  that the request makes sense before saving anything.
- **Database:** **Cloudflare D1**, which stores information in tables, like a spreadsheet that
  never forgets. It's what keeps your assignments saved after you close the browser.

The frontend and backend talk using an **API** (Application Programming Interface): a list of
web addresses starting with `/api/` that the frontend can send requests to. They reply with
**JSON**, a simple text format for data, like `{"title": "Math worksheet", "difficulty": 2}`.

Both the frontend and the Worker are deployed together as **one Cloudflare Worker**, which serves
the React pages and answers `/api/` requests. That keeps it to one project, one command to run it,
and one free `workers.dev` address.

## Database design

Three related tables. "Related" means rows point at rows in other tables using an ID.

```
 subjects                 assignments                       completions
 ┌──────────────┐         ┌───────────────────────┐         ┌────────────────────────┐
 │ id           │◀────┐   │ id                    │◀────┐   │ id                     │
 │ name         │     └───│ subject_id            │     └───│ assignment_id (unique) │
 │ color        │         │ title                 │         │ completed_at  (UTC)    │
 │ completed_on  (local)  │
 │ created_at   │         │ notes                 │         │ xp_earned              │
 └──────────────┘         │ due_date  (YYYY-MM-DD)│         └────────────────────────┘
                          │ difficulty (1, 2, 3)  │
                          │ created_at            │
                          └───────────────────────┘
```

- A **subject** (Math, Science...) has many assignments.
- An **assignment** belongs to one subject. Deleting a subject deletes its assignments.
- A **completion** records when an assignment was finished and how much XP it earned.
  Each assignment can be completed once (`unique`). Un-checking an assignment deletes its completion.

### Why completions are a separate table

Keeping completions separate gives us a history of *when* work was finished. That history is what
the quest features are calculated from, so they never get out of sync:

| Quest feature | How it's calculated |
| --- | --- |
| **XP** | Add up `xp_earned` from every completion. Easy = 10, medium = 20, hard = 30 XP. |
| **Level** | Every 100 XP is one level: `level = floor(XP / 100) + 1`. |
| **Streak** | Count the days in a row, up to today, that have at least one completion. Today not finished yet doesn't break it. |
| **Progress bar** | Of the assignments due today or tomorrow (or overdue), what fraction are done. |
| **Badges** | Rules checked against completions, like "5 assignments finished" or "a 3-day streak". |

### Dates and time zones

Cloudflare's servers run on UTC time, which is 8 hours ahead of California. So "today" always
comes from the **browser**: the frontend sends its local date (like `?today=2026-11-04`) to the
endpoints that need it. The server only accepts a date within one day of its own UTC date, so a
wrong clock or a made-up date is refused.

Each completion saves two times: `completed_at` (exact moment, UTC) and `completed_on` (the
student's own calendar day, from the browser). The streak counts `completed_on` days, so a
9 PM check-off in California counts for that evening instead of tomorrow (migration 0003).

## API design

| Action | Method and address | Sends | Gets back |
| --- | --- | --- | --- |
| Check the backend is running | `GET /api/health` | | `{ ok, database }` |
| List subjects | `GET /api/subjects` | | list of subjects |
| Add a subject | `POST /api/subjects` | name, color | the new subject |
| Delete a subject | `DELETE /api/subjects/:id` | | `{ deleted: true }` |
| List assignments | `GET /api/assignments?subject=&status=&sort=&search=` | filters | list of assignments |
| Get one assignment | `GET /api/assignments/:id` | | one assignment |
| Add an assignment | `POST /api/assignments` | title, subject_id, due_date, difficulty, notes | the new assignment |
| Update an assignment | `PUT /api/assignments/:id` | the changed fields | the updated assignment |
| Delete an assignment | `DELETE /api/assignments/:id` | | `{ deleted: true }` |
| Check off an assignment | `POST /api/assignments/:id/complete` | today | XP earned, total XP, level |
| Un-check an assignment | `DELETE /api/assignments/:id/complete` | | `{ undone: true }` |
| Quest stats | `GET /api/stats?today=YYYY-MM-DD` | today's date | XP, level, streak, progress (badges come in step 8) |

**GET** reads, **POST** creates, **PUT** updates and **DELETE** removes.

### Validation and errors

Before saving, the Worker checks every request, for example: the title isn't empty and is under
120 characters, the due date is a real date, difficulty is 1, 2 or 3, and the subject exists.

When something is wrong it replies with a status code and a message the frontend can show:

```json
{ "error": "Give the assignment a title." }
```

| Code | Meaning |
| --- | --- |
| 200 / 201 | It worked (201 = something new was created) |
| 400 | The request had a problem, like an empty title |
| 404 | That assignment or subject doesn't exist |
| 500 | Something broke in the backend |

## Pages

| Page | Address | What's on it |
| --- | --- | --- |
| Dashboard | `/` | Today's progress bar, XP, level, streak, what's due soon, the clock |
| Assignments | `/assignments` | Every assignment with search, filter by subject and status, sort by due date |
| Add / edit assignment | `/assignments/new`, `/assignments/:id/edit` | The assignment form |
| Subjects | `/subjects` | Add and remove subjects |
| Achievements | `/achievements` | Level, total XP, and badges earned and locked |

A shared **Layout** component draws the navigation menu on every page.

## Folder structure

```
studyquest/
├── PROJECT.md            what StudyQuest is (Part 1)
├── PROMPTS.md            my structured prompt log
├── AGENTS.md             rules my AI coding agent follows
├── ARCHITECTURE.md       this file
├── TASKS.md              the build checklist
├── package.json          the project's tools and commands
├── vite.config.js        settings for Vite
├── wrangler.jsonc        settings for Cloudflare (Worker name, database)
├── index.html            the one HTML page React draws into
├── migrations/           SQL files that create the database tables and sample data
├── worker/               the backend
│   ├── index.js          the router: sends each /api/ request to the right endpoint
│   ├── helpers.js        shared tools (replies, errors, checking IDs and dates)
│   ├── subjects.js       subject endpoints
│   ├── assignments.js    assignment endpoints and their validation
│   ├── completions.js    check off and un-check
│   ├── xp.js             the XP and level rules
│   └── stats.js          dashboard numbers: XP, level, streak, progress
├── tests/
│   └── api-check.js      automated checks for the API (npm run test:api)
└── src/                  the frontend
    ├── main.jsx          starts React
    ├── App.jsx           which page shows for which address
    ├── api.js            one place for all requests to the backend
    ├── styles.css        the design
    ├── components/       reusable pieces (Layout, buttons, cards...)
    └── pages/            one file per page
```

## Implementation plan

Each step is one structured prompt, then running and testing it before moving on.

1. **Starter project.** All three layers connected: the dashboard loads subjects from D1 through the API.
2. **Assignments backend.** List, add, update and delete endpoints, with validation.
3. **Assignments page.** The list with search, filter and sort, plus loading and error messages.
4. **Assignment form.** Add and edit, with helpful messages for empty or wrong fields.
5. **Completing work.** Check off and un-check, and award XP.
6. **Quest stats.** XP, level, streak and the progress bar on the dashboard, plus the clock.
7. **Subjects page.** Add and remove subjects.
8. **Achievements page.** Badges earned and locked.
9. **Design and phones.** Final look, and making every page work on a phone.
10. **Testing.** At least ten tests, automated tests for the backend, and TEST_REPORT.md.
11. **Deploy.** Create the real D1 database and publish to `workers.dev`.
