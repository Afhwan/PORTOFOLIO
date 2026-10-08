import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse, type NextRequest } from "next/server";
import { getPortfolioAdmin } from "@/lib/auth/server";
import { assertSameOrigin } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const maxFileSize = 5 * 1024 * 1024;

function getStorageClient() {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
    throw new Error("Neon Object Storage is not configured.");
  }
  return {
    endpoint,
    client: new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await getPortfolioAdmin();
    if (!user) return NextResponse.json({ error: "Admin access required." }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
    }
    if (file.size === 0 || file.size > maxFileSize) {
      return NextResponse.json({ error: "File size must be between 1 byte and 5 MB." }, { status: 400 });
    }
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WebP, and PDF files are allowed." }, { status: 400 });
    }

    const bucket = process.env.PORTFOLIO_ASSETS_BUCKET ?? "portfolio-assets";
    const { endpoint, client } = getStorageClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);
    const key = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentLength: file.size,
      ContentType: file.type,
      CacheControl: "public, max-age=3600",
    }));

    const publicUrl = `${endpoint.replace(/\/$/, "")}/${encodeURIComponent(bucket)}/${key
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    if (error instanceof Error && error.message === "Request origin is not allowed.") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Failed to upload portfolio asset.", error);
    const message = error instanceof Error && error.message === "Neon Object Storage is not configured."
      ? error.message
      : "Failed to upload asset.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
