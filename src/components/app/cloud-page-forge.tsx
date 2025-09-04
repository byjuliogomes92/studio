
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CloudPage, PageComponent, Template, OnboardingObjectives, Brand } from "@/lib/types";
import { generateHtml } from "@/lib/html-generator";
import { SettingsPanel } from "./settings-panel";
import { MainPanel } from "./main-panel";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2, RotateCcw, CopyPlus, X, Settings, Info, UploadCloud, Copy, Share2, ExternalLink, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updatePage, getPage, addTemplate, updateUserProgress, publishPage, getBrand, logActivity, getPagesForProject } from "@/lib/firestore";
import { useAuth } from "@/hooks/use-auth";
import { produce } from "immer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ComponentSettings } from "./component-settings";
import { ScrollArea } from "../ui/scroll-area";
import { ToastAction } from "../ui/toast";
import { Switch } from "../ui/switch";
import { shortenUrl } from "@/ai/flows/shorten-url-flow";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";


interface CloudPageForgeProps {
  pageId: string;
}

// Custom hook for state history
const useHistoryState = <T,>(initialState: T) => {
    const [history, setHistory] = useState<T[]>([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const setState = (newState: T | ((prevState: T) => T)) => {
        const resolvedState = typeof newState === 'function' ? (newState as (prevState: T) => T)(history[currentIndex]) : newState;

        // Prevent pushing duplicate states
        if (JSON.stringify(resolvedState) === JSON.stringify(history[currentIndex])) {
            return;
        }

        const newHistory = history.slice(0, currentIndex + 1);
        newHistory.push(resolvedState);
        setHistory(newHistory);
        setCurrentIndex(newHistory.length - 1);
    };

    const undo = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prevIndex => prevIndex - 1);
        }
    }, [currentIndex]);

    const canUndo = currentIndex > 0;
    const currentState = history[currentIndex];

    // Function to initialize or reset the state and history
    const resetState = (newState: T) => {
        setHistory([newState]);
        setCurrentIndex(0);
    }

    return { state: currentState, setState, undo, canUndo, resetState };
};

export function CloudPageForge({ pageId }: CloudPageForgeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, activeWorkspace } = useAuth();
  const { toast } = useToast();

  const [initialPageState, setInitialPageState] = useState<CloudPage | null>(null);
  const [savedPageState, setSavedPageState] = useState<CloudPage | null>(null);
  const { state: pageState, setState: setPageState, undo, canUndo, resetState } = useHistoryState<CloudPage | null>(initialPageState);
  
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isSaveTemplateModalOpen, setSaveTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [projectPages, setProjectPages] = useState<CloudPage[]>([]);
  
  // New state for publish modal
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [pageSlug, setPageSlug] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [useBitly, setUseBitly] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);

  const hasUnsavedChanges = JSON.stringify(pageState) !== JSON.stringify(savedPageState);
  const hasBitlyConfig = !!(brand && brand.integrations?.bitly?.encryptedAccessToken);

  const selectedComponent = pageState?.components.find(c => c.id === selectedComponentId) ?? null;


  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }
    if (!user || !activeWorkspace) {
      router.push('/login');
      return;
    }
    
    const fetchPage = async () => {
      setIsLoading(true);
      try {
        if (pageId !== "new") {
          let pageData = await getPage(pageId, 'drafts'); // Always edit the draft
          
          if (pageData && pageData.workspaceId === activeWorkspace.id) {
            pageData = produce(pageData, draft => {
              if (!draft.slug) {
                  draft.slug = pageData.id;
              }
              let maxOrder = -1;
              draft.components.forEach(c => {
                if (c.parentId === undefined) c.parentId = null;
                if (c.parentId === null) {
                  if (typeof c.order !== 'number') c.order = ++maxOrder;
                  else if (c.order > maxOrder) maxOrder = c.order;
                }
              });
              const parents = draft.components.filter(c => c.type === 'Columns' || c.type === 'Div');
              parents.forEach(p => {
                let maxChildOrder = -1;
                draft.components.forEach(c => {
                  if (c.parentId === p.id) {
                    if (typeof c.order !== 'number') c.order = ++maxChildOrder;
                    else if (c.order > maxChildOrder) maxChildOrder = c.order;
                  }
                });
              });
            });

            const cleanPageState = { ...pageData, name: pageData.name };
            setInitialPageState(cleanPageState);
            setSavedPageState(cleanPageState);
            resetState(cleanPageState);
            setPageSlug(pageData.slug || pageData.id);

            if(pageData.brandId) {
                const brandData = await getBrand(pageData.brandId);
                setBrand(brandData);
            }
            if (pageData.projectId) {
                const pages = await getPagesForProject(pageData.projectId, activeWorkspace.id);
                setProjectPages(pages);
            }

          } else {
            toast({ variant: "destructive", title: "Erro", description: "Página não encontrada ou acesso negado." });
            router.push('/');
          }
        } else {
           toast({ variant: "destructive", title: "Erro", description: "Página inválida. Retornando ao projeto." });
           const projectId = searchParams.get('projectId');
           router.push(projectId ? `/project/${projectId}` : '/');
        }
      } catch (error) {
        console.error("Failed to fetch page:", error);
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar a página." });
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    if(!authLoading && user) {
        fetchPage();
    }
  }, [pageId, router, user, toast, authLoading, searchParams, activeWorkspace]);
  
  
  useEffect(() => {
    if (pageState?.slug) {
        setPageUrl(`${window.location.origin}/api/pages/${pageState.slug}`);
    }
  }, [pageState?.slug]);

  
  // Keyboard shortcut for Undo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        if(canUndo) {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, canUndo]);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Required for legacy browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const checkOnboardingProgress = async (savedPage: CloudPage) => {
    if (!user) return;
    if (savedPage.components.some(c => c.type === 'Form')) {
      const updatedProgress = await updateUserProgress(user.uid, 'addedFirstForm');
      if (updatedProgress.objectives.addedFirstForm) {
        toast({ title: "🎉 Objetivo Concluído!", description: "Você adicionou seu primeiro formulário." });
      }
    }
    if (savedPage.meta.customAmpscript && savedPage.meta.customAmpscript.trim() !== '') {
      const updatedProgress = await updateUserProgress(user.uid, 'addedFirstAmpscript');
       if (updatedProgress.objectives.addedFirstAmpscript) {
        toast({ title: "🎉 Objetivo Concluído!", description: "Você adicionou seu primeiro AMPScript." });
      }
    }
  };

  const handleSave = async () => {
    if (!pageState || !user) return;
    setIsSaving(true);
    try {
      const finalPageState = { ...pageState };
      await updatePage(pageId, finalPageState);
      setSavedPageState(finalPageState);
      resetState(finalPageState);
      toast({ title: "Rascunho salvo!", description: `Suas alterações na página "${pageState.name}" foram salvas.` });
      await checkOnboardingProgress(finalPageState);
    } catch(error) {
         toast({ variant: "destructive", title: "Erro ao salvar", description: "Não foi possível salvar a página." });
         console.error("Save error:", error);
    } finally {
        setIsSaving(false);
    }
  };

  const handlePublish = async () => {
      if (!pageState || !user) return;
      setIsPublishing(true);
      
      const finalPageState = { ...pageState, slug: pageSlug };

      try {
          if (hasUnsavedChanges) {
              await updatePage(pageId, finalPageState);
              setSavedPageState(finalPageState);
              resetState(finalPageState);
          }
          
          await publishPage(pageId, finalPageState, user.uid);

          if (useBitly && hasBitlyConfig) {
              const result = await shortenUrl({ brandId: pageState.brandId, longUrl: pageUrl });
              setShortUrl(result.shortUrl);
              toast({ title: "Página Publicada e Link Encurtado!", description: "Suas alterações estão no ar." });
          } else {
              toast({ title: "Página publicada!", description: `As alterações em "${finalPageState.name}" estão agora disponíveis publicamente.` });
          }

      } catch (error: any) {
          toast({ variant: "destructive", title: "Erro ao publicar", description: error.message || "Não foi possível publicar a página." });
          console.error("Publish error:", error);
      } finally {
          setIsPublishing(false);
      }
  };

  const handleSaveAsTemplate = async () => {
    if (!pageState || !user || !activeWorkspace) return;
    if (!templateName.trim()) {
        toast({ variant: "destructive", title: "Erro", description: "O nome do template é obrigatório." });
        return;
    }
    setIsSavingTemplate(true);

    try {
        const { id, projectId, createdAt, updatedAt, meta, ...restOfPage } = pageState;
        const { dataExtensionKey, redirectUrl, tracking, security, ...restOfMeta } = meta;

        const templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'> = {
            ...restOfPage,
            workspaceId: activeWorkspace.id,
            name: templateName,
            description: templateDescription,
            // @ts-ignore - brand is a legacy property for default templates
            brand: restOfPage.brandName, // Keep brand for reference if needed
            createdBy: user.uid,
            meta: restOfMeta,
        };

        await addTemplate(templateData, user.uid);
        toast({ title: "Template salvo!", description: `O template "${templateName}" foi criado com sucesso.` });
        setSaveTemplateModalOpen(false);
        setTemplateName("");
        setTemplateDescription("");
        
        const updatedProgress = await updateUserProgress(user.uid, 'createdFirstTemplate');
         if (updatedProgress.objectives.createdFirstTemplate) {
            toast({ title: "🎉 Objetivo Concluído!", description: "Você criou seu primeiro template." });
         }
    } catch (error) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar o template." });
        console.error("Save template error:", error);
    } finally {
        setIsSavingTemplate(false);
    }
  };
  
  const handleDataExtensionKeyChange = (newKey: string) => {
    setPageState((prev) => {
        if (!prev) return null;
        return {
            ...prev,
            meta: {
                ...prev.meta,
                dataExtensionKey: newKey,
            },
        };
    });
  };

  const handleBackNavigation = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm("Você tem alterações não salvas. Deseja sair mesmo assim?")) {
        return; 
      }
    }
    if (pageState?.projectId) {
      router.push(`/project/${pageState.projectId}`);
    } else {
       const projectId = searchParams.get('projectId');
       if (projectId) {
         router.push(`/project/${projectId}`);
       } else {
         router.push('/');
       }
    }
  };

  const handleComponentChange = (componentId: string, newProps: Partial<PageComponent>) => {
    setPageState(prev => {
        if (!prev) return null;
        return {
            ...prev,
            components: prev.components.map(c => 
                c.id === componentId ? { ...c, ...newProps } : c
            )
        };
    });
  };
  
  const handlePageNameChange = (newName: string) => {
    setPageState(prev => prev ? { ...prev, name: newName } : null);
  };
  
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "URL copiada!" });
  };

  if (isLoading || authLoading || !pageState) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
            <Logo className="h-10 w-10 animate-spin text-primary" />
       </div>
    );
  }

  return (
    <>
    <div className="flex flex-col h-screen bg-muted/40">
      <header className="flex items-center justify-between h-14 px-4 border-b flex-shrink-0 bg-card">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBackNavigation}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6 text-primary" />
            <h1>CloudPage Studio</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges} variant="secondary">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
             <Dialog open={isPublishModalOpen} onOpenChange={setIsPublishModalOpen}>
              <DialogTrigger asChild>
                <Button disabled={isPublishing || isSaving}>
                  {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                  {isPublishing ? 'Publicando...' : 'Publicar'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Publicar Página</DialogTitle>
                  <DialogDescription>
                    Configure a URL final e confirme a publicação.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="page-slug">Slug da URL</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground p-2 rounded-md bg-muted whitespace-nowrap">.../api/pages/</span>
                            <Input id="page-slug" value={pageSlug} onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="min-w-0" />
                        </div>
                    </div>
                    {hasBitlyConfig && (
                        <div className="flex items-center space-x-2">
                            <Switch id="use-bitly" checked={useBitly} onCheckedChange={setUseBitly} />
                            <Label htmlFor="use-bitly">Encurtar URL com Bitly</Label>
                        </div>
                    )}
                    {(shortUrl || pageUrl) && !isPublishing && (
                      <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
                        <h4 className="font-medium text-sm">URL Final</h4>
                        {shortUrl && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">URL Curta (Bitly)</Label>
                            <div className="flex items-center justify-between gap-2">
                              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-mono truncate hover:underline min-w-0">{shortUrl}</a>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyUrl(shortUrl)}><Copy className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(shortUrl, '_blank')}><ExternalLink className="h-4 w-4"/></Button>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">URL Completa</Label>
                          <div className="flex items-center justify-between gap-2">
                            <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-mono truncate hover:underline min-w-0 break-all">{pageUrl}</a>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyUrl(pageUrl)}><Copy className="h-4 w-4"/></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(pageUrl, '_blank')}><ExternalLink className="h-4 w-4"/></Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPublishModalOpen(false)}>Cancelar</Button>
                  <Button onClick={handlePublish} disabled={isPublishing}>
                    {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirmar e Publicar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Mais opções</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={undo} disabled={!canUndo}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Desfazer
                    </DropdownMenuItem>
                    <Dialog open={isSaveTemplateModalOpen} onOpenChange={setSaveTemplateModalOpen}>
                        <DialogTrigger asChild>
                             <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <CopyPlus className="mr-2 h-4 w-4" />
                                Salvar como Template
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                            <DialogTitle>Salvar como Template</DialogTitle>
                            <DialogDescription>
                                Salve a estrutura e o conteúdo desta página como um template reutilizável.
                            </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="template-name">Nome do Template</Label>
                                <Input id="template-name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="template-description">Descrição</Label>
                                <Textarea id="template-description" value={templateDescription} onChange={(e) => setTemplateDescription(e.target.value)} />
                            </div>
                            </div>
                            <DialogFooter>
                            <Button variant="outline" onClick={() => setSaveTemplateModalOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSaveAsTemplate} disabled={isSavingTemplate}>
                                {isSavingTemplate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar Template
                            </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
      <div className="flex flex-grow overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-grow">
            <ResizablePanel defaultSize={25} minSize={20}>
                <aside className="h-full bg-card/20">
                    <SettingsPanel
                        pageState={pageState}
                        setPageState={setPageState}
                        selectedComponentId={selectedComponentId}
                        setSelectedComponentId={setSelectedComponentId}
                        pageName={pageState.name}
                        onPageNameChange={handlePageNameChange}
                        projectPages={projectPages}
                    />
                </aside>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={75}>
                <main className="flex-grow h-full">
                    <MainPanel 
                        pageState={pageState} 
                        setPageState={setPageState}
                        onDataExtensionKeyChange={handleDataExtensionKeyChange}
                    />
                </main>
            </ResizablePanel>
        </ResizablePanelGroup>
      </div>

       <Sheet open={!!selectedComponent} onOpenChange={(open) => !open && setSelectedComponentId(null)}>
            <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col">
                {selectedComponent && (
                    <>
                    <SheetHeader className="p-6">
                        <SheetTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Configurações de {selectedComponent.type}
                        </SheetTitle>
                        <SheetDescription>
                            Ajuste as propriedades do componente selecionado.
                        </SheetDescription>
                    </SheetHeader>
                    <ScrollArea className="flex-grow">
                        <div className="px-6 pb-6">
                             <ComponentSettings
                                key={selectedComponent.id}
                                component={selectedComponent}
                                onComponentChange={handleComponentChange}
                                projectPages={projectPages}
                            />
                        </div>
                    </ScrollArea>
                    </>
                )}
            </SheetContent>
        </Sheet>
    </div>
    </>
  );
}

    
