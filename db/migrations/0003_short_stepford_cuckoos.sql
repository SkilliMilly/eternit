CREATE TABLE `materialien` (
	`id` text PRIMARY KEY NOT NULL,
	`artikel_nr` text NOT NULL,
	`farbe` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_material` ON `materialien` (`artikel_nr`,`farbe`);