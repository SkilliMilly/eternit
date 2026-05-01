CREATE TABLE `faelle` (
	`id` text PRIMARY KEY NOT NULL,
	`maschine` text NOT NULL,
	`fall_typ` text NOT NULL,
	`fauf` text,
	`kunden_auftrag` text,
	`kommentar` text,
	`mitarbeiter_id` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `fall_positionen` (
	`id` text PRIMARY KEY NOT NULL,
	`fall_id` text NOT NULL,
	`material_id` text NOT NULL,
	`stueckzahl` integer NOT NULL,
	`fehlercode_id` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`fall_id`) REFERENCES `faelle`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`material_id`) REFERENCES `materialien`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fehlercode_id`) REFERENCES `fehlercodes`(`id`) ON UPDATE no action ON DELETE no action
);
