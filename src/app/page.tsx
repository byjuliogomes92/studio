
"use client";

import { useAuth } from "@/hooks/use-auth";
import { ProjectDashboard } from "@/components/app/project-dashboard";
import { Logo } from "@/components/icons";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoginPage from "./login/page";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <main className="bg-muted/40">
      <ProjectDashboard />
    </main>
  );
}
