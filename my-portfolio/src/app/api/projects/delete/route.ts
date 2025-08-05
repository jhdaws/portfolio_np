import { writeFile } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";
import currentProjects from "@/data/projects.json";

export async function POST(req: NextRequest) {
  const { slug } = await req.json();

  const updatedProjects = currentProjects.filter((p) => p.slug !== slug);
  const filePath = path.join(process.cwd(), "src/data/projects.json");

  await writeFile(filePath, JSON.stringify(updatedProjects, null, 2));
  return new Response(JSON.stringify({ status: "deleted" }), { status: 200 });
}
