import { NextResponse } from "next/server"
import { db } from "@/db"
import { mitarbeiter } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const data = await db.select().from(mitarbeiter)
    return NextResponse.json(data)
  } catch (error) {
    console.error("GET /api/mitarbeiter error:", error)
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, vorname, nachname, personalNr, position } = body

    if (!vorname?.trim() || !nachname?.trim() || !position?.trim()) {
      return NextResponse.json(
        { error: "Vorname, Nachname and Position are required" },
        { status: 400 }
      )
    }

    await db.insert(mitarbeiter).values({
      id,
      vorname: vorname.trim(),
      nachname: nachname.trim(),
      personalNr: personalNr?.trim() || null,
      position,
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("POST /api/mitarbeiter error:", error)
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    )
  }
}
