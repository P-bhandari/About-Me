// One-time owner-requested curation; later dashboard edits remain authoritative.
export const portfolioCurationSql = [
  "UPDATE projects SET published = 0, featured = 0 WHERE LOWER(RTRIM(repo_url, '/')) IN ('https://github.com/p-bhandari/about-me', 'https://github.com/p-bhandari/intra-day-trading-algos', 'https://github.com/p-bhandari/legaltech', 'https://github.com/p-bhandari/programs', 'https://github.com/p-bhandari/android-mock-location') AND NOT EXISTS (SELECT 1 FROM site_content_migrations WHERE name = 'portfolio-curation-2026-09-14')",
  "UPDATE projects SET published = 1, featured = 1, sort_order = 3, summary = 'A MATLAB implementation of a self-taught machine learning algorithm using autoencoders to learn features.', tags = 'Machine learning, MATLAB, Autoencoders' WHERE LOWER(RTRIM(repo_url, '/')) = 'https://github.com/p-bhandari/self_taught_learning' AND NOT EXISTS (SELECT 1 FROM site_content_migrations WHERE name = 'portfolio-curation-2026-09-14')",
  "INSERT OR IGNORE INTO site_content_migrations (name) VALUES ('portfolio-curation-2026-09-14')"
];
