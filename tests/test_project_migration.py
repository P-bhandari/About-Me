"""Regression checks for visibility preservation and one-time catalog import."""
import json
import sqlite3
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = (ROOT / 'lib/project-migration.ts').read_text()
STATEMENTS = json.loads(SOURCE.split(' = ', 1)[1].strip().removesuffix(';'))

class ProjectMigrationTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(':memory:')
        self.db.row_factory = sqlite3.Row
        self.db.executescript((ROOT / 'drizzle/0000_abnormal_hairball.sql').read_text())

    def seed(self, title, repo, featured=1, live=None):
        self.db.execute('INSERT INTO projects (title, summary, tags, repo_url, live_url, image_key, featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (title, 'Owner-written summary', 'Custom tags', repo, live, 'owner/preview.png', featured))
        self.db.commit()

    def upgrade(self):
        self.db.executescript((ROOT / 'drizzle/0001_overrated_cannonball.sql').read_text())
        self.apply_catalog()

    def apply_catalog(self):
        with self.db:
            for statement in STATEMENTS:
                self.db.execute(statement)

    def test_fresh_catalog_has_three_featured_and_nine_other_projects(self):
        self.upgrade()
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM projects').fetchone()[0], 12)
        names = [r[0] for r in self.db.execute('SELECT title FROM projects WHERE featured = 1 ORDER BY sort_order')]
        self.assertEqual(names, ['Nutrition Scanner', 'Date Night', 'Personal Atlas'])
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM projects WHERE archived = 1').fetchone()[0], 3)
        self.assertIsNone(self.db.execute("SELECT live_url FROM projects WHERE title = 'Date Night'").fetchone()[0])

    def test_upgrade_preserves_hidden_records_and_owner_copy(self):
        self.seed('Nutrition Scanner', 'https://github.com/P-bhandari/ingredient-scanner', featured=0)
        self.seed('OpenCV Tutorials', 'https://github.com/P-bhandari/Opencv-Tutorials', featured=0)
        self.seed('Date Night', 'https://github.com/P-bhandari/nearby-events', live='https://example.com/custom-demo')
        self.upgrade()
        row = self.db.execute("SELECT * FROM projects WHERE title = 'Nutrition Scanner'").fetchone()
        self.assertEqual(row['published'], 0)
        self.assertEqual(row['summary'], 'Owner-written summary')
        self.assertEqual(row['image_key'], 'owner/preview.png')
        self.assertEqual(self.db.execute("SELECT live_url FROM projects WHERE title = 'Date Night'").fetchone()[0], 'https://example.com/custom-demo')
        self.assertEqual(self.db.execute("SELECT published FROM projects WHERE title = 'OpenCV Tutorials'").fetchone()[0], 0)

    def test_restarts_do_not_restore_deleted_projects_or_overwrite_edits(self):
        self.upgrade()
        self.db.execute("UPDATE projects SET title='My revised app', summary='Edited after migration', live_url='https://example.com/new', featured=0, published=0, archived=1 WHERE title='Date Night'")
        self.db.execute("DELETE FROM projects WHERE title='Stereo Matching'")
        self.db.commit()
        before = list(map(tuple, self.db.execute('SELECT * FROM projects ORDER BY id')))
        self.apply_catalog()
        self.apply_catalog()
        self.assertEqual(before, list(map(tuple, self.db.execute('SELECT * FROM projects ORDER BY id'))))

    def test_failure_rolls_back_whole_catalog(self):
        self.db.executescript((ROOT / 'drizzle/0001_overrated_cannonball.sql').read_text())
        with self.assertRaises(sqlite3.OperationalError):
            with self.db:
                for sql in STATEMENTS[:5]:
                    self.db.execute(sql)
                self.db.execute('INSERT INTO nonexistent_table VALUES (1)')
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM projects').fetchone()[0], 0)
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM site_content_migrations').fetchone()[0], 0)
        self.apply_catalog()
        self.assertEqual(self.db.execute('SELECT COUNT(*) FROM projects').fetchone()[0], 12)

if __name__ == '__main__':
    unittest.main()
