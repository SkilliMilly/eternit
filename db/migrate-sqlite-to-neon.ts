import { DatabaseSync } from "node:sqlite"
import { neon } from "@neondatabase/serverless"

const sqlite = new DatabaseSync("./sqlite.db", { readOnly: true })
const sql = neon(process.env.DATABASE_URL!)

function toDate(val: number | null | undefined): Date | null {
  if (val == null) return null
  return new Date(val * 1000)
}

async function migrate() {
  console.log("🚀 Starte SQLite → Neon Datenmigration...\n")

  // 1. mitarbeiter
  const rows = sqlite.prepare("SELECT * FROM mitarbeiter").all() as Record<string, unknown>[]
  let count = 0
  for (const row of rows) {
    await sql`
      INSERT INTO mitarbeiter (id, vorname, nachname, personal_nr, position, created_at, updated_at)
      VALUES (${row.id as string}, ${row.vorname as string}, ${row.nachname as string},
              ${(row.personal_nr as string) ?? null}, ${row.position as string},
              ${toDate(row.created_at as number)}, ${toDate(row.updated_at as number)})
      ON CONFLICT (id) DO NOTHING`
    count++
  }
  console.log(`  ✅ mitarbeiter: ${count} eingefügt`)

  // 2. materialien
  const matRows = sqlite.prepare("SELECT * FROM materialien").all() as Record<string, unknown>[]
  count = 0
  for (const row of matRows) {
    await sql`
      INSERT INTO materialien (id, artikel_nr, farbe, created_at, updated_at)
      VALUES (${row.id as string}, ${row.artikel_nr as string}, ${row.farbe as string},
              ${toDate(row.created_at as number)}, ${toDate(row.updated_at as number)})
      ON CONFLICT (id) DO NOTHING`
    count++
  }
  console.log(`  ✅ materialien: ${count} eingefügt`)

  // 3. csv_auftraege
  const csvRows = sqlite.prepare("SELECT * FROM csv_auftraege").all() as Record<string, unknown>[]
  count = 0
  for (const row of csvRows) {
    await sql`
      INSERT INTO csv_auftraege (id, kunden_auftrag, artikel_nr, farbe, fauf, created_at, updated_at)
      VALUES (${row.id as string}, ${row.kunden_auftrag as string}, ${row.artikel_nr as string},
              ${row.farbe as string}, ${row.fauf as string},
              ${toDate(row.created_at as number)}, ${toDate(row.updated_at as number)})
      ON CONFLICT (id) DO NOTHING`
    count++
  }
  console.log(`  ✅ csv_auftraege: ${count} eingefügt`)

  // 4. faelle
  const faelleRows = sqlite.prepare("SELECT * FROM faelle").all() as Record<string, unknown>[]
  count = 0
  for (const row of faelleRows) {
    await sql`
      INSERT INTO faelle (id, maschine, fall_typ, fauf, kunden_auftrag, kommentar, mitarbeiter_id, verursacher_id, created_at, updated_at)
      VALUES (${row.id as string}, ${row.maschine as string}, ${row.fall_typ as string},
              ${(row.fauf as string) ?? null}, ${(row.kunden_auftrag as string) ?? null},
              ${(row.kommentar as string) ?? null}, ${row.mitarbeiter_id as string},
              ${(row.verursacher_id as string) ?? null},
              ${toDate(row.created_at as number)}, ${toDate(row.updated_at as number)})
      ON CONFLICT (id) DO NOTHING`
    count++
  }
  console.log(`  ✅ faelle: ${count} eingefügt`)

  // 5. fall_positionen
  const posRows = sqlite.prepare("SELECT * FROM fall_positionen").all() as Record<string, unknown>[]
  count = 0
  for (const row of posRows) {
    await sql`
      INSERT INTO fall_positionen (id, fall_id, material_id, stueckzahl, fehlercode_id, created_at, updated_at)
      VALUES (${row.id as string}, ${row.fall_id as string}, ${row.material_id as string},
              ${row.stueckzahl as number}, ${(row.fehlercode_id as string) ?? null},
              ${toDate(row.created_at as number)}, ${toDate(row.updated_at as number)})
      ON CONFLICT (id) DO NOTHING`
    count++
  }
  console.log(`  ✅ fall_positionen: ${count} eingefügt`)

  console.log("\n🎉 Migration abgeschlossen.")
  sqlite.close()
  process.exit(0)
}

migrate().catch((err) => {
  console.error("❌ Migration fehlgeschlagen:", err)
  sqlite.close()
  process.exit(1)
})
