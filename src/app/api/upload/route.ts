import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Expect a multipart/form-data body with "file" (File).
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const filenameOverride = (form.get("filename") as string) || undefined;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const filename = filenameOverride || file.name || "upload";

  // Upload with a random suffix so duplicate names don't collide across projects.
  // Also pass through the MIME type so previews render correctly.
  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type || undefined,
    token: process.env.BLOB_READ_WRITE_TOKEN,
    // cacheControl: "public, max-age=31536000, immutable", // optional
  });

  // Return the fields your app stores for each attachment
  return NextResponse.json({
    // Use the original name in UI (doesn't include the random suffix)
    name: filename,
    url: blob.url, // public URL
    pathname: blob.pathname, // needed for deletion with @vercel/blob `del(pathname)`
    contentType: file.type || "", // useful for rendering previews
    size: file.size,
  });
}
