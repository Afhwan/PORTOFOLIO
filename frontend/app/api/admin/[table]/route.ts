import { NextResponse, type NextRequest } from "next/server";
import { getPortfolioAdmin } from "@/lib/auth/server";
import { assertSameOrigin, getEditableEntries, isManagedTable } from "@/lib/admin/api";
import { getPool } from "@/lib/database/neon";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ table: string }> };
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    if (!await getPortfolioAdmin()) {
      return NextResponse.json({ error: "Admin access required." }, { status: 401 });
    }
    const { table } = await context.params;
    if (!isManagedTable(table)) return NextResponse.json({ error: "Unknown content type." }, { status: 404 });

    const result = await getPool().query(`select * from public."${table}" order by updated_at desc nulls last`);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to load admin content.", error);
    return NextResponse.json({ error: "Failed to load content." }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    assertSameOrigin(request);
    if (!await getPortfolioAdmin()) {
      return NextResponse.json({ error: "Admin access required." }, { status: 401 });
    }
    const { table } = await context.params;
    if (!isManagedTable(table)) return NextResponse.json({ error: "Unknown content type." }, { status: 404 });

    const body: unknown = await request.json();
    const entries = getEditableEntries(table, body);
    const columns = entries.map(([key]) => `"${key}"`).join(", ");
    const placeholders = entries.map((_, index) => `$${index + 1}`).join(", ");
    const result = await getPool().query(
      `insert into public."${table}" (${columns}) values (${placeholders}) returning *`,
      entries.map(([, value]) => value),
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Request origin is not allowed.") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.message.startsWith("Request body")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Error && error.message.startsWith("At least one")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Error && (error.message.startsWith("Request contains") || error.message.startsWith("Invalid field"))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to create admin content.", error);
    return NextResponse.json({ error: "Failed to save content." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    assertSameOrigin(request);
    if (!await getPortfolioAdmin()) {
      return NextResponse.json({ error: "Admin access required." }, { status: 401 });
    }
    const { table } = await context.params;
    if (!isManagedTable(table)) return NextResponse.json({ error: "Unknown content type." }, { status: 404 });

    const id = request.nextUrl.searchParams.get("id");
    if (!id || !uuidPattern.test(id)) return NextResponse.json({ error: "A valid content ID is required." }, { status: 400 });
    const body: unknown = await request.json();
    const entries = getEditableEntries(table, body);
    const assignments = entries.map(([key], index) => `"${key}" = $${index + 1}`).join(", ");
    const result = await getPool().query(
      `update public."${table}" set ${assignments} where id = $${entries.length + 1} returning *`,
      [...entries.map(([, value]) => value), id],
    );
    if (!result.rowCount) return NextResponse.json({ error: "Content not found." }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    if (error instanceof Error && (error.message === "Request origin is not allowed." || error.message.startsWith("Request body") || error.message.startsWith("At least one") || error.message.startsWith("Request contains") || error.message.startsWith("Invalid field"))) {
      return NextResponse.json({ error: error.message }, { status: error.message === "Request origin is not allowed." ? 403 : 400 });
    }
    console.error("Failed to update admin content.", error);
    return NextResponse.json({ error: "Failed to update content." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    assertSameOrigin(request);
    if (!await getPortfolioAdmin()) {
      return NextResponse.json({ error: "Admin access required." }, { status: 401 });
    }
    const { table } = await context.params;
    if (!isManagedTable(table)) return NextResponse.json({ error: "Unknown content type." }, { status: 404 });

    const id = request.nextUrl.searchParams.get("id");
    if (!id || !uuidPattern.test(id)) return NextResponse.json({ error: "A valid content ID is required." }, { status: 400 });
    const result = await getPool().query(`delete from public."${table}" where id = $1`, [id]);
    if (!result.rowCount) return NextResponse.json({ error: "Content not found." }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "Request origin is not allowed.") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Failed to delete admin content.", error);
    return NextResponse.json({ error: "Failed to delete content." }, { status: 500 });
  }
}
