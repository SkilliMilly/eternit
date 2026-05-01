import { NextResponse } from "next/server"
import { db } from "@/db"
import { faelle, fallPositionen } from "@/db/schema"
import { eq, inArray } from "drizzle-orm"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No IDs provided" },
        { status: 400 }
      )
    }

    const uniqueIds = [...new Set(ids as string[])]

    db.delete(fallPositionen)
      .where(inArray(fallPositionen.fallId, uniqueIds))
      .run()

    db.delete(faelle)
      .where(inArray(faelle.id, uniqueIds))
      .run()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("POST /api/faelle/bulk-delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete cases" },
      { status: 500 }
    )
  }
}
