import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/database/neon";
import { getPortfolioAdmin } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured() || !process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET || !process.env.ADMIN_EMAIL) {
    return NextResponse.json({ configured: false, authorized: false });
  }

  const user = await getPortfolioAdmin();
  return NextResponse.json({
    configured: true,
    authorized: Boolean(user),
    user: user ? { id: user.id, email: user.email } : null,
    allowSignup: process.env.ALLOW_ADMIN_SIGNUP === "true",
  });
}
