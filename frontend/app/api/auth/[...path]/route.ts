import { NextResponse, type NextRequest } from "next/server";
import { getAuth, isNeonAuthConfigured } from "@/lib/auth/server";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxyAuth(request: NextRequest, context: RouteContext, method: "GET" | "POST") {
  if (!isNeonAuthConfigured()) {
    return NextResponse.json({ error: "Neon Auth is not configured." }, { status: 503 });
  }
  const authPath = (await context.params).path.join("/");
  if (method === "POST" && authPath.endsWith("sign-up/email")) {
    if (process.env.ALLOW_ADMIN_SIGNUP !== "true") {
      return NextResponse.json({ error: "Owner account registration is disabled." }, { status: 403 });
    }
    let signup: { email?: unknown };
    try {
      signup = await request.clone().json();
    } catch {
      return NextResponse.json({ error: "Invalid registration request." }, { status: 400 });
    }
    if (typeof signup.email !== "string" ||
      signup.email.trim().toLowerCase() !== process.env.ADMIN_EMAIL?.trim().toLowerCase()) {
      return NextResponse.json({ error: "Only the configured owner email may register." }, { status: 403 });
    }
  }
  const handlers = getAuth().handler();
  return handlers[method](request, context);
}

export function GET(request: NextRequest, context: RouteContext) {
  return proxyAuth(request, context, "GET");
}

export function POST(request: NextRequest, context: RouteContext) {
  return proxyAuth(request, context, "POST");
}
