import { NextRequest, NextResponse } from "next/server";
import { getAllParticipants, getAllAssignments, hasAssignments } from "@/lib/db";

function isAdmin(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  return token === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [participants, assignments, assigned] = await Promise.all([
    getAllParticipants(),
    getAllAssignments(),
    hasAssignments(),
  ]);
  return NextResponse.json({ participants, assignments, assigned });
}
