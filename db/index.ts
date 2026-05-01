import { drizzle } from "drizzle-orm/better-sqlite3"
import Database from "better-sqlite3"
import path from "path"
import * as schema from "./schema"

const dbPath = path.join(process.cwd(), "sqlite.db")
const client = new Database(dbPath)
export const db = drizzle(client, { schema })
