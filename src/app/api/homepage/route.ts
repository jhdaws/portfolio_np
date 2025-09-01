import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/utils/kvJson";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const KV_KEY = "data/homepage.json";

type HomepageData = {
  image?: string | null;
  imagePathname?: string | null;
  title?: string;
  description?: string;
};

export async function GET() {
  try {
    const data = await readJson<HomepageData>(KV_KEY, {} as HomepageData);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    console.error("GET homepage error:", e);
    return NextResponse.json(
      { error: "Failed to read homepage" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, description } = body as {
      title?: string;
      description?: string;
    };

    const data = await readJson<HomepageData>(KV_KEY, {} as HomepageData);

    if (typeof title === "string") data.title = title;
    if (typeof description === "string") data.description = description;

    await writeJson(KV_KEY, data);

    return NextResponse.json(data);
  } catch (e) {
    console.error("PATCH homepage error:", e);
    return NextResponse.json(
      { error: "Failed to update homepage" },
      { status: 500 }
    );
  }
}
