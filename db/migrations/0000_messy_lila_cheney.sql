CREATE TABLE "abteilungen" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "csv_auftraege" (
	"id" text PRIMARY KEY NOT NULL,
	"kunden_auftrag" text NOT NULL,
	"artikel_nr" text NOT NULL,
	"farbe" text NOT NULL,
	"fauf" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faelle" (
	"id" text PRIMARY KEY NOT NULL,
	"maschine" text NOT NULL,
	"fall_typ" text NOT NULL,
	"fauf" text,
	"kunden_auftrag" text,
	"kommentar" text,
	"mitarbeiter_id" text NOT NULL,
	"verursacher_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fall_positionen" (
	"id" text PRIMARY KEY NOT NULL,
	"fall_id" text NOT NULL,
	"material_id" text NOT NULL,
	"stueckzahl" integer NOT NULL,
	"fehlercode_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fehlercodes" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text,
	"beschreibung" text NOT NULL,
	"department_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "materialien" (
	"id" text PRIMARY KEY NOT NULL,
	"artikel_nr" text NOT NULL,
	"farbe" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mitarbeiter" (
	"id" text PRIMARY KEY NOT NULL,
	"vorname" text NOT NULL,
	"nachname" text NOT NULL,
	"personal_nr" text,
	"position" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fall_positionen" ADD CONSTRAINT "fall_positionen_fall_id_faelle_id_fk" FOREIGN KEY ("fall_id") REFERENCES "public"."faelle"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fall_positionen" ADD CONSTRAINT "fall_positionen_material_id_materialien_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materialien"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fall_positionen" ADD CONSTRAINT "fall_positionen_fehlercode_id_fehlercodes_id_fk" FOREIGN KEY ("fehlercode_id") REFERENCES "public"."fehlercodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_auftrag" ON "csv_auftraege" USING btree ("kunden_auftrag","artikel_nr","farbe","fauf");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_material" ON "materialien" USING btree ("artikel_nr","farbe");