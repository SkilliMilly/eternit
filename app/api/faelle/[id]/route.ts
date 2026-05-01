import { NextResponse } from "next/server"
import { db } from "@/db"
import { faelle, fallPositionen, materialien, fehlercodes } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const fall = db.select().from(faelle).where(eq(faelle.id, id)).get()
    if (!fall) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const positionen = db
      .select({
        id: fallPositionen.id,
        materialId: fallPositionen.materialId,
        stueckzahl: fallPositionen.stueckzahl,
        fehlercodeId: fallPositionen.fehlercodeId,
        artikelNr: materialien.artikelNr,
        farbe: materialien.farbe,
        code: fehlercodes.code,
        beschreibung: fehlercodes.beschreibung,
      })
      .from(fallPositionen)
      .innerJoin(materialien, eq(fallPositionen.materialId, materialien.id))
      .leftJoin(fehlercodes, eq(fallPositionen.fehlercodeId, fehlercodes.id))
      .where(eq(fallPositionen.fallId, id))
      .all()

    return NextResponse.json({ ...fall, positionen })
  } catch (error) {
    console.error("GET /api/faelle/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch case" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { maschine, fallTyp, fauf, kundenAuftrag, kommentar, mitarbeiterId, verursacherId, createdAt, positionen } = body

    if (!maschine?.trim() || !fallTyp?.trim() || !mitarbeiterId?.trim()) {
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

    db.update(faelle)
      .set({
        maschine,
        fallTyp,
        fauf: fauf?.trim() || null,
        kundenAuftrag: kundenAuftrag?.trim() || null,
        kommentar: kommentar?.trim() || null,
        mitarbeiterId,
        verursacherId: verursacherId?.trim() || null,
        updatedAt: new Date(),
        ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
      })
      .where(eq(faelle.id, id))
      .run()

    db.delete(fallPositionen).where(eq(fallPositionen.fallId, id)).run()

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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PUT /api/faelle/[id] error:", error)
    return NextResponse.json({ error: "Failed to update case" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    db.delete(fallPositionen).where(eq(fallPositionen.fallId, id)).run()
    db.delete(faelle).where(eq(faelle.id, id)).run()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/faelle/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete case" }, { status: 500 })
  }
}
