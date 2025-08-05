import { NextRequest, NextResponse } from "next/server";
import { getAllProjects, saveProjects, ProjectData } from "@/utils/projectData";

export async function POST(request: NextRequest) {
  try {
    const { title, description, imageUrl, imagePath } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Generate a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const projects = getAllProjects();

    // Check if slug already exists
    if (projects.find((p) => p.slug === slug)) {
      return NextResponse.json(
        { error: "A project with this title already exists" },
        { status: 400 }
      );
    }

    const newProject: ProjectData = {
      slug,
      title,
      description,
      image: imageUrl || undefined,
      attachments: [],
    };

    projects.push(newProject);
    saveProjects(projects);

    return NextResponse.json({ success: true, project: newProject });
  } catch (error) {
    console.error("Error adding project:", error);
    return NextResponse.json(
      { error: "Failed to add project" },
      { status: 500 }
    );
  }
}
