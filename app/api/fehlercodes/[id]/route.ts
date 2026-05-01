import { NextResponse } from "next/server"
import { db } from "@/db"
import { fehlercodes } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { code, beschreibung, departmentId } = body

    if (!code?.trim() || !beschreibung?.trim()) {
      return NextResponse.json(
        { error: "Code and Beschreibung are required" },
        { status: 400 }
      )
    }

    await db
      .update(fehlercodes)
      .set({
        code: code.trim(),
        beschreibung: beschreibung.trim(),
        departmentId: departmentId || null,
        updatedAt: new Date(),
      })
      .where(eq(fehlercodes.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PUT /api/fehlercodes/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to update error code" },
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
    await db.delete(fehlercodes).where(eq(fehlercodes.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/fehlercodes/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to delete error code" },
      { status: 500 }
    )
  }
}
