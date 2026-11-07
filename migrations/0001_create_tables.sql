-- Creates StudyQuest's three tables.
-- Migrations run once each, in order, so the database is built the same way on every computer.

-- Subjects, like Math or Science.
CREATE TABLE subjects (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL UNIQUE,
  color      TEXT    NOT NULL DEFAULT '#7c8cff',
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Homework. Each assignment belongs to one subject.
-- If a subject is deleted, its assignments are deleted too (ON DELETE CASCADE).
CREATE TABLE assignments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title      TEXT    NOT NULL,
  notes      TEXT    NOT NULL DEFAULT '',
  due_date   TEXT    NOT NULL,                                    -- like 2026-11-05
  difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Finished work. One row per completed assignment (UNIQUE stops double-counting XP).
CREATE TABLE completions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment_id INTEGER NOT NULL UNIQUE REFERENCES assignments(id) ON DELETE CASCADE,
  completed_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  xp_earned     INTEGER NOT NULL
);

-- Indexes make the most common searches fast.
CREATE INDEX idx_assignments_due     ON assignments(due_date);
CREATE INDEX idx_assignments_subject ON assignments(subject_id);
