CREATE TABLE `abteilungen` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `fehlercodes` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`beschreibung` text NOT NULL,
	`department_id` text,
	`created_at` integer,
	`updated_at` integer
);
