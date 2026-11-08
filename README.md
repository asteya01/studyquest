# StudyQuest

A homework planner that turns schoolwork into a game. Built with React, Cloudflare Workers and Cloudflare D1.

## Run it on your computer

```bash
npm install          # first time only: downloads the project's tools
npm run db:setup     # first time only: creates the local database with sample data
npm run dev          # starts StudyQuest at http://localhost:5173
```

Press Ctrl + C to stop it.

## Test the API

With `npm run dev` running, open a second Terminal tab and run:

```bash
npm run test:api
```

The game rules and date helpers can be tested without the app running:

```bash
npm test
```

`npm test` runs `npm run test:rules` and `npm run test:dates`. Everything that was tested, and
what was found, is in [TEST_REPORT.md](TEST_REPORT.md).

## Start the database over

```bash
rm -rf .wrangler
npm run db:setup
```

See ARCHITECTURE.md for how it works and TASKS.md for what's left to build.
