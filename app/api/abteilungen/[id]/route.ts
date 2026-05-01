import { NextResponse } from "next/server"
import { db } from "@/db"
import { abteilungen } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    await db
      .update(abteilungen)
      .set({ name: name.trim(), updatedAt: new Date() })
      .where(eq(abteilungen.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PUT /api/abteilungen/[id] error:", error)
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.delete(abteilungen).where(eq(abteilungen.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/abteilungen/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 })
  }
}
