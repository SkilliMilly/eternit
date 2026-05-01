import { NextResponse } from "next/server"
import { db } from "@/db"
import { fehlercodes } from "@/db/schema"
import { eq, inArray } from "drizzle-orm"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ids, action, departmentId } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No error code IDs provided" },
        { status: 400 }
      )
    }

    if (action === "delete") {
      await db.delete(fehlercodes).where(inArray(fehlercodes.id, ids))
      return NextResponse.json({ success: true })
    }

    if (action === "assignDepartment") {
      for (const id of ids) {
        await db
          .update(fehlercodes)
          .set({
            departmentId: departmentId || null,
            updatedAt: new Date(),
          })
          .where(eq(fehlercodes.id, id))
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("POST /api/fehlercodes/bulk error:", error)
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    )
  }
}
