import { NextResponse } from "next/server";
import { getPortfolioAdmin } from "@/lib/auth/server";
import { managedTables } from "@/lib/admin/api";
import { getPool } from "@/lib/database/neon";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!await getPortfolioAdmin()) {
      return NextResponse.json({ error: "Admin access required." }, { status: 401 });
    }
    const pool = getPool();
    const counts = await Promise.all(managedTables.map(async (table) => {
      const result = await pool.query<{ count: string }>(`select count(*)::text as count from public."${table}"`);
      return [table, Number(result.rows[0]?.count ?? 0)] as const;
    }));
    return NextResponse.json(Object.fromEntries(counts));
  } catch (error) {
    console.error("Failed to load admin content counts.", error);
    return NextResponse.json({ error: "Failed to load content counts." }, { status: 500 });
  }
}
