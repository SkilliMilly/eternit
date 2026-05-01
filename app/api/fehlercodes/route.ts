import { NextResponse } from "next/server"
import { db } from "@/db"
import { fehlercodes } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const data = await db.select().from(fehlercodes).all()
    return NextResponse.json(data)
  } catch (error) {
    console.error("GET /api/fehlercodes error:", error)
    return NextResponse.json({ error: "Failed to fetch error codes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, code, beschreibung, departmentId } = body

    if (!code?.trim() || !beschreibung?.trim()) {
      return NextResponse.json(
        { error: "Code and Beschreibung are required" },
        { status: 400 }
      )
    }

    await db.insert(fehlercodes).values({
      id,
      code: code.trim(),
      beschreibung: beschreibung.trim(),
      departmentId: departmentId || null,
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("POST /api/fehlercodes error:", error)
    return NextResponse.json(
      { error: "Failed to create error code" },
      { status: 500 }
    )
  }
}
