import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs";

const HOMEPAGE_PATH = path.join(process.cwd(), "src", "data", "homepage.json");

export async function GET() {
  try {
    const raw = await fs.readFile(HOMEPAGE_PATH, "utf-8");
    return NextResponse.json(JSON.parse(raw));
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

    const raw = await fs.readFile(HOMEPAGE_PATH, "utf-8");
    const data = JSON.parse(raw);

    if (typeof title === "string") data.title = title;
    if (typeof description === "string") data.description = description;

    await fs.writeFile(HOMEPAGE_PATH, JSON.stringify(data, null, 2));

    return NextResponse.json(data);
  } catch (e) {
    console.error("PATCH homepage error:", e);
    return NextResponse.json(
      { error: "Failed to update homepage" },
      { status: 500 }
    );
  }
}
