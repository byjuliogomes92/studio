
"use client";

import { useAuth } from "@/hooks/use-auth";
import { PageList } from "@/components/app/page-list";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/icons";

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
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
  
  return (
    <main className="bg-muted/40">
      <PageList projectId={params.projectId} />
    </main>
  );
}
