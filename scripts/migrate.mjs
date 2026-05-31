import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("DATABASE_URL not set — skipping migration");
  process.exit(0);
}

const sql = neon(url);

await sql`
  CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    team TEXT NOT NULL,
    UNIQUE(team)
  )
`;

console.log("Migration complete.");
