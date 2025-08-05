import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const PROJECTS_PATH = path.join(process.cwd(), "src", "data", "projects.json");

export async function GET() {
  try {
    const json = await fs.readFile(PROJECTS_PATH, "utf-8");
    const projects = JSON.parse(json);
    return NextResponse.json(projects);
  } catch (err) {
    return new NextResponse("Failed to load projects", { status: 500 });
  }
}
