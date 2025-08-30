

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Brand, Project, CloudPage, Template, PageView, FormSubmission } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Trash2, X, Copy, Bell, Search, Move, MoreVertical, LayoutGrid, List, ArrowUpDown, Server, LineChart, Users, Globe, Clock, RefreshCw, Download, CheckCheck, Menu, User, LogOut, Folder, Briefcase, Target, BarChart, Calendar, Smile, Code } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { getProjectWithPages, deletePage, addPage, duplicatePage, getProjectsForUser, movePageToProject, getPageViews, getFormSubmissions } from "@/lib/firestore";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from 'date-fns';
import { CreatePageFromTemplateDialog } from "./create-page-from-template-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";

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

const projectIcons = [
    { name: "Folder", icon: Folder },
    { name: "Briefcase", icon: Briefcase },
    { name: "Target", icon: Target },
    { name: "BarChart", icon: BarChart },
    { name: "Calendar", icon: Calendar },
    { name: "Users", icon: Users },
    { name: "Smile", icon: Smile },
];

const platforms = [
    { id: 'sfmc', name: 'Salesforce', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg' },
    { id: 'hubspot', name: 'Hubspot', logo: 'https://cronic.com.br/wp-content/uploads/2021/11/hubspot.png' },
    { id: 'rdstation', name: 'RD Station', logo: 'https://gleybionycamargo.com.br/wp-content/uploads/2022/10/logo-rd-branca.png' },
    { id: 'braze', name: 'Braze', logo: 'https://cdn.prod.website-files.com/616f0a7a027baab453433911/680fe9f825f815d39843558e_Braze_Logo_Light%20(1).svg' },
    { id: 'klaviyo', name: 'Klaviyo', logo: 'https://cdn.prod.website-files.com/616f0a7a027baab453433911/657263261463fe4fc816b96e_klaviyo-logo-horizontal-white.svg' },
    { id: 'web', name: 'Web', Icon: Globe },
];

function PlatformIcon({ platformId }: { platformId?: string }) {
    const platform = platforms.find(p => p.id === platformId) || platforms.find(p => p.id === 'sfmc'); // Default to SFMC
    if (!platform) return null;

    if (platform.Icon) {
        return <platform.Icon className="h-4 w-4 text-muted-foreground" />;
    }

    return <img src={platform.logo} alt={platform.name} className="h-4 w-auto object-contain" />;
}

function ProjectIcon({ iconName, color, className }: { iconName?: string; color?: string, className?: string }) {
    const Icon = projectIcons.find(i => i.name === iconName)?.icon || Folder;
    return <Icon className={cn("h-6 w-6", className)} style={{ color: color || 'hsl(var(--primary))' }} />;
}

function QuickSnippetPopover({ pageId }: { pageId: string }) {
    const { toast } = useToast();
    const [pageUrl, setPageUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPageUrl(`${window.location.origin}/api/pages/${pageId}`);
        }
    }, [pageId]);

    const snippet = `%%=TreatAsContentArea("CONTENT", HTTPGet("${pageUrl}", false, 0, @status))=%%`;

    const handleCopy = () => {
        navigator.clipboard.writeText(snippet);
        toast({ title: "Snippet copiado!" });
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 data-[state=open]:bg-muted"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Code className="h-4 w-4" />
                    <span className="sr-only">Copiar Snippet</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()}>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Snippet de Publicação</h4>
                        <p className="text-sm text-muted-foreground">
                            Cole este código em um bloco HTML na sua CloudPage.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="snippet-text">AMPScript</Label>
                        <Input id="snippet-text" value={snippet} readOnly className="h-auto p-2 font-mono text-xs"/>
                        <Button onClick={handleCopy} size="sm">
                            <Copy className="mr-2 h-4 w-4"/>
                            Copiar
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

interface AnalyticsDashboardProps {
  page: CloudPage;
}

function AnalyticsDashboard({ page }: AnalyticsDashboardProps) {
    const [views, setViews] = useState<PageView[]>([]);
    const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const fetchAnalyticsData = useCallback(() => {
        if (!page?.id) return;
        setIsRefreshing(true);
        const hasForm = page.components.some(c => c.type === 'Form');
        
        const promises = [getPageViews(page.id)];
        if (hasForm) {
            promises.push(getFormSubmissions(page.id) as any);
        }

        Promise.all(promises)
            .then(([pageViews, formSubmissions]) => {
                setViews(pageViews);
                if (formSubmissions) {
                    setSubmissions(formSubmissions);
                }
            })
            .finally(() => {
                setLoading(false);
                setIsRefreshing(false);
            });
    }, [page]);

    useEffect(() => {
        setLoading(true);
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);

    const totalViews = views.length;
    const uniqueCountries = useMemo(() => {
        const countries = new Set(views.map(v => v.country).filter(Boolean));
        return Array.from(countries);
    }, [views]);
    
    const downloadCSV = () => {
        if (submissions.length === 0) return;

        const headers = Object.keys(submissions[0].formData);
        const csvRows = [
            headers.join(','),
            ...submissions.map(row => 
                headers.map(header => JSON.stringify(row.formData[header] || '', (key, value) => value === null ? '' : value)).join(',')
            )
        ];

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\r\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `submissions_${page.id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button onClick={fetchAnalyticsData} variant="outline" disabled={isRefreshing}>
                    <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
                    Atualizar Dados
                </Button>
            </div>
            <Tabs defaultValue="views">
                <TabsList>
                    <TabsTrigger value="views">Visualizações</TabsTrigger>
                    {page.components.some(c => c.type === 'Form') && <TabsTrigger value="submissions">Submissões</TabsTrigger>}
                </TabsList>
                <TabsContent value="views" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-3 mb-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalViews}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Países Únicos</CardTitle>
                                <Globe className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{uniqueCountries.length}</div>
                            </CardContent>
                        </Card>
                    </div>
                     <Card>
                        <CardHeader>
                            <CardTitle>Acessos Recentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="relative w-full overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data</TableHead>
                                            <TableHead>País</TableHead>
                                            <TableHead>Cidade</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {views.slice(0, 10).map(view => (
                                            <TableRow key={view.id}>
                                                <TableCell>{view.timestamp?.toDate ? format(view.timestamp.toDate(), 'dd/MM/yyyy HH:mm:ss') : '-'}</TableCell>
                                                <TableCell>{view.country || 'N/A'}</TableCell>
                                                <TableCell>{view.city || 'N/A'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                             </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                {page.components.some(c => c.type === 'Form') && (
                    <TabsContent value="submissions" className="mt-4">
                        <Card>
                             <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Submissões do Formulário</CardTitle>
                                    <CardDescription>{submissions.length} registros encontrados.</CardDescription>
                                </div>
                                <Button onClick={downloadCSV} disabled={submissions.length === 0}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Exportar CSV
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="relative w-full overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Data</TableHead>
                                                 {submissions.length > 0 && Object.keys(submissions[0].formData).map(key => <TableHead key={key}>{key}</TableHead>)}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {submissions.map(submission => (
                                                <TableRow key={submission.id}>
                                                    <TableCell>{submission.timestamp?.toDate ? format(submission.timestamp.toDate(), 'dd/MM/yyyy HH:mm:ss') : '-'}</TableCell>
                                                    {submissions.length > 0 && Object.keys(submissions[0].formData).map(key => <TableCell key={key}>{submission.formData[key]}</TableCell>)}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

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
  const searchParams = useSearchParams();
  const { user, logout, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [project, setProject] = useState<Project | null>(null);
  const [pages, setPages] = useState<CloudPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageToDelete, setPageToDelete] = useState<CloudPage | null>(null);
  
  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Nova funcionalidade: Templates!', slug: 'criando-reutilizando-componentes-templates', read: false },
    { id: 2, title: 'Melhoria no alinhamento de formulários.', slug: 'melhoria-alinhamento-formularios', read: true },
    { id: 3, title: 'Bem-vindo ao CloudPage Studio!', slug: 'bem-vindo-cloudpage-studio', read: true },
  ]);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // View, filter and sort state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<SortOption>("updatedAt-desc");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('pages');
  
  // Mobile Warning Dialog
  const [isMobileWarningOpen, setIsMobileWarningOpen] = useState(false);
  const [pageToNavigate, setPageToNavigate] = useState<string | null>(null);

  const selectedPageId = searchParams.get('page');
  const selectedPage = useMemo(() => pages.find(p => p.id === selectedPageId), [pages, selectedPageId]);


  const fetchProjectData = useCallback(async () => {
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
  }, [projectId, user, toast, router]);

  useEffect(() => {
    if (!authLoading && user) {
        fetchProjectData();
    } else if (!authLoading && !user) {
        router.push('/login');
    }
  }, [user, authLoading, fetchProjectData, router]);

  // Effect to handle default analytics page selection
  useEffect(() => {
    if (activeTab === 'analytics' && pages.length > 0 && !selectedPageId) {
      router.push(`/project/${projectId}?page=${pages[0].id}`, { scroll: false });
    }
  }, [activeTab, pages, selectedPageId, projectId, router]);

  const handleDeletePage = async () => {
     if (!pageToDelete) return;
    try {
      await deletePage(pageToDelete.id);
      setPages(prev => prev.filter(p => p.id !== pageToDelete.id));
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
  
  const handleNotificationClick = (notificationId: number, slug: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    window.open(`https://blog.cloudpagestudio.app/${slug}`, '_blank');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
    <div className="flex items-center justify-end">
        <QuickSnippetPopover pageId={page.id} />
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
                    onSelect={(e) => { e.preventDefault(); setPageToDelete(page); }}
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
            <DropdownMenuItem onClick={() => {}}>
                <Bell className="mr-2 h-4 w-4" />
                Notificações
                 {unreadCount > 0 && <Badge className="ml-auto">{unreadCount}</Badge>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    const userInitials = user?.displayName?.split(' ').map(n => n[0]).join('') || user?.email?.[0].toUpperCase() || 'U';

    return (
       <>
        <CreatePageFromTemplateDialog
            projectId={projectId}
            trigger={
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Criar Página
                </Button>
            }
            onPageCreated={() => fetchProjectData()}
        />
        <Separator orientation="vertical" className="h-6 mx-2" />
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
            </PopoverTrigger>
            {searchTerm && filteredAndSortedPages.length > 0 && (
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                      <CommandGroup>
                          {filteredAndSortedPages.map(page => (
                              <CommandItem
                                  key={page.id}
                                  value={page.name}
                                  onSelect={() => handlePageClick(page.id)}
                                  className="cursor-pointer"
                              >
                                  {page.name}
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
                    Buscar páginas...
                </Button>
            )}
        </div>
      )
    }

    return searchInput;
  }

  return (
    <>
      <div className="min-h-screen bg-muted/40">
        <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b bg-card">
          <div className="flex items-center gap-2 md:gap-4 text-lg font-semibold">
            <h1 className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors text-base md:text-lg" onClick={() => router.push('/')}>
              Projetos
            </h1>
            <span className="text-muted-foreground">/</span>
             <div className="flex items-center gap-2">
                <ProjectIcon iconName={project.icon} color={project.color} />
                <h2 className="text-base md:text-lg">{project.name}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderHeaderActions()}
          </div>
        </header>

        <main className="p-4 md:p-6">
            <Tabs defaultValue="pages" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="pages">Páginas</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="pages">
                    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {renderSearch()}
                        <div className="flex items-center gap-2 flex-wrap justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium mr-2 hidden md:inline">Filtrar:</span>
                                <div className="flex items-center gap-1 rounded-md border bg-background p-1">
                                    <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className="h-8 w-8">
                                        <LayoutGrid className="h-4 w-4"/>
                                    </Button>
                                    <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className="h-8 w-8">
                                        <List className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <ArrowUpDown className="mr-2 h-4 w-4"/>
                                        Ordenar por
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setSortOption('updatedAt-desc')}>Última Modificação</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortOption('name-asc')}>Nome (A-Z)</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                     <div className="mb-4 flex flex-wrap gap-2">
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
                            >
                                <div className="absolute top-2 left-2 z-10 bg-card/80 backdrop-blur-sm p-1.5 rounded-full">
                                    <PlatformIcon platformId={page.platform} />
                                </div>
                                <div className="absolute top-1 right-1 z-10 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {pageActions(page)}
                                </div>
                                <div
                                    className="aspect-[4/3] w-full bg-muted/50 rounded-t-lg flex flex-col items-center justify-center p-4 overflow-hidden cursor-pointer"
                                    onClick={() => handlePageClick(page.id)}
                                >
                                    <div className="w-full h-full border-2 border-dashed rounded-md flex flex-col p-2 gap-1.5 bg-background">
                                        <div className="h-4 w-1/3 bg-muted rounded"></div>
                                        <div className="h-2 w-full bg-muted rounded"></div>
                                        <div className="h-2 w-full bg-muted rounded"></div>
                                        <div className="h-2 w-2/3 bg-muted rounded"></div>
                                    </div>
                                </div>
                                
                                <div className="p-4 flex-grow flex flex-col justify-between" onClick={() => handlePageClick(page.id)}>
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
                                <TableHead>Plataforma</TableHead>
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
                                <TableCell><PlatformIcon platformId={page.platform} /></TableCell>
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
                </TabsContent>
                <TabsContent value="analytics">
                    {pages.length > 0 ? (
                        <>
                            <Select onValueChange={(pageId) => router.push(`/project/${projectId}?page=${pageId}`)} value={selectedPageId || pages[0].id}>
                                <SelectTrigger className="w-full md:w-[300px] mb-4">
                                    <SelectValue placeholder="Selecione uma página para ver as análises" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pages.map(page => (
                                        <SelectItem key={page.id} value={page.id}>{page.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedPage && <AnalyticsDashboard page={selectedPage} />}
                        </>
                    ) : (
                         <div className="text-center py-16">
                            <LineChart size={48} className="mx-auto text-muted-foreground" />
                            <h2 className="mt-4 text-xl font-semibold">Sem dados para analisar</h2>
                            <p className="mt-2 text-muted-foreground">Crie e publique sua primeira página para começar a coletar dados.</p>
                         </div>
                    )}
                </TabsContent>
            </Tabs>
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

      <AlertDialog open={!!pageToDelete} onOpenChange={(open) => !open && setPageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a página "{pageToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPageToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePage}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
