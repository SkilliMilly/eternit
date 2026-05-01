import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core"

export const mitarbeiter = sqliteTable("mitarbeiter", {
  id: text("id").primaryKey(),
  vorname: text("vorname").notNull(),
  nachname: text("nachname").notNull(),
  personalNr: text("personal_nr"),
  position: text("position").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
})

export type Mitarbeiter = typeof mitarbeiter.$inferSelect
export type NewMitarbeiter = typeof mitarbeiter.$inferInsert

export const abteilungen = sqliteTable("abteilungen", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
})

export type Abteilung = typeof abteilungen.$inferSelect
export type NewAbteilung = typeof abteilungen.$inferInsert

export const fehlercodes = sqliteTable("fehlercodes", {
  id: text("id").primaryKey(),
  code: text("code"),
  beschreibung: text("beschreibung").notNull(),
  departmentId: text("department_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
})

export type Fehlercode = typeof fehlercodes.$inferSelect
export type NewFehlercode = typeof fehlercodes.$inferInsert

export const csvAuftraege = sqliteTable("csv_auftraege", {
  id: text("id").primaryKey(),
  kundenAuftrag: text("kunden_auftrag").notNull(),
  artikelNr: text("artikel_nr").notNull(),
  farbe: text("farbe").notNull(),
  fauf: text("fauf").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex("unique_auftrag").on(table.kundenAuftrag, table.artikelNr, table.farbe, table.fauf),
])

export type CsvAuftrag = typeof csvAuftraege.$inferSelect
export type NewCsvAuftrag = typeof csvAuftraege.$inferInsert

export const materialien = sqliteTable("materialien", {
  id: text("id").primaryKey(),
  artikelNr: text("artikel_nr").notNull(),
  farbe: text("farbe").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => [
  uniqueIndex("unique_material").on(table.artikelNr, table.farbe),
])

export type Material = typeof materialien.$inferSelect
export type NewMaterial = typeof materialien.$inferInsert

export const faelle = sqliteTable("faelle", {
  id: text("id").primaryKey(),
  maschine: text("maschine").notNull(),
  fallTyp: text("fall_typ").notNull(),
  fauf: text("fauf"),
  kundenAuftrag: text("kunden_auftrag"),
  kommentar: text("kommentar"),
  mitarbeiterId: text("mitarbeiter_id").notNull(),
  verursacherId: text("verursacher_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
})

export type Fall = typeof faelle.$inferSelect
export type NewFall = typeof faelle.$inferInsert

export const fallPositionen = sqliteTable("fall_positionen", {
  id: text("id").primaryKey(),
  fallId: text("fall_id").notNull().references(() => faelle.id),
  materialId: text("material_id").notNull().references(() => materialien.id),
  stueckzahl: integer("stueckzahl").notNull(),
  fehlercodeId: text("fehlercode_id").references(() => fehlercodes.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
})

export type FallPosition = typeof fallPositionen.$inferSelect
export type NewFallPosition = typeof fallPositionen.$inferInsert
