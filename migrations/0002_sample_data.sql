-- Made-up sample data for testing. No real students' information.
-- Due dates are relative to the day this runs, so there's always something due soon.

INSERT INTO subjects (name, color) VALUES
  ('Math',    '#7c8cff'),
  ('Science', '#3ccf91'),
  ('English', '#ff9f5a'),
  ('History', '#e06cff'),
  ('Spanish', '#ffd23f');

INSERT INTO assignments (subject_id, title, notes, due_date, difficulty) VALUES
  (1, 'Fractions worksheet, page 42',  'Problems 1–20, show your work', date('now', '+1 day'), 2),
  (2, 'Read chapter 5: Ecosystems',    '',                              date('now', '+1 day'), 1),
  (3, 'Book report outline',           'The Giver',                     date('now', '+3 days'), 3),
  (4, 'Map of the 13 colonies',        'Color each region differently', date('now', '+2 days'), 2),
  (5, 'Vocabulary quiz practice',      'Unit 3 words',                  date('now'),            1),
  (1, 'Unit 2 test review',            '',                              date('now', '-2 days'), 3),
  (2, 'Lab safety quiz',               '',                              date('now', '-1 day'),  1);

-- Two finished assignments, so XP and the streak have something to show.
INSERT INTO completions (assignment_id, completed_at, xp_earned) VALUES
  (6, datetime('now', '-2 days'), 30),
  (7, datetime('now', '-1 day'),  10);
