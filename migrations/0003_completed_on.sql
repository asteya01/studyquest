-- Streaks count calendar days, and completed_at is saved in UTC, which is 8 hours ahead of
-- California. A homework check-off at 9 PM would land on "tomorrow". So each completion now
-- also saves the student's own local date, sent by the browser (see AGENTS.md).
ALTER TABLE completions ADD COLUMN completed_on TEXT;

-- Fill it in for completions that already exist (the UTC date is the best we have for those).
UPDATE completions SET completed_on = date(completed_at);

CREATE INDEX idx_completions_day ON completions (completed_on);
