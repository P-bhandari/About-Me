CREATE TABLE `site_content_migrations` (
	`name` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE `projects` ADD `published` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `archived` integer DEFAULT false NOT NULL;
--> statement-breakpoint
UPDATE projects SET published = featured;
