import { NextResponse } from "next/server"
import { db } from "@/db"
import { mitarbeiter } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { vorname, nachname, personalNr, position } = body

    if (!vorname?.trim() || !nachname?.trim() || !position?.trim()) {
      return NextResponse.json(
        { error: "Vorname, Nachname and Position are required" },
        { status: 400 }
      )
    }

    await db
      .update(mitarbeiter)
      .set({
        vorname: vorname.trim(),
        nachname: nachname.trim(),
        personalNr: personalNr?.trim() || null,
        position,
        updatedAt: new Date(),
      })
      .where(eq(mitarbeiter.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PUT /api/mitarbeiter/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.delete(mitarbeiter).where(eq(mitarbeiter.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/mitarbeiter/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    )
  }
}
