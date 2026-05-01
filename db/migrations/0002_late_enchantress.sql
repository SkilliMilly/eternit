CREATE TABLE `csv_auftraege` (
	`id` text PRIMARY KEY NOT NULL,
	`kunden_auftrag` text NOT NULL,
	`artikel_nr` text NOT NULL,
	`farbe` text NOT NULL,
	`fauf` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_auftrag` ON `csv_auftraege` (`kunden_auftrag`,`artikel_nr`,`farbe`,`fauf`);