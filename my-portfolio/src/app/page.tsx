"use client";

import EditableText from "@/components/EditableText";
import { isAdmin } from "@/utils/auth";
import homepageContent from "@/data/homepage.json";

export default function HomePage() {
  const admin = isAdmin();

  const saveTitle = (newTitle: string) => {
    console.log("New title:", newTitle);
    // Replace this with actual write logic (backend or local storage)
  };

  const saveDescription = (newDesc: string) => {
    console.log("New description:", newDesc);
  };

  return (
    <div>
      <EditableText
        text={homepageContent.title}
        onSave={saveTitle}
        isAdmin={admin}
        tag="h1"
      />
      <EditableText
        text={homepageContent.description}
        onSave={saveDescription}
        isAdmin={admin}
        tag="p"
      />
    </div>
  );
}
