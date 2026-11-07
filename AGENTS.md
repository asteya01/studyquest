# Instructions for my AI coding agent

These rules apply to every change in StudyQuest. Read ARCHITECTURE.md and TASKS.md before starting.

## How to work with me
- I'm an 8th-grade student. Explain what you did and why in simple language, and define technical terms.
- Build **one feature at a time**, the one my prompt asks for. Don't build ahead.
- Before writing a big change, tell me your plan in a few sentences.
- When something breaks, help me find the cause instead of rewriting everything.
- After each change, tell me exactly how to run and test it myself.

## The stack (don't change it without asking)
- Frontend: React + Vite, in `src/`. One file per page in `src/pages/`, reusable pieces in `src/components/`.
- Backend: one Cloudflare Worker, in `worker/index.js`. Every endpoint starts with `/api/`.
- Database: Cloudflare D1. Change tables only with a **new** numbered file in `migrations/`.
  Never edit a migration that has already run.
- Only free hosting. Never turn on a paid Cloudflare feature.

## Code rules
- All requests from the frontend go through `src/api.js`.
- The backend checks (validates) every request before saving, and replies with
  `{ "error": "a message a person can understand" }` when something is wrong.
- Every page that loads data shows a loading indicator and a helpful error message.
- Use `?` placeholders in SQL (`prepare("... WHERE id = ?").bind(id)`), never paste user input into SQL.
- "Today" always comes from the browser's date, never the server's clock (the server uses UTC).
- Comments explain *why*, in plain language.
- Pages must work on phones and computers, and with only a keyboard.

## Data and secrets
- Use made-up sample data only. Never real students' names or information.
- Never put passwords, API keys or tokens in the code or in Git.

## Before saying a feature is done
- Run it and check the feature works, including what happens with empty or wrong input.
- Update TASKS.md to check off what's finished.
