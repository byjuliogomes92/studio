
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Project, CloudPage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Folder, Plus, Trash2, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";
import { addProject, deleteProject, getProjectsForUser } from "@/lib/firestore";

export function ProjectDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [pages, setPages] = useState<CloudPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    // A mock user ID for when auth is disabled.
    const mockUserId = "anonymous";
    setIsLoading(true);
    // Use a mock user ID if auth is disabled, otherwise use the real user's UID
    const userIdToFetch = user?.uid || mockUserId;

    getProjectsForUser(userIdToFetch)
        .then(({ projects, pages }) => {
            setProjects(projects);
            setPages(pages);
        })
        .catch(err => {
            console.error(err);
            toast({variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os projetos.'})
        })
        .finally(() => setIsLoading(false));
  }, [user, toast]);

  const handleAddProject = async () => {
    if (newProjectName.trim() === "") {
      toast({ variant: "destructive", title: "Erro", description: "O nome do projeto não pode ser vazio." });
      return;
    }
     const userId = user?.uid || "anonymous";
    try {
        const newProject = await addProject(newProjectName, userId);
        setProjects(prev => [...prev, newProject]);
        setNewProjectName("");
        setIsModalOpen(false);
        toast({ title: "Projeto criado!", description: `O projeto "${newProjectName}" foi criado.` });
    } catch(error) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível criar o projeto." });
    }
  };
  
  const handleDeleteProject = async (projectId: string) => {
    const pagesInProject = pages.filter(p => p.projectId === projectId);
    if (pagesInProject.length > 0) {
        toast({
            variant: "destructive",
            title: "Não é possível excluir",
            description: "Este projeto contém páginas. Exclua as páginas primeiro.",
        });
        return;
    }
    
    try {
        await deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
        toast({ title: "Projeto excluído!" });
    } catch(error) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir o projeto." });
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
         <div className="flex items-center gap-2 font-semibold text-lg">
          <Logo className="h-6 w-6 text-primary" />
          <h1>Meus Projetos</h1>
        </div>
        <div className="flex items-center gap-4">
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Criar Projeto
            </Button>
            {user && (
              <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </Button>
            )}
        </div>
      </header>

      <main className="p-6">
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <Folder size={48} className="mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Nenhum projeto encontrado</h2>
            <p className="mt-2 text-muted-foreground">Comece criando seu primeiro projeto.</p>
             <Button onClick={() => setIsModalOpen(true)} className="mt-6">
                <Plus className="mr-2 h-4 w-4" /> Criar Projeto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative bg-card p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/project/${project.id}`)}
              >
                <div className="flex items-start justify-between">
                    <Folder className="h-10 w-10 text-primary" />
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
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o projeto.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={(e) => {e.stopPropagation(); handleDeleteProject(project.id)}}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                <h3 className="mt-4 font-semibold text-lg">{project.name}</h3>
                <p className="text-sm text-muted-foreground">
                    {pages.filter(p => p.projectId === project.id).length} página(s)
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Projeto</DialogTitle>
            <DialogDescription>
              Dê um nome à sua nova pasta de projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="project-name">Nome do Projeto</Label>
            <Input
              id="project-name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="mt-2"
              placeholder="Ex: Campanhas Trimestrais"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddProject}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
