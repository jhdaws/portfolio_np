import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src/data/projects.json");

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
  pathname: string;
};

export type ProjectData = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  attachments?: Attachment[];
};

export function getAllProjects(): ProjectData[] {
  try {
    const fileContents = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(fileContents) as ProjectData[];
  } catch (err) {
    console.error("Failed to read projects.json:", err);
    return [];
  }
}

export function saveProjects(projects: ProjectData[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(projects, null, 2), "utf-8");
}
