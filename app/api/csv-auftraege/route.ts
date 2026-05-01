import { NextResponse } from "next/server"
import { db } from "@/db"
import { csvAuftraege } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const fauf = url.searchParams.get("fauf")

    if (!fauf) {
      return NextResponse.json(
        { error: "FAUF parameter is required" },
        { status: 400 }
      )
    }

    const results = db
      .select()
      .from(csvAuftraege)
      .where(eq(csvAuftraege.fauf, fauf.trim()))
      .all()

    return NextResponse.json(results)
  } catch (error) {
    console.error("GET /api/csv-auftraege error:", error)
    return NextResponse.json(
      { error: "Failed to fetch CSV data" },
      { status: 500 }
    )
  }
}
