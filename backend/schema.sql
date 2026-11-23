CREATE TABLE IF NOT EXISTS reports (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  type ENUM('hilang', 'temuan') NOT NULL,
  category VARCHAR(50) NOT NULL,
  location VARCHAR(100) NOT NULL,
  occurred_at DATE NOT NULL,
  status ENUM('pending', 'verified') NOT NULL DEFAULT 'pending',
  dropoff ENUM('pos-satpam') DEFAULT NULL,
  INDEX idx_reports_date (occurred_at, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS report_photos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  report_id INT UNSIGNED NOT NULL,
  storage_key CHAR(40) NOT NULL UNIQUE,
  byte_size INT UNSIGNED NOT NULL,
  CONSTRAINT fk_report_photos_report FOREIGN KEY (report_id) REFERENCES reports (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
