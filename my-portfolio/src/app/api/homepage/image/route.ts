import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { del } from "@vercel/blob";

export const runtime = "nodejs";

const HOMEPAGE_PATH = path.join(process.cwd(), "src", "data", "homepage.json");

function isVercelBlobUrl(u?: string) {
  if (!u) return false;
  try {
    const { hostname } = new URL(u);
    return (
      hostname.endsWith(".public.blob.vercel-storage.com") ||
      hostname.endsWith(".blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

function targetFrom(image?: string | null, imagePathname?: string | null) {
  if (imagePathname) return imagePathname;
  if (image && isVercelBlobUrl(image)) return image;
  return undefined;
}

// PATCH = set a new image; delete old blob if present
export async function PATCH(req: Request) {
  try {
    const { image, imagePathname } = (await req.json()) as {
      image: string;
      imagePathname?: string;
    };

    if (!image) {
      return NextResponse.json({ error: "Missing image" }, { status: 400 });
    }

    const raw = await fs.readFile(HOMEPAGE_PATH, "utf-8");
    const data = JSON.parse(raw);

    const oldTarget = targetFrom(data.image, data.imagePathname);
    if (oldTarget) {
      try {
        await del(oldTarget); // optionally: { token: process.env.BLOB_READ_WRITE_TOKEN }
      } catch (e) {
        console.warn("Failed to delete old homepage image:", oldTarget, e);
      }
    }

    data.image = image;
    data.imagePathname = imagePathname ?? null;

    await fs.writeFile(HOMEPAGE_PATH, JSON.stringify(data, null, 2));

    return NextResponse.json({
      ok: true,
      image: data.image,
      imagePathname: data.imagePathname,
    });
  } catch (e) {
    console.error("PATCH homepage image error:", e);
    return NextResponse.json(
      { error: "Failed to update homepage image" },
      { status: 500 }
    );
  }
}

// DELETE = remove image and delete blob
export async function DELETE() {
  try {
    const raw = await fs.readFile(HOMEPAGE_PATH, "utf-8");
    const data = JSON.parse(raw);

    const target = targetFrom(data.image, data.imagePathname);
    if (target) {
      try {
        await del(target);
      } catch (e) {
        console.warn("Failed to delete homepage image:", target, e);
      }
    }

    data.image = null;
    data.imagePathname = null;

    await fs.writeFile(HOMEPAGE_PATH, JSON.stringify(data, null, 2));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE homepage image error:", e);
    return NextResponse.json(
      { error: "Failed to remove homepage image" },
      { status: 500 }
    );
  }
}
