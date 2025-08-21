
"use client";

import { useParams } from "next/navigation";
import { PageList } from "@/components/app/page-list";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <main className="bg-muted/40">
      <PageList projectId={projectId} />
    </main>
  );
}
