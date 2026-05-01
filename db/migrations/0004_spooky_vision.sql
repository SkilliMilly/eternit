PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_fehlercodes` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text,
	`beschreibung` text NOT NULL,
	`department_id` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_fehlercodes`("id", "code", "beschreibung", "department_id", "created_at", "updated_at") SELECT "id", "code", "beschreibung", "department_id", "created_at", "updated_at" FROM `fehlercodes`;--> statement-breakpoint
DROP TABLE `fehlercodes`;--> statement-breakpoint
ALTER TABLE `__new_fehlercodes` RENAME TO `fehlercodes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;