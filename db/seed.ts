import { db } from "./index"
import { abteilungen, fehlercodes } from "./schema"
import { eq, and } from "drizzle-orm"
import crypto from "crypto"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function hashId(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 16)
}

const rawData: { department: string; code: string | null; description: string }[] = [
  { department: "PV Bearbeitung", code: "661", description: "Verschnitt" },
  { department: "PV Bearbeitung", code: "662", description: "Verbohrt / Verfräst" },
  { department: "PV Bearbeitung", code: "663", description: "AVOR / Programmfehler" },
  { department: "PV Bearbeitung", code: "664", description: "Lifterbeschädigung" },
  { department: "PV Bearbeitung", code: "665", description: "Anlagentechnisch" },
  { department: "PM2 (Rohplatten)", code: "201", description: "Blechknick" },
  { department: "PM2 (Rohplatten)", code: "202", description: "Blechbeulen" },
  { department: "PM2 (Rohplatten)", code: "203", description: "Einschluss" },
  { department: "PM2 (Rohplatten)", code: "204", description: "Fremdkörper" },
  { department: "PM2 (Rohplatten)", code: "205", description: "Wasserflecken" },
  { department: "PM2 (Rohplatten)", code: "206", description: "Ölflecken / Fettflecken" },
  { department: "PM2 (Rohplatten)", code: "207", description: "Flecken" },
  { department: "PM2 (Rohplatten)", code: "208", description: "Fehlerhafte Kerben" },
  { department: "PM2 (Rohplatten)", code: "209", description: "Überlappung Lage" },
  { department: "PM2 (Rohplatten)", code: "210", description: "Überlappung Platten" },
  { department: "PM2 (Rohplatten)", code: "211", description: "Fehlende / unvollständige Löcher" },
  { department: "PM2 (Rohplatten)", code: "212", description: "Stanzschnitt" },
  { department: "PM2 (Rohplatten)", code: "213", description: "Verpressung" },
  { department: "PM2 (Rohplatten)", code: "214", description: "Schlechtes stapeln" },
  { department: "PM2 (Rohplatten)", code: "215", description: "Rost" },
  { department: "PM2 (Rohplatten)", code: "216", description: "Plattenrisse" },
  { department: "PM2 (Rohplatten)", code: "217", description: "Bildrahmen" },
  { department: "PM2 (Rohplatten)", code: "218", description: "Verschmutzung / Verunreinigung" },
  { department: "PM2 (Rohplatten)", code: "219", description: "Beschädigte Platten" },
  { department: "PM2 (Rohplatten)", code: "220", description: "Vliessqualität" },
  { department: "PM2 (Rohplatten)", code: "221", description: "Falsche Position stanzen" },
  { department: "PM2 (Rohplatten)", code: "222", description: "Abdruck Lochblech/Saugertuch" },
  { department: "PM2 (Rohplatten)", code: "224", description: "Zu dünn" },
  { department: "PM2 (Rohplatten)", code: "225", description: "Zu dick" },
  { department: "PM2 (Rohplatten)", code: "226", description: "Blechzentrierung" },
  { department: "PM2 (Rohplatten)", code: "299", description: "Diverses / unbestimmt" },
  { department: "BAFS / TA08", code: "321", description: "GP / Beulen hoch/tief" },
  { department: "BAFS / TA08", code: "322", description: "GP / Fasernest / Mädli" },
  { department: "BAFS / TA08", code: "323", description: "Einschluss / Flecken / Rost" },
  { department: "BAFS / TA08", code: "324", description: "Grundierung" },
  { department: "BAFS / TA08", code: "325", description: "Giesstreifen" },
  { department: "BAFS / TA08", code: "326", description: "Spritzfehler SK1" },
  { department: "BAFS / TA08", code: "327", description: "Farbqualität / Luft / Fischaugen" },
  { department: "BAFS / TA08", code: "328", description: "Manipulationsfehler MA" },
  { department: "BAFS / TA08", code: "329", description: "Fehlerfunktion der Anlage" },
  { department: "BAFS / TA08", code: "330", description: "Ausschuss wegen TA08" },
  { department: "BAFS / TA08", code: "331", description: "Ausschuss wegen Sek 5" },
  { department: "BAFS / TA08", code: "332", description: "Farbe Manipulation MA" },
  { department: "BAFS / TA08", code: "333", description: "Ausschuss wegen FA" },
  { department: "BAFS / TA08", code: "334", description: "Risse TA08" },
  { department: "BAFS / TA08", code: "371", description: "Grundplatte hell" },
  { department: "BAFS / TA08", code: "372", description: "Grundplatte dunkel" },
  { department: "BAFS / TA08", code: "373", description: "Saugerabdrücke" },
  { department: "BAFS / TA08", code: "374", description: "Blechkleber" },
  { department: "BAFS / TA08", code: "377", description: "Blechdruck längs / quer" },
  { department: "BAFS / TA08", code: "380", description: "Wasserflecken" },
  { department: "BAFS / TA08", code: "382", description: "Steifen längs / quer" },
  { department: "BAFS / TA08", code: "383", description: "Risse" },
  { department: "BAFS / TA08", code: "399", description: "Diverse" },
  { department: "BAFS / TA08", code: "400", description: "Probe" },
  { department: "Logistik", code: "791", description: "Lagerbruch" },
  { department: "Logistik", code: "792", description: "Staplerbeschädigung Logistik" },
  { department: "Logistik", code: "793", description: "Staplerbeschädigung Produktion" },
  { department: "Logistik", code: "794", description: "Fehllagerung" },
  { department: "Logistik", code: "795", description: "Handling Logistik" },
  { department: "Stutzerei", code: "550", description: "Gratismengen" },
  { department: "Stutzerei", code: "551", description: "PP Blechfehler / Beulen" },
  { department: "Stutzerei", code: "552", description: "PP Fasernester" },
  { department: "Stutzerei", code: "553", description: "PP Einschlüsse / Fremdkörper" },
  { department: "Stutzerei", code: "554", description: "PP Flecken / Verschmutzung" },
  { department: "Stutzerei", code: "555", description: "PP Streifen" },
  { department: "Stutzerei", code: "556", description: "COA Beschichtungsstreifen" },
  { department: "Stutzerei", code: "557", description: "COA Nadelstiche" },
  { department: "Stutzerei", code: "558", description: "COA Verblockung" },
  { department: "Stutzerei", code: "559", description: "Stanzkantenfehler" },
  { department: "Stutzerei", code: "560", description: "Einpressungen" },
  { department: "Stutzerei", code: "561", description: "COA Kratzer" },
  { department: "Stutzerei", code: "562", description: "Verschmutzung" },
  { department: "Stutzerei", code: "563", description: "Fehler der Anlage" },
  { department: "Stutzerei", code: "564", description: "COA Folienabdruck" },
  { department: "Stutzerei", code: "565", description: "COA R.S.Beschriftung (Tinte)" },
  { department: "Stutzerei", code: "566", description: "COA ohne Farbe (übersch.etc)" },
  { department: "Stutzerei", code: "567", description: "COA Andersfarbige Punkte" },
  { department: "Stutzerei", code: "568", description: "PP Bilderrahmeneffekt" },
  { department: "Stutzerei", code: "569", description: "Plattenrisse" },
  { department: "Stutzerei", code: "570", description: "COA Saugerabdrücke" },
  { department: "Stutzerei", code: "571", description: "COA Fischaugen" },
  { department: "Stutzerei", code: "572", description: "Stanzkantenfehler - Erhebung" },
  { department: "Stutzerei", code: "573", description: "Aufstehende Stanzkante" },
  { department: "Stutzerei", code: "574", description: "COA Lufteinschluss Spritzen" },
  { department: "Stutzerei", code: "575", description: "COA Lufteinschluss Giessen" },
  { department: "Stutzerei", code: "599", description: "Diverses / unbestimmt" },
  { department: "Stutzerei", code: "400", description: "Proben" },
  { department: "Brandschutz", code: null, description: "Risse" },
  { department: "Brandschutz", code: null, description: "Zementflecken" },
  { department: "Brandschutz", code: null, description: "Verfärbung in Oberfläche" },
  { department: "Brandschutz", code: null, description: "Kantenbeschädigung" },
  { department: "Brandschutz", code: null, description: "Kratzer" },
  { department: "Brandschutz", code: null, description: "Fingerabdrücke" },
  { department: "Brandschutz", code: null, description: "Flecken" },
  { department: "Brandschutz", code: null, description: "Markierungen" },
  { department: "Brandschutz", code: null, description: "Platten krumm" },
  { department: "Brandschutz", code: null, description: "Verschmutzung" },
  { department: "Brandschutz", code: null, description: "Saugerabdrücke" },
  { department: "Brandschutz", code: null, description: "Pical, Sasmo: Oberfläche weist Schwellen" },
  { department: "Brandschutz", code: null, description: "Pical, Sasmo: Blasenbildung im Belag" },
  { department: "Brandschutz", code: null, description: "Pical, Sasmo: Vertiefungen im Belag" },
  { department: "Brandschutz", code: null, description: "Pical, Sasmo: Ablösen des Belags" },
  { department: "Brandschutz", code: null, description: "Allgemein / Diveses" },
  { department: "Ondapress", code: null, description: "Blechfehler" },
  { department: "Ondapress", code: null, description: "Kratzer" },
  { department: "Ondapress", code: null, description: "Ausgerissene Oberfläche" },
  { department: "Ondapress", code: null, description: "Fremdkörper in der Rohplatte (Einschluss)" },
  { department: "Ondapress", code: null, description: "Fremdkörper auf der Oberfläche" },
  { department: "Ondapress", code: null, description: "Delamination" },
  { department: "Ondapress", code: null, description: "Ausblühung (Effloreszenz)" },
  { department: "Ondapress", code: null, description: "Beschichtungsfehler" },
  { department: "Ondapress", code: null, description: "Glanzstellen" },
  { department: "Ondapress", code: null, description: "Verschmutzung" },
  { department: "Ondapress", code: null, description: "Wasserflecken" },
  { department: "Ondapress", code: null, description: "Fett-/Ölflecken" },
  { department: "Ondapress", code: null, description: "Risse" },
  { department: "Ondapress", code: null, description: "Beschädigungen" },
  { department: "Ondapress", code: null, description: "Allgemein / Diveses" },
]

async function seed() {
  console.log("🌱 Starte Seeding...")

  // 1. Eindeutige Abteilungen sammeln
  const uniqueDepartments = Array.from(new Set(rawData.map((d) => d.department)))

  const departmentMap = new Map<string, string>()

  for (const deptName of uniqueDepartments) {
    const existing = await db
      .select()
      .from(abteilungen)
      .where(eq(abteilungen.name, deptName))
      .limit(1)

    if (existing.length > 0) {
      departmentMap.set(deptName, existing[0].id)
      console.log(`  ⏭️  Abteilung existiert bereits: ${deptName}`)
    } else {
      const id = hashId(`dept-${deptName}`)
      await db.insert(abteilungen).values({ id, name: deptName })
      departmentMap.set(deptName, id)
      console.log(`  ✅ Abteilung angelegt: ${deptName}`)
    }
  }

  // 2. Fehlercodes anlegen
  for (const item of rawData) {
    const deptId = departmentMap.get(item.department)
    if (!deptId) {
      console.warn(`  ⚠️  Abteilung nicht gefunden: ${item.department}`)
      continue
    }

    const existing = await db
      .select()
      .from(fehlercodes)
      .where(
        and(
          eq(fehlercodes.beschreibung, item.description),
          eq(fehlercodes.departmentId, deptId)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      console.log(`  ⏭️  Fehlercode existiert bereits: ${item.department} | ${item.code ?? "(ohne Code)"} | ${item.description}`)
      continue
    }

    const id = hashId(`fc-${item.department}-${item.code ?? "no-code"}-${item.description}`)

    await db.insert(fehlercodes).values({
      id,
      code: item.code,
      beschreibung: item.description,
      departmentId: deptId,
    })

    console.log(`  ✅ Fehlercode angelegt: ${item.department} | ${item.code ?? "(ohne Code)"} | ${item.description}`)
  }

  console.log("🌱 Seeding abgeschlossen.")
  process.exit(0)
}

seed().catch((err) => {
  console.error("❌ Seeding fehlgeschlagen:", err)
  process.exit(1)
})
