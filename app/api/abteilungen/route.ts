import { NextResponse } from "next/server"
import { db } from "@/db"
import { abteilungen } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const data = await db.select().from(abteilungen)
    return NextResponse.json(data)
  } catch (error) {
    console.error("GET /api/abteilungen error:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, name } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    await db.insert(abteilungen).values({
      id,
      name: name.trim(),
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("POST /api/abteilungen error:", error)
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 })
  }
}
