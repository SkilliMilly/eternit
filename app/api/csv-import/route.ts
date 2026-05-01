import { NextResponse } from "next/server"
import { db } from "@/db"
import { csvAuftraege, materialien } from "@/db/schema"
import { eq, and } from "drizzle-orm"

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/)[0] || ""
  const semicolons = (firstLine.match(/;/g) || []).length
  const commas = (firstLine.match(/,/g) || []).length
  return semicolons > commas ? ";" : ","
}

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n")
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0)
  if (nonEmptyLines.length === 0) {
    return { headers: [], rows: [] }
  }

  const delimiter = detectDelimiter(text)
  const headers = parseCsvLine(nonEmptyLines[0], delimiter)
  const rows = nonEmptyLines.slice(1).map((line) => parseCsvLine(line, delimiter))
  return { headers, rows }
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function findColumnIndex(headers: string[], patterns: string[]): number {
  const lowerHeaders = headers.map((h) => h.toLowerCase().trim())
  for (const pattern of patterns) {
    const idx = lowerHeaders.findIndex((h) => h.includes(pattern.toLowerCase()))
    if (idx !== -1) return idx
  }
  return -1
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { csvText } = body

    if (!csvText || typeof csvText !== "string") {
      return NextResponse.json(
        { error: "CSV text is required" },
        { status: 400 }
      )
    }

    const { headers, rows } = parseCsv(csvText)
    if (headers.length === 0) {
      return NextResponse.json(
        { error: "CSV is empty or invalid" },
        { status: 400 }
      )
    }

    const kundenAuftragIdx = findColumnIndex(headers, ["kunden auftrag", "kundenauftrag", "auftrag"])
    const artikelNrIdx = findColumnIndex(headers, ["artikelnr", "artikel nr", "artikel-nr"])
    const farbeIdx = findColumnIndex(headers, ["farbe", "color"])
    const faufIdx = findColumnIndex(headers, ["fauf", "fertigungsauftrag"])

    const missingColumns: string[] = []
    if (kundenAuftragIdx === -1) missingColumns.push("Kunden Auftrag")
    if (artikelNrIdx === -1) missingColumns.push("Artikelnr.")
    if (farbeIdx === -1) missingColumns.push("Farbe")
    if (faufIdx === -1) missingColumns.push("FAUF")

    if (missingColumns.length > 0) {
      return NextResponse.json(
        { error: `Missing columns: ${missingColumns.join(", ")}` },
        { status: 400 }
      )
    }

    let neueFaelle = 0
    let neueMaterialien = 0

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (row.length < Math.max(kundenAuftragIdx, artikelNrIdx, farbeIdx, faufIdx) + 1) {
        continue
      }

      const kundenAuftrag = row[kundenAuftragIdx]?.trim()
      const artikelNr = row[artikelNrIdx]?.trim()
      const farbe = row[farbeIdx]?.trim()
      const fauf = row[faufIdx]?.trim()

      if (!kundenAuftrag || !artikelNr || !farbe || !fauf) {
        continue
      }

      try {
        const existing = await db
          .select()
          .from(csvAuftraege)
          .where(
            and(
              eq(csvAuftraege.kundenAuftrag, kundenAuftrag),
              eq(csvAuftraege.artikelNr, artikelNr),
              eq(csvAuftraege.farbe, farbe),
              eq(csvAuftraege.fauf, fauf)
            )
          )

        if (existing.length > 0) {
          continue
        }

        const existingMaterial = await db
          .select()
          .from(materialien)
          .where(
            and(
              eq(materialien.artikelNr, artikelNr),
              eq(materialien.farbe, farbe)
            )
          )

        if (existingMaterial.length === 0) {
          await db.insert(materialien).values({
            id: crypto.randomUUID(),
            artikelNr,
            farbe,
          })
          neueMaterialien++
        }

        await db.insert(csvAuftraege).values({
          id: crypto.randomUUID(),
          kundenAuftrag,
          artikelNr,
          farbe,
          fauf,
        })
        neueFaelle++
      } catch {
        // Skip rows with DB errors silently
      }
    }

    return NextResponse.json({ neueFaelle, neueMaterialien })
  } catch (error) {
    console.error("POST /api/csv-import error:", error)
    return NextResponse.json(
      { error: "Failed to process CSV import" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    await db.delete(csvAuftraege)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/csv-import error:", error)
    return NextResponse.json(
      { error: "Failed to clear CSV data" },
      { status: 500 }
    )
  }
}
