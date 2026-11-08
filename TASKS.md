# StudyQuest build checklist

Each step starts with a structured prompt (saved in PROMPTS.md), then running and testing it.

## Planning
- [x] PROJECT.md: name, purpose, users, five features, how someone uses it
- [x] ARCHITECTURE.md, AGENTS.md and TASKS.md
- [ ] Fix the writing in PROJECT.md (before submitting)

## 1. Starter project
- [x] React + Vite frontend, Cloudflare Worker backend, D1 database
- [x] Three related tables: subjects, assignments, completions
- [x] Sample data (made up)
- [x] `GET /api/health` and `GET /api/subjects`
- [x] Navigation menu and five page addresses
- [x] Loading indicator and error message component

## 2. Assignments backend
- [x] `GET /api/assignments` with search, subject filter, status filter and sorting
- [x] `GET /api/assignments/:id`
- [x] `POST /api/assignments` with validation
- [x] `PUT /api/assignments/:id` with validation
- [x] `DELETE /api/assignments/:id`
- [x] Automated API checks: `npm run test:api` (22 checks)

## 3. Assignments page
- [x] List of assignments showing subject, due date and difficulty
- [x] Search box (waits until you stop typing)
- [x] Filter by subject and by to do or done
- [x] Sort by due date, newest or hardest
- [x] Filters stay after refreshing (they're kept in the address)
- [x] Loading, error and "nothing matches" messages
- [x] Reusable AssignmentRow component

## 4. Assignment form
- [x] Add assignment page (due date starts as tomorrow)
- [x] Edit assignment page (same form, filled in)
- [x] Messages next to empty or wrong fields, and the backend's message if it rejects something
- [x] Delete button with "are you sure?" (no pop-up window)
- [x] "Assignment added", "Changes saved" and "Assignment deleted" messages
- [x] Shows how much XP each difficulty is worth

## 5. Completing work
- [ ] `POST` and `DELETE /api/assignments/:id/complete`
- [ ] Check-off button on assignments
- [ ] Award XP (easy 10, medium 20, hard 30)

## 6. Quest stats on the dashboard
- [ ] `GET /api/stats`: XP, level, streak, today's progress
- [ ] Progress bar for work due today and tomorrow
- [ ] XP, level and streak display
- [ ] What's due soon and what's overdue
- [ ] Screen-time clock

## 7. Subjects page
- [ ] `POST` and `DELETE /api/subjects`
- [ ] Add a subject with a color
- [ ] Remove a subject (warn that its assignments go too)

## 8. Achievements page
- [ ] Badge rules (first assignment, 5 done, 3-day streak, finished early...)
- [ ] Earned and locked badges
- [ ] Level and total XP

## 9. Design and phones
- [ ] Final look
- [ ] Every page works on a phone
- [ ] Bonus: dark mode

## 10. Testing
- [ ] At least ten tests by hand
- [ ] Automated tests for the backend (started in step 2: `npm run test:api`)
- [ ] TEST_REPORT.md

## 11. Deploy (with a parent for the Cloudflare account)
- [ ] Create the real D1 database and run the migrations on it
- [ ] Publish to workers.dev
- [ ] Someone else tests the live site

## Final submission
- [ ] Live URL
- [ ] GitHub repository
- [ ] Prompt log with at least ten structured prompts
- [ ] Five-minute demo

## 5. Completing work
- [x] `POST /api/assignments/:id/complete` awards 10, 20 or 30 XP (the server decides)
- [x] `DELETE /api/assignments/:id/complete` un-checks and takes the XP back
- [x] Checking off twice is refused, so XP can't be double counted
- [x] Round check button on every assignment, with "+20 XP" message and level-up message
- [x] Automated checks for completing and undoing (`npm run test:api`)
