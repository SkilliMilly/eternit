CREATE TABLE `mitarbeiter` (
	`id` text PRIMARY KEY NOT NULL,
	`vorname` text NOT NULL,
	`nachname` text NOT NULL,
	`personal_nr` text,
	`position` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
