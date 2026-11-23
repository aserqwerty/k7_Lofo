-- For the original reports table only. Run once, then import backend/schema.sql.
-- Existing reports also become pending; prior versions did not verify reports.
ALTER TABLE reports
  ADD COLUMN status ENUM('pending', 'verified') NOT NULL DEFAULT 'pending',
  ADD COLUMN dropoff ENUM('pos-satpam') DEFAULT NULL;
