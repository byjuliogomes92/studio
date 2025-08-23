
"use client";

import { useParams } from "next/navigation";
import { CloudPageForge } from "@/components/app/cloud-page-forge";

// This component doesn't fetch data itself, so we can't generate metadata here.
// The title will be updated dynamically within the CloudPageForge component if needed.

export default function EditorPage() {
  const params = useParams();
  const pageId = params.pageId as string;

  return <CloudPageForge pageId={pageId} />;
}
