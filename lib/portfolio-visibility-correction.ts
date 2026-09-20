// One-time correction for the owner-requested public portfolio list.
export const portfolioVisibilityCorrectionSql = [
  "UPDATE projects SET published = 0, featured = 0 WHERE LOWER(RTRIM(repo_url, '/')) IN ('https://github.com/p-bhandari/intra-day-trading-algos', 'https://github.com/p-bhandari/android-mock-location') AND NOT EXISTS (SELECT 1 FROM site_content_migrations WHERE name = 'portfolio-visibility-correction-2026-09-20')",
  "UPDATE projects SET published = 1, featured = 0 WHERE LOWER(RTRIM(repo_url, '/')) = 'https://github.com/p-bhandari/legaltech' AND NOT EXISTS (SELECT 1 FROM site_content_migrations WHERE name = 'portfolio-visibility-correction-2026-09-20')",
  "INSERT OR IGNORE INTO site_content_migrations (name) VALUES ('portfolio-visibility-correction-2026-09-20')"
];
