

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CloudPage, PageComponent, Template, OnboardingObjectives } from "@/lib/types";
import { generateHtml } from "@/lib/html-generator";
import { SettingsPanel } from "./settings-panel";
import { MainPanel } from "./main-panel";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2, RotateCcw, CopyPlus, X, Settings, Info, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updatePage, getPage, addTemplate, updateUserProgress, publishPage } from "@/lib/firestore";
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


interface CloudPageForgeProps {
  pageId: string;
}

// Custom hook for state history
const useHistoryState = <T>(initialState: T) => {
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
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [initialPageState, setInitialPageState] = useState<CloudPage | null>(null);
  const [savedPageState, setSavedPageState] = useState<CloudPage | null>(null);
  const { state: pageState, setState: setPageState, undo, canUndo, resetState } = useHistoryState<CloudPage | null>(initialPageState);
  
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [pageName, setPageName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isSaveTemplateModalOpen, setSaveTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);


  const hasUnsavedChanges = JSON.stringify(pageState) !== JSON.stringify(savedPageState) || pageName !== savedPageState?.name;
  
  const selectedComponent = pageState?.components.find(c => c.id === selectedComponentId);


  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }
    if (!user) {
      router.push('/login');
      return;
    }
    
    const fetchPage = async () => {
      setIsLoading(true);
      try {
        if (pageId !== "new") {
          let pageData = await getPage(pageId, 'drafts'); // Always edit the draft
          if (pageData && pageData.userId === user.uid) {
            pageData = produce(pageData, draft => {
              let maxOrder = -1;
              draft.components.forEach(c => {
                // Initialize parentId to null if it's undefined
                if (c.parentId === undefined) {
                  c.parentId = null;
                }
                 // Initialize order if it's undefined
                if (c.parentId === null) {
                  if (typeof c.order !== 'number') {
                    maxOrder++;
                    c.order = maxOrder;
                  } else if (c.order > maxOrder) {
                    maxOrder = c.order;
                  }
                }
              });

              // Handle children ordering
              const parents = draft.components.filter(c => c.type === 'Columns');
              parents.forEach(p => {
                let maxChildOrder = -1;
                draft.components.forEach(c => {
                  if (c.parentId === p.id) {
                    if (typeof c.order !== 'number') {
                      maxChildOrder++;
                      c.order = maxChildOrder;
                    } else if (c.order > maxChildOrder) {
                      maxChildOrder = c.order;
                    }
                  }
                });
              });
            });

            const cleanPageState = { ...pageData, name: pageData.name };
            setInitialPageState(cleanPageState);
            setSavedPageState(cleanPageState); // Set the initial saved state
            resetState(cleanPageState); // Initialize history
            setPageName(cleanPageState.name);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, router, user, toast, authLoading, searchParams]);
  
  
  useEffect(() => {
    if (!pageState) return;
  
    const brand = pageState.brand;
    const isAvon = brand === 'Avon';
  
    const naturaLogo = 'https://i.postimg.cc/Z5TpsSsB/natura-logo-branco.png';
    const naturaFavicon = 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.natura.com.br/&size=64';
    const naturaLoader = 'https://arcgis.natura.com.br/portal/sharing/rest/content/items/32111ed7537b474db26ed253c721117a/data';
  
    const avonLogo = 'https://gkpb.com.br/wp-content/uploads/2021/01/novo-logo-avon-png.png';
    const avonFavicon = 'https://image.hello.natura.com/lib/fe3611717164077c741373/m/1/7b699e43-8471-4819-8c79-5dd747e5df47.png';
    const avonLoader = 'https://image.hello.natura.com/lib/fe3611717164077c741373/m/1/7b699e43-8471-4819-8c79-5dd747e5df47.png';
  
    setPageState(prev => {
        if (!prev) return null;
        let needsUpdate = false;
        
        const newLogo = isAvon ? avonLogo : naturaLogo;
        const newFavicon = isAvon ? avonFavicon : naturaFavicon;
        const newLoader = isAvon ? avonLoader : naturaLoader;

        // Use a deep copy to avoid direct state mutation
        const newState = JSON.parse(JSON.stringify(prev));

        if (newState.meta.faviconUrl !== newFavicon || newState.meta.loaderImageUrl !== newLoader) {
            needsUpdate = true;
            newState.meta.faviconUrl = newFavicon;
            newState.meta.loaderImageUrl = newLoader;
        }
        
        const headerIndex = newState.components.findIndex((c: PageComponent) => c.type === 'Header');
        if (headerIndex !== -1 && newState.components[headerIndex].props.logoUrl !== newLogo) {
            needsUpdate = true;
            newState.components[headerIndex].props.logoUrl = newLogo;
        }

        const footerIndex = newState.components.findIndex((c: PageComponent) => c.type === 'Footer');
        if (footerIndex !== -1) {
            const currentYear = new Date().getFullYear();
            const newFooterText = `© ${currentYear} ${brand}. Todos os direitos reservados.`;
            if (newState.components[footerIndex].props.footerText1 !== newFooterText) {
                needsUpdate = true;
                newState.components[footerIndex].props.footerText1 = newFooterText;
            }
        }
        
        // Only update state if there are actual changes
        return needsUpdate ? newState : prev;
    });

  }, [pageState?.brand, setPageState]);
  
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
    
    // Check for first form added
    if (savedPage.components.some(c => c.type === 'Form')) {
      const updatedProgress = await updateUserProgress(user.uid, 'addedFirstForm');
      if (updatedProgress.objectives.addedFirstForm) {
        toast({
          title: "🎉 Objetivo Concluído!",
          description: "Você adicionou seu primeiro formulário."
        });
      }
    }
    
    // Check for first AMPScript added
    if (savedPage.meta.customAmpscript && savedPage.meta.customAmpscript.trim() !== '') {
      const updatedProgress = await updateUserProgress(user.uid, 'addedFirstAmpscript');
       if (updatedProgress.objectives.addedFirstAmpscript) {
        toast({
          title: "🎉 Objetivo Concluído!",
          description: "Você adicionou seu primeiro AMPScript."
        });
      }
    }
  };

  const handleSave = async () => {
    if (!pageState || !user) return;
    setIsSaving(true);
    
    try {
      const finalPageState = { 
          ...pageState, 
          name: pageName,
          userId: user.uid,
      };
      await updatePage(pageId, finalPageState);
      // After saving, update the saved state and reset history.
      setSavedPageState(finalPageState);
      resetState(finalPageState);
      toast({ 
        title: "Rascunho salvo!",
        description: `Suas alterações na página "${pageName}" foram salvas.`,
      });

      // Check onboarding progress after saving
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
      try {
          const finalPageState = { 
              ...pageState, 
              name: pageName,
              userId: user.uid,
          };
          // First, save any pending changes to the draft
          if (hasUnsavedChanges) {
              await updatePage(pageId, finalPageState);
              setSavedPageState(finalPageState);
              resetState(finalPageState);
          }
          // Now, publish the saved state to the live version
          await publishPage(pageId, finalPageState);
          
          toast({
              title: "Página publicada!",
              description: `As alterações em "${pageName}" estão agora disponíveis publicamente.`,
              action: (
                <ToastAction altText="Como publicar?" onClick={() => setIsHowToUseOpen(true)}>
                  <Info className="mr-2 h-4 w-4" />
                  Ver URL
                </ToastAction>
              ),
          });
      } catch (error) {
          toast({ variant: "destructive", title: "Erro ao publicar", description: "Não foi possível publicar a página." });
          console.error("Publish error:", error);
      } finally {
          setIsPublishing(false);
      }
  };

  const handleSaveAsTemplate = async () => {
    if (!pageState || !user) return;
    if (!templateName.trim()) {
        toast({ variant: "destructive", title: "Erro", description: "O nome do template é obrigatório." });
        return;
    }
    setIsSavingTemplate(true);

    try {
        const { id, projectId, userId, createdAt, updatedAt, meta, ...restOfPage } = pageState;
        const { dataExtensionKey, redirectUrl, tracking, security, ...restOfMeta } = meta;

        const templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'> = {
            ...restOfPage,
            name: templateName,
            description: templateDescription,
            createdBy: user.uid,
            meta: restOfMeta,
        };

        await addTemplate(templateData);
        toast({ title: "Template salvo!", description: `O template "${templateName}" foi criado com sucesso.` });
        setSaveTemplateModalOpen(false);
        setTemplateName("");
        setTemplateDescription("");
        
        // Check onboarding progress
        const updatedProgress = await updateUserProgress(user.uid, 'createdFirstTemplate');
         if (updatedProgress.objectives.createdFirstTemplate) {
            toast({
              title: "🎉 Objetivo Concluído!",
              description: "Você criou seu primeiro template."
            });
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
        return; // User canceled the navigation
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
            <Button variant="outline" onClick={undo} disabled={!canUndo}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Desfazer
            </Button>
            <Dialog open={isSaveTemplateModalOpen} onOpenChange={setSaveTemplateModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <CopyPlus className="mr-2 h-4 w-4" />
                  Salvar como Template
                </Button>
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
            <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges} variant="secondary">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>
             <Button onClick={handlePublish} disabled={isPublishing || isSaving}>
                {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                {isPublishing ? 'Publicando...' : 'Publicar'}
            </Button>
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
                        pageName={pageName}
                        setPageName={setPageName}
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

       <Sheet open={!!selectedComponentId} onOpenChange={(open) => !open && setSelectedComponentId(null)}>
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
