import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";

let authInstance: ReturnType<typeof createNeonAuth> | undefined;

export function isNeonAuthConfigured() {
  return Boolean(
    process.env.NEON_AUTH_BASE_URL &&
      process.env.NEON_AUTH_COOKIE_SECRET &&
      process.env.ADMIN_EMAIL,
  );
}

export function getAuth() {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!baseUrl || !cookieSecret) {
    throw new Error("Neon Auth is not configured. Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET.");
  }
  if (cookieSecret.length < 32) {
    throw new Error("NEON_AUTH_COOKIE_SECRET must be at least 32 characters.");
  }

  authInstance ??= createNeonAuth({
    baseUrl,
    cookies: { secret: cookieSecret },
  });
  return authInstance;
}

export async function getPortfolioAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    throw new Error("Set ADMIN_EMAIL to the single account allowed to manage this portfolio.");
  }

  const { data: session, error } = await getAuth().getSession();
  if (error) throw new Error(`Could not verify Neon Auth session: ${error.message}`);
  const email = session?.user?.email?.trim().toLowerCase();
  if (!session?.user || !email || email !== adminEmail) return null;

  return session.user;
}
