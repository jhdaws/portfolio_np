import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/utils/kvJson";
import { del } from "@vercel/blob";

export const runtime = "nodejs";
const KV_KEY = "data/homepage.json";

type HomepageData = {
  image?: string | null;
  imagePathname?: string | null;
  title?: string;
  description?: string;
};

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

    const data = await readJson<HomepageData>(KV_KEY, {} as HomepageData);

    const oldTarget = targetFrom(data.image, data.imagePathname);
    if (oldTarget) {
      try {
        await del(oldTarget, { token: process.env.BLOB_READ_WRITE_TOKEN });
      } catch (e) {
        console.warn("Failed to delete old homepage image:", oldTarget, e);
      }
    }

    data.image = image;
    data.imagePathname = imagePathname ?? null;

    await writeJson(KV_KEY, data);

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
    const data = await readJson<HomepageData>(KV_KEY, {} as HomepageData);

    const target = targetFrom(data.image, data.imagePathname);
    if (target) {
      try {
        await del(target, { token: process.env.BLOB_READ_WRITE_TOKEN });
      } catch (e) {
        console.warn("Failed to delete homepage image:", target, e);
      }
    }

    data.image = null;
    data.imagePathname = null;

    await writeJson(KV_KEY, data);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE homepage image error:", e);
    return NextResponse.json(
      { error: "Failed to remove homepage image" },
      { status: 500 }
    );
  }
}
