import { NextResponse } from "next/server"
import { db } from "@/db"
import { mitarbeiter } from "@/db/schema"
import { eq, inArray } from "drizzle-orm"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ids, action, position } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No employee IDs provided" },
        { status: 400 }
      )
    }

    if (action === "delete") {
      await db.delete(mitarbeiter).where(inArray(mitarbeiter.id, ids))
      return NextResponse.json({ success: true })
    }

    if (action === "applyPosition") {
      if (!position?.trim()) {
        return NextResponse.json(
          { error: "Position is required" },
          { status: 400 }
        )
      }

      for (const id of ids) {
        await db
          .update(mitarbeiter)
          .set({ position, updatedAt: new Date() })
          .where(eq(mitarbeiter.id, id))
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("POST /api/mitarbeiter/bulk error:", error)
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    )
  }
}
