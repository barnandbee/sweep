import { neon } from "@neondatabase/serverless";

function sql() {
  return neon(process.env.DATABASE_URL!);
}

export async function addParticipant(
  email: string
): Promise<{ success: boolean; alreadyExists: boolean }> {
  try {
    const db = sql();
    await db`INSERT INTO participants (email) VALUES (${email.toLowerCase().trim()})`;
    return { success: true, alreadyExists: false };
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "23505") {
      return { success: true, alreadyExists: true };
    }
    throw e;
  }
}

export async function getAllParticipants(): Promise<
  { id: number; email: string; created_at: string }[]
> {
  const db = sql();
  return (await db`SELECT * FROM participants ORDER BY created_at ASC`) as {
    id: number;
    email: string;
    created_at: string;
  }[];
}

export async function getAssignmentsForEmail(email: string): Promise<string[]> {
  const db = sql();
  const rows = (await db`
    SELECT team FROM assignments WHERE email = ${email.toLowerCase().trim()} ORDER BY team ASC
  `) as { team: string }[];
  return rows.map((r) => r.team);
}

export async function getAllAssignments(): Promise<{ email: string; team: string }[]> {
  const db = sql();
  return (await db`
    SELECT email, team FROM assignments ORDER BY email ASC, team ASC
  `) as { email: string; team: string }[];
}

export async function hasAssignments(): Promise<boolean> {
  const db = sql();
  const [row] = (await db`SELECT COUNT(*)::int AS count FROM assignments`) as {
    count: number;
  }[];
  return row.count > 0;
}

export async function saveAssignments(
  assignments: { email: string; team: string }[]
): Promise<void> {
  const db = sql();
  await db`DELETE FROM assignments`;
  if (assignments.length === 0) return;
  const emails = assignments.map((a) => a.email);
  const teams = assignments.map((a) => a.team);
  await db`
    INSERT INTO assignments (email, team)
    SELECT * FROM unnest(${emails}::text[], ${teams}::text[])
  `;
}
