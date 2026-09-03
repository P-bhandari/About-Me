CREATE TABLE `lift_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`exercise` text NOT NULL,
	`weight_lb` real,
	`sets` integer NOT NULL,
	`reps` integer NOT NULL,
	`notes` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_lift_entries_exercise_date` ON `lift_entries` (`exercise`,`date`);--> statement-breakpoint
CREATE INDEX `idx_lift_entries_date` ON `lift_entries` (`date`);--> statement-breakpoint
CREATE TABLE `places` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`city` text NOT NULL,
	`country` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`year` integer,
	`note` text,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`tagline` text NOT NULL,
	`short_bio` text NOT NULL,
	`long_bio` text NOT NULL,
	`location` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`github_url` text NOT NULL,
	`scholar_url` text NOT NULL,
	`linkedin_url` text,
	`profile_image_key` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`tags` text NOT NULL,
	`repo_url` text,
	`live_url` text,
	`image_key` text,
	`featured` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `publications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`authors` text NOT NULL,
	`venue` text NOT NULL,
	`year` integer NOT NULL,
	`summary` text NOT NULL,
	`url` text NOT NULL,
	`image_key` text,
	`sort_order` integer DEFAULT 0 NOT NULL
);
