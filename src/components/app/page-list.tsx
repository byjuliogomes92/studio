
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Brand, Project, CloudPage, Template } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Plus, Trash2, X, Copy, Bell, Search, Move, MoreVertical, LayoutGrid, List, ArrowUpDown, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/icons";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { getProjectWithPages, deletePage, addPage, duplicatePage, getProjectsForUser, movePageToProject } from "@/lib/firestore";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from 'date-fns';
import { CreatePageFromTemplateDialog } from "./create-page-from-template-dialog";

interface PageListProps {
  projectId: string;
}

type SortOption = "updatedAt-desc" | "updatedAt-asc" | "name-asc" | "name-desc";

const tagColors = [
  'bg-blue-100 text-blue-800 border-blue-400',
  'bg-green-100 text-green-800 border-green-400',
  'bg-yellow-100 text-yellow-800 border-yellow-400',
  'bg-purple-100 text-purple-800 border-purple-400',
  'bg-pink-100 text-pink-800 border-pink-400',
  'bg-red-100 text-red-800 border-red-400',
  'bg-indigo-100 text-indigo-800 border-indigo-400',
];

const getTagColor = (tag: string) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return tagColors[Math.abs(hash) % tagColors.length];
};

interface MovePageDialogProps {
  page: CloudPage;
  onPageMoved: () => void;
  currentProjectId: string;
}

function MovePageDialog({ page, onPageMoved, currentProjectId }: MovePageDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user) {
      const fetchProjects = async () => {
        const { projects } = await getProjectsForUser(user.uid);
        // Filter out the current project from the list of destinations
        setProjects(projects.filter(p => p.id !== currentProjectId));
      };
      fetchProjects();
    }
  }, [isOpen, user, currentProjectId]);

  const handleMovePage = async () => {
    if (!selectedProject || !page) return;
    setIsMoving(true);
    try {
      await movePageToProject(page.id, selectedProject);
      toast({ title: "Página movida!", description: `A página "${page.name}" foi movida com sucesso.` });
      onPageMoved();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to move page:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível mover a página." });
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Move className="mr-2 h-4 w-4" />
          Mover para...
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mover Página</DialogTitle>
          <DialogDescription>Selecione a pasta de destino para a página "{page.name}".</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma pasta..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleMovePage} disabled={!selectedProject || isMoving}>
            {isMoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isMoving ? "Movendo..." : "Mover Página"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export function PageList({ projectId }: PageListProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [project, setProject] = useState<Project | null>(null);
  const [pages, setPages] = useState<CloudPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);
  
  // View, filter and sort state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<SortOption>("updatedAt-desc");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mobile Warning Dialog
  const [isMobileWarningOpen, setIsMobileWarningOpen] = useState(false);
  const [pageToNavigate, setPageToNavigate] = useState<string | null>(null);


  const fetchProjectData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getProjectWithPages(projectId, user.uid);
      if (data) {
        setProject(data.project);
        setPages(data.pages);
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

  useEffect(() => {
    if (!authLoading && user) {
        fetchProjectData();
    } else if (!authLoading && !user) {
        router.push('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, user, authLoading, toast, router]);

  const handleDeletePage = async () => {
     if (!pageToDelete) return;
    try {
      await deletePage(pageToDelete);
      setPages(prev => prev.filter(p => p.id !== pageToDelete));
      toast({ title: "Página excluída!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir a página." });
    } finally {
      setPageToDelete(null);
    }
  }

  const handleDuplicatePage = async (pageId: string) => {
    toast({ title: "Copiando página...", description: "Por favor, aguarde." });
    try {
      const newPage = await duplicatePage(pageId);
      setPages(prev => [newPage, ...prev]);
      toast({ title: "Página duplicada!", description: `A página "${newPage.name}" foi criada com sucesso.` });
    } catch(error) {
       console.error("Failed to duplicate page:", error);
       toast({ variant: "destructive", title: "Erro", description: "Não foi possível duplicar a página." });
    }
  }
  
  const handlePageClick = (pageId: string) => {
    if (isMobile) {
      setPageToNavigate(pageId);
      setIsMobileWarningOpen(true);
    } else {
      router.push(`/editor/${pageId}?projectId=${projectId}`);
    }
  };
  
  const proceedToEditor = () => {
    if (pageToNavigate) {
      router.push(`/editor/${pageToNavigate}?projectId=${projectId}`);
    }
    setIsMobileWarningOpen(false);
    setPageToNavigate(null);
  };


  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    pages.forEach(page => {
        (page.tags || []).forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [pages]);

  const filteredAndSortedPages = useMemo(() => {
    return pages
      .filter(page => {
          const matchesTag = activeTag ? (page.tags || []).includes(activeTag) : true;
          const matchesSearch = page.name.toLowerCase().includes(searchTerm.toLowerCase());
          return matchesTag && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'updatedAt-asc':
             return (a.updatedAt?.toDate() || 0) > (b.updatedAt?.toDate() || 0) ? 1 : -1;
          case 'updatedAt-desc':
          default:
             return (a.updatedAt?.toDate() || 0) < (b.updatedAt?.toDate() || 0) ? 1 : -1;
        }
      });
  }, [pages, activeTag, searchTerm, sortOption]);
  
  const getSortDirection = (column: 'name' | 'updatedAt') => {
    if (sortOption.startsWith(column)) {
      return sortOption.endsWith('-desc') ? 'desc' : 'asc';
    }
    return 'none';
  };

  const handleSort = (column: 'name' | 'updatedAt') => {
    const currentDirection = getSortDirection(column);
    if (currentDirection === 'desc') {
      setSortOption(`${column}-asc`);
    } else {
      setSortOption(`${column}-desc`);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!project) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
            <h2 className="text-xl font-semibold">Projeto não encontrado</h2>
            <p className="text-muted-foreground">O projeto que você está tentando acessar não existe ou você não tem permissão.</p>
            <Button onClick={() => router.push('/')} className="mt-4">Voltar para Projetos</Button>
        </div>
      </div>
    );
  }

  const pageActions = (page: CloudPage) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 data-[state=open]:bg-muted"
                onClick={(e) => e.stopPropagation()}
            >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent onClick={(e) => e.stopPropagation()} align="end">
            <DropdownMenuItem onClick={() => handleDuplicatePage(page.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
            </DropdownMenuItem>
            <MovePageDialog page={page} onPageMoved={() => fetchProjectData()} currentProjectId={projectId} />
            <DropdownMenuSeparator />
            <AlertDialog onOpenChange={(open) => !open && setPageToDelete(null)}>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                className="text-destructive" 
                onSelect={(e) => { e.preventDefault(); setPageToDelete(page.id); }}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente a página "{page.name}".
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={(e) => { e.stopPropagation(); handleDeletePage() }}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>
        </DropdownMenuContent>
    </DropdownMenu>
  );


  return (
    <>
      <div className="min-h-screen bg-muted/40">
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
          <div className="flex items-center gap-2">
            <CreatePageFromTemplateDialog
                projectId={projectId}
                trigger={
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Criar Página
                    </Button>
                }
                onPageCreated={() => fetchProjectData()}
            />
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
                <DropdownMenuItem>Nova funcionalidade: Templates!</DropdownMenuItem>
                <DropdownMenuItem>Melhoria no alinhamento de formulários.</DropdownMenuItem>
                <DropdownMenuItem>Bem-vindo ao CloudPage Studio!</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-6">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
             <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Buscar páginas..."
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
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium mr-2 hidden md:inline">Filtrar:</span>
                 <div className="flex items-center gap-1 rounded-md border bg-background p-1">
                    <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className="h-8 w-8">
                        <LayoutGrid className="h-4 w-4"/>
                    </Button>
                    <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className="h-8 w-8">
                        <List className="h-4 w-4"/>
                    </Button>
                </div>
                {allTags.map(tag => (
                    <Badge 
                        key={tag}
                        onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                        className={cn(
                            "cursor-pointer transition-all hover:brightness-110 border",
                            activeTag === tag ? 'ring-2 ring-primary ring-offset-2' : '',
                            getTagColor(tag)
                        )}
                    >
                        {tag}
                    </Badge>
                ))}
                {activeTag && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActiveTag(null)}>
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
          </div>


          {filteredAndSortedPages.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={48} className="mx-auto text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">Nenhuma página encontrada</h2>
              <p className="mt-2 text-muted-foreground">
                {searchTerm || activeTag ? "Ajuste seus filtros ou " : "Comece criando a primeira página para este projeto."}
                {!searchTerm && !activeTag && (
                  <CreatePageFromTemplateDialog
                      projectId={projectId}
                      trigger={
                          <Button className="mt-6">
                              <Plus className="mr-2 h-4 w-4" /> Criar Página
                          </Button>
                      }
                      onPageCreated={() => fetchProjectData()}
                  />
                )}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAndSortedPages.map((page) => (
                <div
                  key={page.id}
                  className="group relative flex flex-col bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                  onClick={() => handlePageClick(page.id)}
                >
                    <div className="aspect-[4/3] w-full bg-muted/50 rounded-t-lg flex flex-col items-center justify-center p-4 overflow-hidden cursor-pointer">
                        <div className="w-full h-full border-2 border-dashed rounded-md flex flex-col p-2 gap-1.5 bg-background">
                            <div className="h-4 w-1/3 bg-muted rounded"></div>
                            <div className="h-2 w-full bg-muted rounded"></div>
                            <div className="h-2 w-full bg-muted rounded"></div>
                            <div className="h-2 w-2/3 bg-muted rounded"></div>
                        </div>
                    </div>
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-base leading-tight truncate pr-2" title={page.name}>
                                {page.name}
                            </h3>
                            <Badge variant={page.brand === 'Natura' ? 'default' : 'destructive'} className="shrink-0 capitalize">
                                {page.brand}
                            </Badge>
                        </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {page.updatedAt?.toDate ? `Editado em: ${new Date(page.updatedAt.toDate()).toLocaleDateString()}` : 'Recém-criado'}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-2 items-center justify-between">
                         <div className="flex flex-wrap gap-1">
                            {(page.tags || []).map(tag => (
                                <Badge key={tag} className={cn('border text-xs', getTagColor(tag))}>{tag}</Badge>
                            ))}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                           {pageActions(page)}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-2 cursor-pointer">
                        Nome da Página
                        {getSortDirection('name') !== 'none' && <ArrowUpDown className="h-4 w-4" />}
                      </div>
                    </TableHead>
                    <TableHead>Tags</TableHead>
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
                  {filteredAndSortedPages.map((page) => (
                    <TableRow key={page.id} className="cursor-pointer" onClick={() => handlePageClick(page.id)}>
                      <TableCell className="font-medium">{page.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(page.tags || []).map(tag => (
                            <Badge key={tag} className={cn('border', getTagColor(tag))}>{tag}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{page.updatedAt?.toDate ? format(page.updatedAt.toDate(), 'dd/MM/yyyy, HH:mm') : '-'}</TableCell>
                      <TableCell className="text-right">
                        {pageActions(page)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </main>
      </div>

       <AlertDialog open={isMobileWarningOpen} onOpenChange={setIsMobileWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atenção</AlertDialogTitle>
            <AlertDialogDescription>
              A experiência de edição do CloudPage Studio ainda não está totalmente otimizada para dispositivos móveis.
              Recomendamos o uso de um desktop para uma melhor experiência. Uma versão adaptada para mobile estará disponível em breve!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPageToNavigate(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={proceedToEditor}>Continuar Mesmo Assim</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    