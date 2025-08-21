
"use client";

import { useAuth } from "@/hooks/use-auth";
import { CloudPageForge } from "@/components/app/cloud-page-forge";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/icons";

export default function EditorPage({ params }: { params: { pageId: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return <CloudPageForge pageId={params.pageId} />;
}
