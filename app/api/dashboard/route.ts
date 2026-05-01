import { NextResponse } from "next/server"
import { db } from "@/db"
import { faelle, fallPositionen, fehlercodes, abteilungen, mitarbeiter, materialien } from "@/db/schema"
import { eq } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

function getKW(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

type ChartDataPoint = { kw: string; stueckzahl: number }

export async function GET() {
  try {
    const verursacher = alias(mitarbeiter, "verursacher")
    const results = await db
      .select({
        fallId: faelle.id,
        createdAt: faelle.createdAt,
        stueckzahl: fallPositionen.stueckzahl,
        abteilungName: abteilungen.name,
        fauf: faelle.fauf,
        kundenAuftrag: faelle.kundenAuftrag,
        artikelNr: materialien.artikelNr,
        farbe: materialien.farbe,
        fehlercodeId: fehlercodes.id,
        code: fehlercodes.code,
        beschreibung: fehlercodes.beschreibung,
        verursacherVorname: verursacher.vorname,
        verursacherNachname: verursacher.nachname,
      })
      .from(faelle)
      .innerJoin(fallPositionen, eq(faelle.id, fallPositionen.fallId))
      .innerJoin(materialien, eq(fallPositionen.materialId, materialien.id))
      .leftJoin(fehlercodes, eq(fallPositionen.fehlercodeId, fehlercodes.id))
      .leftJoin(abteilungen, eq(fehlercodes.departmentId, abteilungen.id))
      .leftJoin(verursacher, eq(faelle.verursacherId, verursacher.id))
      .where(eq(faelle.fallTyp, "ausschuss"))

    const pvMap = new Map<number, number>()
    const otherMap = new Map<number, number>()

    for (const row of results) {
      const kw = getKW(new Date(row.createdAt!))
      const isPV = row.abteilungName === "PV Bearbeitung"

      if (isPV) {
        pvMap.set(kw, (pvMap.get(kw) ?? 0) + row.stueckzahl)
      } else {
        otherMap.set(kw, (otherMap.get(kw) ?? 0) + row.stueckzahl)
      }
    }

    const allWeeks = new Set([...pvMap.keys(), ...otherMap.keys()])
    const sortedWeeks = [...allWeeks].sort((a, b) => a - b)

    const toDataPoints = (map: Map<number, number>): ChartDataPoint[] =>
      sortedWeeks.map((kw) => ({
        kw: `KW ${kw}`,
        stueckzahl: map.get(kw) ?? 0,
      }))

    const gesamt = sortedWeeks.map((kw) => ({
      kw: `KW ${kw}`,
      pvBearbeitung: pvMap.get(kw) ?? 0,
      andereAbteilungen: otherMap.get(kw) ?? 0,
    }))

    const faelleRows = results.map((row) => ({
      fallId: row.fallId,
      createdAt: row.createdAt,
      fauf: row.fauf,
      kundenAuftrag: row.kundenAuftrag,
      artikelNr: row.artikelNr,
      farbe: row.farbe,
      stueckzahl: row.stueckzahl,
      fehlercodeId: row.fehlercodeId,
      code: row.code,
      beschreibung: row.beschreibung,
      abteilungName: row.abteilungName,
      verursacherVorname: row.verursacherVorname,
      verursacherNachname: row.verursacherNachname,
    }))

    return NextResponse.json({
      pvBearbeitung: toDataPoints(pvMap),
      andereAbteilungen: toDataPoints(otherMap),
      gesamt,
      faelle: faelleRows,
    })
  } catch (error) {
    console.error("GET /api/dashboard error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
