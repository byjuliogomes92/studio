
"use client";

import { CloudPageForge } from "@/components/app/cloud-page-forge";

export default function EditorPage({ params }: { params: { pageId: string } }) {
  return <CloudPageForge pageId={params.pageId} />;
}
