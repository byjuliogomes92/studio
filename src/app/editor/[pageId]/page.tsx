
"use client";

import { useParams } from "next/navigation";
import { CloudPageForge } from "@/components/app/cloud-page-forge";

export default function EditorPage() {
  const params = useParams();
  const pageId = params.pageId as string;

  return <CloudPageForge pageId={pageId} />;
}
