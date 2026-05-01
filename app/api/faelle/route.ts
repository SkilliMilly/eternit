import { NextResponse } from "next/server"
import { db } from "@/db"
import { faelle, fallPositionen, materialien, fehlercodes, abteilungen, mitarbeiter } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { alias } from "drizzle-orm/sqlite-core"

export async function GET() {
  try {
    const verursacher = alias(mitarbeiter, "verursacher")
    const results = db
      .select({
        fallId: faelle.id,
        createdAt: faelle.createdAt,
        fallTyp: faelle.fallTyp,
        fauf: faelle.fauf,
        kundenAuftrag: faelle.kundenAuftrag,
        materialId: materialien.id,
        artikelNr: materialien.artikelNr,
        farbe: materialien.farbe,
        stueckzahl: fallPositionen.stueckzahl,
        fehlercodeId: fehlercodes.id,
        code: fehlercodes.code,
        beschreibung: fehlercodes.beschreibung,
        abteilungName: abteilungen.name,
        verursacherVorname: verursacher.vorname,
        verursacherNachname: verursacher.nachname,
      })
      .from(faelle)
      .innerJoin(fallPositionen, eq(faelle.id, fallPositionen.fallId))
      .innerJoin(materialien, eq(fallPositionen.materialId, materialien.id))
      .leftJoin(fehlercodes, eq(fallPositionen.fehlercodeId, fehlercodes.id))
      .leftJoin(abteilungen, eq(fehlercodes.departmentId, abteilungen.id))
      .leftJoin(verursacher, eq(faelle.verursacherId, verursacher.id))
      .orderBy(desc(faelle.createdAt))
      .all()

    return NextResponse.json(results)
  } catch (error) {
    console.error("GET /api/faelle error:", error)
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, maschine, fallTyp, fauf, kundenAuftrag, kommentar, mitarbeiterId, verursacherId, positionen } = body

    if (!id?.trim() || !maschine?.trim() || !fallTyp?.trim() || !mitarbeiterId?.trim()) {
      return NextResponse.json(
        { error: "Maschine, Falltyp and Mitarbeiter are required" },
        { status: 400 }
      )
    }

    if (!Array.isArray(positionen) || positionen.length === 0) {
      return NextResponse.json(
        { error: "At least one material position is required" },
        { status: 400 }
      )
    }

    for (const pos of positionen) {
      if (!pos.materialId?.trim()) {
        return NextResponse.json(
          { error: "Material is required for all positions" },
          { status: 400 }
        )
      }
      const num = Number(pos.stueckzahl)
      if (!pos.stueckzahl || Number.isNaN(num) || num < 1) {
        return NextResponse.json(
          { error: "Stückzahl must be at least 1" },
          { status: 400 }
        )
      }
      if (fallTyp === "ausschuss" && !pos.fehlercodeId?.trim()) {
        return NextResponse.json(
          { error: "Fehlercode is required for Ausschuss" },
          { status: 400 }
        )
      }
    }

    db.insert(faelle)
      .values({
        id,
        maschine,
        fallTyp,
        fauf: fauf?.trim() || null,
        kundenAuftrag: kundenAuftrag?.trim() || null,
        kommentar: kommentar?.trim() || null,
        mitarbeiterId,
        verursacherId: verursacherId?.trim() || null,
      })
      .run()

    for (const pos of positionen) {
      db.insert(fallPositionen)
        .values({
          id: pos.id || crypto.randomUUID(),
          fallId: id,
          materialId: pos.materialId,
          stueckzahl: Number(pos.stueckzahl),
          fehlercodeId: pos.fehlercodeId?.trim() || null,
        })
        .run()
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("POST /api/faelle error:", error)
    return NextResponse.json(
      { error: "Failed to create case" },
      { status: 500 }
    )
  }
}
