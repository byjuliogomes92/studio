
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Brand, Project, CloudPage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Plus, Trash2, X, Copy, Bell, Search } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { getProjectWithPages, deletePage, addPage, duplicatePage } from "@/lib/firestore";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PageListProps {
  projectId: string;
}

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

const getInitialPage = (name: string, projectId: string, userId: string, brand: Brand): Omit<CloudPage, 'id' | 'createdAt' | 'updatedAt'> => {
  const isAvon = brand === 'Avon';

  const naturaTheme = {
    backgroundColor: '#FFFFFF',
    backgroundImage: 'https://images.rede.natura.net/html/crm/campanha/20250819/44760-bg.png',
    themeColor: '#F4AB01',
    themeColorHover: '#e9a000',
  };

  const avonTheme = {
    backgroundColor: '#E4004B',
    backgroundImage: 'https://images.rede.natura.net/html/crm/campanha/20250819/44760-bg.png',
    themeColor: '#000000',
    themeColorHover: '#333333',
  }
  
  return {
    name: name,
    projectId,
    userId,
    brand,
    tags: ["Brasil"],
    meta: {
      title: `${brand} - ${name}`,
      faviconUrl: '', // Will be set by useEffect in CloudPageForge
      loaderImageUrl: '', // Will be set by useEffect in CloudPageForge
      redirectUrl: isAvon ? 'https://cloud.hello.avon.com/cadastroavonagradecimento' : 'https://www.natura.com.br/',
      dataExtensionKey: 'CHANGE-ME',
      metaDescription: `Página de campanha para ${brand}.`,
      metaKeywords: `${brand.toLowerCase()}, campanha, beleza`,
      tracking: {
        ga4: { enabled: false, id: '' },
        meta: { enabled: false, id: '' },
        linkedin: { enabled: false, id: '' }
      }
    },
    styles: isAvon ? avonTheme : naturaTheme,
    cookieBanner: {
      enabled: true,
      text: 'Utilizamos cookies para garantir que você tenha a melhor experiência em nosso site. Ao continuar, você concorda com o uso de cookies.',
      buttonText: 'Aceitar',
    },
    components: [
      { id: '1', type: 'Header', props: { logoUrl: '' } }, // Will be set by useEffect
      { id: '2', type: 'Banner', props: { imageUrl: 'https://images.rede.natura.net/html/crm/campanha/20250819/44760-banner-topo.png' } },
      { id: 'c1', type: 'Title', props: { text: 'Título da Sua Campanha Aqui', styles: { textAlign: 'center' } } },
      { id: 'c2', type: 'Paragraph', props: { text: 'Este é um ótimo lugar para descrever sua campanha. Fale sobre os benefícios, os produtos em destaque e o que os clientes podem esperar.' } },
      { id: 'c-button', type: 'Button', props: { text: 'Clique Aqui', href: '#', align: 'center' } },
      { 
        id: '3', 
        type: 'Form', 
        props: {
          fields: { name: true, email: true, phone: true, cpf: true, city: false, birthdate: false, optin: true },
          placeholders: { name: 'Nome', email: 'Email', phone: 'Telefone - Ex:(11) 9 9999-9999', cpf: 'CPF', birthdate: 'Data de Nascimento' },
          consentText: `Quero receber novidades e promoções da ${brand} e de outras empresas do Grupo Natura &Co...`,
          buttonText: 'Finalizar',
          buttonAlign: 'center',
          cities: 'São Paulo\nRio de Janeiro\nBelo Horizonte\nSalvador\nFortaleza\nCuritiba\nManaus\nRecife\nPorto Alegre\nBrasília',
        } 
      },
      { 
        id: '4', 
        type: 'Footer', 
        props: { 
          footerText1: ``, // Will be set by useEffect
          footerText2: `...`,
          footerText3: `...`,
        }
      },
    ],
  }
};

export function PageList({ projectId }: PageListProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [pages, setPages] = useState<CloudPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Create Page Dialog State
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<Brand>("Natura");


  useEffect(() => {
    const fetchData = async () => {
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

    if (!authLoading && user) {
        fetchData();
    } else if (!authLoading && !user) {
        router.push('/login');
    }
  }, [projectId, user, authLoading, toast, router]);

  const handleConfirmCreatePage = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado." });
        return;
    }
    if (!newPageName.trim()) {
        toast({ variant: "destructive", title: "Erro", description: "O nome da página não pode ser vazio." });
        return;
    }
    setIsCreating(true);
    try {
        const newPageData = getInitialPage(newPageName, projectId, user.uid, selectedBrand);
        const newPageId = await addPage(newPageData);
        toast({ title: "Página criada!", description: `A página "${newPageName}" foi criada com sucesso.` });
        setCreateModalOpen(false);
        setNewPageName("");
        navigateToEditor(newPageId);
    } catch(error) {
        console.error("Failed to create page:", error);
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível criar a página." });
    } finally {
        setIsCreating(false);
    }
  };


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
  
  const navigateToEditor = (pageId: string) => {
    router.push(`/editor/${pageId}?projectId=${projectId}`);
  }

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    pages.forEach(page => {
        (page.tags || []).forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [pages]);

  const filteredPages = useMemo(() => {
    return pages.filter(page => {
        const matchesTag = activeTag ? (page.tags || []).includes(activeTag) : true;
        const matchesSearch = page.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTag && matchesSearch;
    });
  }, [pages, activeTag, searchTerm]);

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
            <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Criar Página
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Criar Nova Página</DialogTitle>
                        <DialogDescription>Escolha um nome e uma marca para sua nova CloudPage.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="page-name">Nome da Página</Label>
                            <Input 
                                id="page-name" 
                                value={newPageName} 
                                onChange={(e) => setNewPageName(e.target.value)} 
                                placeholder="Ex: Campanha Dia das Mães"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Marca</Label>
                            <RadioGroup defaultValue="Natura" value={selectedBrand} onValueChange={(value: Brand) => setSelectedBrand(value)} className="flex gap-4">
                                <Label htmlFor="brand-natura" className="flex items-center gap-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-accent has-[:checked]:bg-accent has-[:checked]:border-primary">
                                    <RadioGroupItem value="Natura" id="brand-natura" />
                                    Natura
                                </Label>
                                <Label htmlFor="brand-avon" className="flex items-center gap-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-accent has-[:checked]:bg-accent has-[:checked]:border-primary">
                                    <RadioGroupItem value="Avon" id="brand-avon" />
                                    Avon
                                </Label>
                            </RadioGroup>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleConfirmCreatePage} disabled={isCreating}>
                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isCreating ? "Criando..." : "Criar Página"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
                <span className="text-sm font-medium mr-2">Filtrar por tag:</span>
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


          {filteredPages.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={48} className="mx-auto text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">Nenhuma página encontrada</h2>
              <p className="mt-2 text-muted-foreground">
                  {searchTerm || activeTag ? "Ajuste seus filtros ou " : "Comece criando a primeira página para este projeto."}
                  {searchTerm && !activeTag && <Button variant="link" onClick={() => setSearchTerm('')}>limpe a busca</Button>}
              </p>
               {!searchTerm && !activeTag && (
                <Button onClick={() => setCreateModalOpen(true)} className="mt-6">
                    <Plus className="mr-2 h-4 w-4" /> Criar Página
                </Button>
               )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPages.map((page) => (
                <div
                  key={page.id}
                  className="group relative flex flex-col bg-card p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-grow cursor-pointer" onClick={() => navigateToEditor(page.id)}>
                      <div className="flex items-start justify-between">
                        <FileText className="h-10 w-10 text-primary" />
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => { e.stopPropagation(); handleDuplicatePage(page.id); }}
                            >
                                <Copy className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <AlertDialog onOpenChange={(open) => !open && setPageToDelete(null)}>
                            <AlertDialogTrigger asChild>
                                <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => { e.stopPropagation(); setPageToDelete(page.id); }}
                                >
                                <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
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
                        </div>
                      </div>
                      <h3 className="mt-4 font-semibold">{page.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {page.updatedAt?.toDate ? `Editado em: ${new Date(page.updatedAt.toDate()).toLocaleDateString()}` : 'Recém-criado'}
                      </p>
                  </div>
                  <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                      {(page.tags || []).map(tag => (
                        <Badge key={tag} className={cn('border', getTagColor(tag))}>{tag}</Badge>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

    