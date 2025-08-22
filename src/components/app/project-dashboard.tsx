
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Project, CloudPage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Folder, Plus, Trash2, LogOut, MoreVertical, FileText, ArrowUpDown, Loader2, Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";
import { addProject, deleteProject, getProjectsForUser, updateProject } from "@/lib/firestore";
import { format } from 'date-fns';

type SortOption = "createdAt-desc" | "createdAt-asc" | "name-asc" | "name-desc";

export function ProjectDashboard() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [pages, setPages] = useState<CloudPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // State for project actions
  const [newProjectName, setNewProjectName] = useState("");
  const [projectToRename, setProjectToRename] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // State for search and sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("createdAt-desc");


  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const { projects, pages } = await getProjectsForUser(user.uid);
        setProjects(projects);
        setPages(pages);
      } catch (err) {
        console.error(err);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os projetos.' });
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      if (user) {
        fetchProjects();
      } else {
        router.push('/login');
      }
    }
  }, [user, authLoading, toast, router]);

  const handleNavigateToProject = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };

  const handleAddProject = async () => {
    if (newProjectName.trim() === "" || !user) {
      toast({ variant: "destructive", title: "Erro", description: "O nome do projeto não pode ser vazio." });
      return;
    }
    try {
      const newProject = await addProject(newProjectName, user.uid);
      setProjects(prev => [newProject, ...prev]);
      setNewProjectName("");
      setIsCreateModalOpen(false);
      toast({ title: "Projeto criado!", description: `O projeto "${newProjectName}" foi criado.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível criar o projeto." });
    }
  };

  const handleRenameProject = async () => {
    if (!projectToRename || newProjectName.trim() === "") {
        toast({ variant: "destructive", title: "Erro", description: "O nome do projeto não pode ser vazio." });
        return;
    }
    try {
        await updateProject(projectToRename.id, { name: newProjectName });
        setProjects(prev => prev.map(p => p.id === projectToRename.id ? { ...p, name: newProjectName } : p));
        toast({ title: "Projeto renomeado!" });
    } catch (error) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível renomear o projeto." });
    } finally {
        setIsRenameModalOpen(false);
        setNewProjectName("");
        setProjectToRename(null);
    }
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    const pagesInProject = pages.filter(p => p.projectId === projectToDelete.id);
    if (pagesInProject.length > 0) {
      toast({
        variant: "destructive",
        title: "Não é possível excluir",
        description: "Este projeto contém páginas. Exclua as páginas primeiro.",
      });
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
      return;
    }

    try {
      await deleteProject(projectToDelete.id);
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      toast({ title: "Projeto excluído!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir o projeto." });
    } finally {
        setIsDeleteModalOpen(false);
        setProjectToDelete(null);
    }
  };
  
  const openRenameModal = (project: Project) => {
    setProjectToRename(project);
    setNewProjectName(project.name);
    setIsRenameModalOpen(true);
  }

  const openDeleteModal = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  }

  const filteredAndSortedProjects = useMemo(() => {
    return projects
      .filter(project => project.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        switch (sortOption) {
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'createdAt-asc':
            return (a.createdAt?.toDate() || 0) > (b.createdAt?.toDate() || 0) ? 1 : -1;
          case 'createdAt-desc':
            return (a.createdAt?.toDate() || 0) < (b.createdAt?.toDate() || 0) ? 1 : -1;
          default:
            return 0;
        }
      });
  }, [projects, searchTerm, sortOption]);


  if (isLoading || authLoading) {
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
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Criar Projeto
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Nova funcionalidade: Duplique páginas!</DropdownMenuItem>
              <DropdownMenuItem>Melhoria no alinhamento de formulários.</DropdownMenuItem>
              <DropdownMenuItem>Bem-vindo ao Cloud Page Forge!</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user && (
            <Button variant="outline" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          )}
        </div>
      </header>

      <main className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <Input 
                placeholder="Buscar projetos..."
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <ArrowUpDown className="mr-2 h-4 w-4"/>
                        Ordenar por
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSortOption('createdAt-desc')}>Mais Recentes</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption('createdAt-asc')}>Mais Antigos</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption('name-asc')}>Nome (A-Z)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption('name-desc')}>Nome (Z-A)</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        {filteredAndSortedProjects.length === 0 ? (
          <div className="text-center py-16">
            <Folder size={48} className="mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Nenhum projeto encontrado</h2>
            <p className="mt-2 text-muted-foreground">Comece criando seu primeiro projeto ou ajuste sua busca.</p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="mt-6">
              <Plus className="mr-2 h-4 w-4" /> Criar Projeto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedProjects.map((project) => (
              <div
                key={project.id}
                className="group relative flex flex-col justify-between bg-card p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
              >
                <div onClick={() => handleNavigateToProject(project.id)} className="cursor-pointer">
                    <Folder className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                        Criado em {project.createdAt?.toDate ? format(project.createdAt.toDate(), 'dd/MM/yyyy') : '...'}
                    </p>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{pages.filter(p => p.projectId === project.id).length} página(s)</span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                             <DropdownMenuItem onClick={() => openRenameModal(project)}>
                                Renomear
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => openDeleteModal(project)}>
                                <Trash2 className="mr-2 h-4 w-4"/>
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Projeto</DialogTitle>
            <DialogDescription>Dê um nome à sua nova pasta de projeto.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="project-name">Nome do Projeto</Label>
            <Input id="project-name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="mt-2" placeholder="Ex: Campanhas Trimestrais"/>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddProject}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Projeto</DialogTitle>
            <DialogDescription>Digite o novo nome para o projeto "{projectToRename?.name}".</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rename-project-name">Novo Nome do Projeto</Label>
            <Input id="rename-project-name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="mt-2"/>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleRenameProject}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Alert Dialog */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o projeto "{projectToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
