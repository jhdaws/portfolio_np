import { writeFile } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const filePath = path.join(process.cwd(), "src/data/projects.json");
  await writeFile(filePath, JSON.stringify(body, null, 2));

  return new Response(JSON.stringify({ status: "success" }), { status: 200 });
}
