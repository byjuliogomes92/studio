
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Project, CloudPage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { getProject, getPagesForProject, deletePage } from "@/lib/firestore";

interface PageListProps {
  projectId: string;
}

export function PageList({ projectId }: PageListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [pages, setPages] = useState<CloudPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const currentProject = await getProject(projectId);
        if (currentProject && currentProject.userId === user.uid) {
          setProject(currentProject);
          const projectPages = await getPagesForProject(projectId);
          setPages(projectPages);
        } else {
          toast({ variant: 'destructive', title: 'Erro', description: 'Projeto não encontrado ou acesso negado.' });
          router.push('/');
        }
      } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar o projeto.' });
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [projectId, router, user, toast]);

  const handleCreatePage = () => {
    router.push(`/editor/new?projectId=${projectId}`);
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      await deletePage(pageId);
      setPages(prev => prev.filter(p => p.id !== pageId));
      toast({ title: "Página excluída!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir a página." });
    }
  }

  if (isLoading || !project) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 font-semibold text-lg">
            <h1 className="text-muted-foreground">Projetos /</h1>
            <h1>{project.name}</h1>
          </div>
        </div>
        <Button onClick={handleCreatePage}>
          <Plus className="mr-2 h-4 w-4" /> Criar Página
        </Button>
      </header>

      <main className="p-6">
        {pages.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={48} className="mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Nenhuma página encontrada</h2>
            <p className="mt-2 text-muted-foreground">Comece criando a primeira página para este projeto.</p>
            <Button onClick={handleCreatePage} className="mt-6">
              <Plus className="mr-2 h-4 w-4" /> Criar Página
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pages.map((page) => (
              <div
                key={page.id}
                className="group relative bg-card p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/editor/${page.id}`)}
              >
                <div className="flex items-start justify-between">
                  <FileText className="h-10 w-10 text-primary" />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente a página.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.stopPropagation(); handleDeletePage(page.id) }}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <h3 className="mt-4 font-semibold">{page.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {page.updatedAt && page.updatedAt.toDate ? `Editado em: ${new Date(page.updatedAt.toDate()).toLocaleDateString()}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
