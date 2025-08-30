

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Project, CloudPage, UserProgress, Template, PageView } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Folder, Plus, Trash2, LogOut, MoreVertical, FileText, ArrowUpDown, Loader2, Bell, Search, X, List, LayoutGrid, Library, CheckCheck, Briefcase, Target, BarChart, Calendar, Users, Smile, Menu, User, Link, Palette } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";
import { addProject, deleteProject, getProjectsForUser, updateProject, getUserProgress, getTemplates } from "@/lib/firestore";
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { OnboardingGuide } from "./onboarding-guide";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";

type SortOption = "createdAt-desc" | "createdAt-asc" | "name-asc" | "name-desc" | "updatedAt-desc" | "updatedAt-asc";
type ViewMode = "grid" | "list";

interface EnrichedProject extends Project {
  pageCount: number;
  updatedAt: Date;
}

const projectIcons = [
    { name: "Folder", icon: Folder },
    { name: "Briefcase", icon: Briefcase },
    { name: "Target", icon: Target },
    { name: "BarChart", icon: BarChart },
    { name: "Calendar", icon: Calendar },
    { name: "Users", icon: Users },
    { name: "Smile", icon: Smile },
];

const projectColors = [
    "#3b82f6", // blue-500
    "#22c55e", // green-500
    "#f97316", // orange-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#ef4444", // red-500
    "#14b8a6", // teal-500
    "#64748b", // slate-500
];

function ProjectIcon({ iconName, color, className }: { iconName?: string; color?: string, className?: string }) {
    const Icon = projectIcons.find(i => i.name === iconName)?.icon || Folder;
    return <Icon className={cn("h-10 w-10", className)} style={{ color: color || 'hsl(var(--primary))' }} />;
}

export function ProjectDashboard() {
  const router = useRouter();
  const { user, logout, loading: authLoading, activeWorkspace, workspaces, switchWorkspace } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [projects, setProjects] = useState<Project[]>([]);
  const [pages, setPages] = useState<CloudPage[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isOnboardingGuideOpen, setIsOnboardingGuideOpen] = useState(true);

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Nova funcionalidade: Kits de Marca!', slug: 'kits-de-marca-consistencia-visual', read: false },
    { id: 2, title: 'Melhoria no alinhamento de formulários.', slug: 'melhoria-alinhamento-formularios', read: true },
    { id: 3, title: 'Bem-vindo ao CloudPage Studio!', slug: 'bem-vindo-cloudpage-studio', read: true },
  ]);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  
  // State for project actions
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(projectIcons[0].name);
  const [selectedColor, setSelectedColor] = useState(projectColors[0]);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);


  // State for search, sort, and view
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("updatedAt-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");


  useEffect(() => {
    if (localStorage.getItem('onboardingGuideClosed') === 'true') {
      setIsOnboardingGuideOpen(false);
    }

    const fetchInitialData = async () => {
      if (!user || !activeWorkspace) return;
      setIsLoading(true);
      try {
        const [{ projects, pages }, progress, templates] = await Promise.all([
          getProjectsForUser(activeWorkspace.id),
          getUserProgress(user.uid),
          getTemplates(activeWorkspace.id),
        ]);
        setProjects(projects);
        setPages(pages);
        setUserProgress(progress);
        setTemplates(templates);

      } catch (err) {
        console.error(err);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os dados.' });
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user && activeWorkspace) {
        fetchInitialData();
    } else if (!authLoading && !user) {
        router.push('/login');
    }
  }, [user, authLoading, toast, router, activeWorkspace]);

  const handleNavigateToProject = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };

  const handleAddProject = async () => {
    if (newProjectName.trim() === "" || !user || !activeWorkspace) {
      toast({ variant: "destructive", title: "Erro", description: "O nome do projeto não pode ser vazio." });
      return;
    }
    try {
      const newProject = await addProject({
        name: newProjectName, 
        workspaceId: activeWorkspace.id, 
        icon: selectedIcon, 
        color: selectedColor
      });
      setProjects(prev => [newProject, ...prev]);
      setIsCreateModalOpen(false);
      toast({ title: "Projeto criado!", description: `O projeto "${newProjectName}" foi criado.` });
      
      // Check onboarding progress
      const updatedProgress = await updateUserProgress(user.uid, 'createdFirstProject');
      setUserProgress(updatedProgress);
       if (updatedProgress.objectives.createdFirstProject) {
          toast({
            title: "🎉 Objetivo Concluído!",
            description: "Você criou seu primeiro projeto."
          });
       }

    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível criar o projeto." });
    }
  };

  const handleUpdateProject = async () => {
    if (!projectToEdit || newProjectName.trim() === "") {
        toast({ variant: "destructive", title: "Erro", description: "O nome do projeto não pode ser vazio." });
        return;
    }
    try {
        const updatedData = { 
            name: newProjectName,
            icon: selectedIcon,
            color: selectedColor
        };
        await updateProject(projectToEdit.id, updatedData);
        setProjects(prev => prev.map(p => p.id === projectToEdit.id ? { ...p, ...updatedData } : p));
        toast({ title: "Projeto atualizado!" });
    } catch (error) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível renomear o projeto." });
    } finally {
        setIsRenameModalOpen(false);
        setProjectToEdit(null);
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
        setProjectToDelete(null);
    }
  };
  
  const openCreateModal = () => {
    setNewProjectName('');
    setSelectedIcon(projectIcons[0].name);
    setSelectedColor(projectColors[0]);
    setIsCreateModalOpen(true);
  }
  
  const openRenameModal = (project: Project) => {
    setProjectToEdit(project);
    setNewProjectName(project.name);
    setSelectedIcon(project.icon || projectIcons[0].name);
    setSelectedColor(project.color || projectColors[0]);
    setIsRenameModalOpen(true);
  }

  const openDeleteModal = (project: Project) => {
    setProjectToDelete(project);
  }

  const closeOnboardingGuide = () => {
    setIsOnboardingGuideOpen(false);
    localStorage.setItem('onboardingGuideClosed', 'true');
  };
  
  const handleNotificationClick = (notificationId: number, slug: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    window.open(`https://blog.cloudpagestudio.app/${slug}`, '_blank');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredAndSortedProjects = useMemo((): EnrichedProject[] => {
    return projects
      .map(project => {
          const projectPages = pages.filter(p => p.projectId === project.id);
          const lastUpdated = projectPages.reduce((latest, page) => {
              const pageDate = page.updatedAt?.toDate ? page.updatedAt.toDate() : new Date(0);
              return pageDate > latest ? pageDate : latest;
          }, project.createdAt?.toDate ? project.createdAt.toDate() : new Date(0));
          
          return {
              ...project,
              pageCount: projectPages.length,
              updatedAt: lastUpdated,
          }
      })
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
          case 'updatedAt-asc':
            return a.updatedAt > b.updatedAt ? 1 : -1;
          case 'updatedAt-desc':
            return a.updatedAt < b.updatedAt ? 1 : -1;
          default:
            return 0;
        }
      });
  }, [projects, pages, searchTerm, sortOption]);

  const dashboardStats = useMemo(() => {
    const now = new Date();
    const activePages = pages.filter(page => {
        const publishDate = page.publishDate?.toDate ? page.publishDate.toDate() : (page.publishDate ? new Date(page.publishDate) : null);
        const expiryDate = page.expiryDate?.toDate ? page.expiryDate.toDate() : (page.expiryDate ? new Date(page.expiryDate) : null);
        const isPublished = !publishDate || publishDate <= now;
        const isNotExpired = !expiryDate || expiryDate > now;
        return isPublished && isNotExpired;
    });

    return {
        projectCount: projects.length,
        pageCount: pages.length,
        activePageCount: activePages.length,
        templateCount: templates.length,
    }
  }, [projects, pages, templates]);


  if (isLoading || authLoading || !activeWorkspace) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const getSortDirection = (column: 'name' | 'createdAt' | 'updatedAt') => {
    if (sortOption.startsWith(column)) {
      return sortOption.endsWith('-desc') ? 'desc' : 'asc';
    }
    return 'none';
  };

  const handleSort = (column: 'name' | 'createdAt' | 'updatedAt') => {
    const currentDirection = getSortDirection(column);
    if (currentDirection === 'desc') {
      setSortOption(`${column}-asc`);
    } else {
      setSortOption(`${column}-desc`);
    }
  };


  const renderProjectForm = () => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="project-name">Nome do Projeto</Label>
            <Input id="project-name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Ex: Campanhas Trimestrais"/>
        </div>
        <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="flex flex-wrap gap-2">
                {projectIcons.map(({name, icon: Icon}) => (
                    <Button key={name} variant="outline" size="icon" onClick={() => setSelectedIcon(name)} className={cn(selectedIcon === name && 'ring-2 ring-primary')}>
                        <Icon className="h-5 w-5" />
                    </Button>
                ))}
            </div>
        </div>
        <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
                {projectColors.map(color => (
                     <Button key={color} variant="outline" size="icon" onClick={() => setSelectedColor(color)} className={cn('p-0', selectedColor === color && 'ring-2 ring-primary')}>
                        <div className="h-6 w-6 rounded-full" style={{ backgroundColor: color }} />
                    </Button>
                ))}
            </div>
        </div>
    </div>
  );

  const renderHeaderActions = () => {
    if (isMobile) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
             <DropdownMenuItem onClick={() => router.push('/brands')}>
              <Palette className="mr-2 h-4 w-4" />
              Marcas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/templates')}>
              <Library className="mr-2 h-4 w-4" />
              Templates
            </DropdownMenuItem>
             <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notificações
                 {unreadCount > 0 && <Badge className="ml-auto">{unreadCount}</Badge>}
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => router.push('/account')}>
                <User className="mr-2 h-4 w-4" />
                Minha Conta
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você será desconectado da sua conta.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={logout} className="bg-destructive hover:bg-destructive/90">Sair</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
    
    const userInitials = user?.displayName?.split(' ').map(n => n[0]).join('') || user?.email?.[0].toUpperCase() || 'U';

    return (
       <>
          <Button variant="ghost" onClick={() => router.push('/brands')}>
            <Palette className="mr-2 h-4 w-4" />
            Marcas
          </Button>
          <Button variant="ghost" onClick={() => router.push('/templates')}>
            <Library className="mr-2 h-4 w-4" />
            Templates
          </Button>
          <Button onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" /> Criar Projeto
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    )}
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                    Notificações
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs font-normal text-primary hover:underline">
                        <CheckCheck className="mr-1 h-3 w-3 inline-block" />
                        Marcar todas como lidas
                        </button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map(notification => (
                    <DropdownMenuItem 
                    key={notification.id} 
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => handleNotificationClick(notification.id, notification.slug)}
                    className="flex items-center gap-3 cursor-pointer"
                    >
                    {!notification.read && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>}
                    <span className={cn("flex-grow", notification.read && "pl-5")}>{notification.title}</span>
                    </DropdownMenuItem>
                ))}
                </DropdownMenuContent>
            </DropdownMenu>
         </div>
          {user && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                         <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Avatar do usuário'} />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/account')}>
                        <User className="mr-2 h-4 w-4" />
                        Gerenciar Conta
                    </DropdownMenuItem>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                <LogOut className="mr-2 h-4 w-4" />
                                Sair
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                Você será desconectado da sua conta.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={logout} className="bg-destructive hover:bg-destructive/90">Sair</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
          )}
       </>
    )
  }

  const renderSearch = () => {
    const searchInput = (
         <Popover>
            <PopoverTrigger asChild>
              <div className={cn("relative w-full", isMobile ? "max-w-full" : "max-w-sm")}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                      placeholder="Buscar projetos..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                      <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() => setSearchTerm("")}
                      >
                          <X className="h-4 w-4" />
                      </Button>
                  )}
              </div>
            </PopoverTrigger>
            {searchTerm && filteredAndSortedProjects.length > 0 && (
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandGroup>
                    {filteredAndSortedProjects.map(project => (
                      <CommandItem
                        key={project.id}
                        value={project.name}
                        onSelect={() => handleNavigateToProject(project.id)}
                        className="cursor-pointer"
                      >
                        <ProjectIcon iconName={project.icon} color={project.color} className="mr-2 h-4 w-4" />
                        {project.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            )}
          </Popover>
    );

    if (isMobile) {
      return (
        <div className="w-full">
            {isSearchVisible ? (
                <div className="flex items-center gap-2">
                    {searchInput}
                    <Button variant="ghost" size="icon" onClick={() => setIsSearchVisible(false)}>
                        <X className="h-4 w-4"/>
                    </Button>
                </div>
            ) : (
                <Button variant="outline" onClick={() => setIsSearchVisible(true)} className="w-full justify-start">
                    <Search className="mr-2 h-4 w-4"/>
                    Buscar projetos...
                </Button>
            )}
        </div>
      )
    }

    return searchInput;
  }
  
  const handleNextStepClick = () => {
    if (projects.length === 0) {
      openCreateModal();
    } else {
      router.push('/templates');
    }
  };

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b bg-card">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Logo className="h-6 w-6 text-primary" />
            <h1 className="hidden md:block">Meus Projetos</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {renderHeaderActions()}
        </div>
      </header>

      <main className="p-4 md:p-6">
        <div className="mb-6 grid gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-3">
                 <CardHeader>
                    <CardTitle>Visão Geral</CardTitle>
                    <CardDescription>Resumo das suas atividades na plataforma.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-muted/50 p-4">
                        <Briefcase className="h-6 w-6 text-muted-foreground" />
                        <span className="text-2xl font-bold">{dashboardStats.projectCount}</span>
                        <span className="text-xs text-muted-foreground">Projetos</span>
                    </div>
                     <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-muted/50 p-4">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                        <span className="text-2xl font-bold">{dashboardStats.pageCount}</span>
                        <span className="text-xs text-muted-foreground">Páginas</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-muted/50 p-4">
                        <Library className="h-6 w-6 text-muted-foreground" />
                        <span className="text-2xl font-bold">{dashboardStats.templateCount}</span>
                        <span className="text-xs text-muted-foreground">Templates</span>
                    </div>
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                 <CardHeader>
                    <CardTitle>Status das Páginas</CardTitle>
                     <CardDescription>Acompanhe suas páginas publicadas.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-3 rounded-lg bg-green-500/10 p-4 border border-green-500/20">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                            <Link className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600">{dashboardStats.activePageCount}</div>
                            <p className="text-xs text-green-700">Páginas Ativas</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-primary/10 p-4 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors" onClick={handleNextStepClick}>
                         <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                            <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                           <div className="text-lg font-bold text-primary">
                                {projects.length === 0 ? "Crie um Projeto" : "Crie uma Página"}
                            </div>
                            <p className="text-xs text-primary/80">Próximo Passo</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>


        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            {renderSearch()}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-md border bg-background p-1">
                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className="h-8 w-8">
                  <LayoutGrid className="h-4 w-4"/>
                </Button>
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className="h-8 w-8">
                  <List className="h-4 w-4"/>
                </Button>
              </div>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                          <ArrowUpDown className="mr-2 h-4 w-4"/>
                          <span className="hidden md:inline">Ordenar por</span>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSortOption('updatedAt-desc')}>Última Modificação</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption('name-asc')}>Nome (A-Z)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption('name-desc')}>Nome (Z-A)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption('createdAt-desc')}>Mais Recentes</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption('createdAt-asc')}>Mais Antigos</DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </div>
        
        {filteredAndSortedProjects.length === 0 && !searchTerm ? (
          <div className="text-center py-16">
            <Folder size={48} className="mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Nenhum projeto encontrado</h2>
            <p className="mt-2 text-muted-foreground">Projetos são como pastas para organizar suas páginas. Comece criando seu primeiro projeto.</p>
            <Button onClick={openCreateModal} className="mt-6">
              <Plus className="mr-2 h-4 w-4" /> Criar Projeto
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedProjects.map((project) => (
              <div
                key={project.id}
                className="group relative flex flex-col justify-between bg-card p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
              >
                <div onClick={() => handleNavigateToProject(project.id)} className="cursor-pointer">
                    <ProjectIcon iconName={project.icon} color={project.color} className="mb-4" />
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                        Modificado em {format(project.updatedAt, 'dd/MM/yyyy')}
                    </p>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{project.pageCount} página(s)</span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => openRenameModal(project)}>
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive" onSelect={(e) => {e.preventDefault(); openDeleteModal(project)}}>
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    Excluir
                                </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o projeto "{project.name}".
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProject()}>Excluir</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-2 cursor-pointer">
                      Nome do Projeto
                      {getSortDirection('name') !== 'none' && <ArrowUpDown className="h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead>Páginas</TableHead>
                  <TableHead onClick={() => handleSort('updatedAt')}>
                    <div className="flex items-center gap-2 cursor-pointer">
                      Última Modificação
                      {getSortDirection('updatedAt') !== 'none' && <ArrowUpDown className="h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedProjects.map((project) => (
                  <TableRow key={project.id} className="cursor-pointer" onClick={() => handleNavigateToProject(project.id)}>
                    <TableCell className="font-medium flex items-center gap-3">
                      <ProjectIcon iconName={project.icon} color={project.color} className="h-6 w-6" />
                      {project.name}
                    </TableCell>
                    <TableCell>{project.pageCount}</TableCell>
                    <TableCell>{format(project.updatedAt, 'dd/MM/yyyy, HH:mm')}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => openRenameModal(project)}>
                                  Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive" onSelect={(e) => {e.preventDefault(); openDeleteModal(project)}}>
                                        <Trash2 className="mr-2 h-4 w-4"/>
                                        Excluir
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o projeto "{project.name}".
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProject()}>Excluir</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                          </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* Onboarding Guide */}
      {isOnboardingGuideOpen && userProgress && userProgress.objectives && Object.values(userProgress.objectives).some(v => !v) && (
          <div className="fixed bottom-4 right-4 w-full max-w-sm z-50">
            <OnboardingGuide objectives={userProgress.objectives} onClose={closeOnboardingGuide} />
          </div>
        )}

      {/* Create Project Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Projeto</DialogTitle>
            <DialogDescription>Dê um nome e personalize a sua nova pasta de projeto.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {renderProjectForm()}
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
            <DialogTitle>Editar Projeto</DialogTitle>
            <DialogDescription>Altere o nome e a aparência do projeto "{projectToEdit?.name}".</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {renderProjectForm()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdateProject}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Alert Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o projeto "{projectToDelete?.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProject}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    