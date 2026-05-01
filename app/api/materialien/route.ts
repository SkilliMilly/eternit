import { NextResponse } from "next/server"
import { db } from "@/db"
import { materialien } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function GET() {
  try {
    const data = db.select().from(materialien).all()
    return NextResponse.json(data)
  } catch (error) {
    console.error("GET /api/materialien error:", error)
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { artikelNr, farbe } = body

    if (!artikelNr?.trim() || !farbe?.trim()) {
      return NextResponse.json(
        { error: "Artikelnr. and Farbe are required" },
        { status: 400 }
      )
    }

    const artikel = artikelNr.trim()
    const color = farbe.trim()

    const existing = db
      .select()
      .from(materialien)
      .where(
        and(
          eq(materialien.artikelNr, artikel),
          eq(materialien.farbe, color)
        )
      )
      .all()

    if (existing.length > 0) {
      return NextResponse.json(existing[0])
    }

    const id = crypto.randomUUID()
    db.insert(materialien).values({
      id,
      artikelNr: artikel,
      farbe: color,
    }).run()

    return NextResponse.json({ id, artikelNr: artikel, farbe: color }, { status: 201 })
  } catch (error) {
    console.error("POST /api/materialien error:", error)
    return NextResponse.json(
      { error: "Failed to create material" },
      { status: 500 }
    )
  }
}
