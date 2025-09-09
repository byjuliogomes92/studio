
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CloudPage, PageComponent, Template, OnboardingObjectives, Brand, PageComment, EditorMode, ComponentType } from "@/lib/types";
import { generateHtml } from "@/lib/html-generator";
import { SettingsPanel } from "./settings-panel";
import { MainPanel } from "./main-panel";
import { LogoIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2, RotateCcw, CopyPlus, X, Settings, Info, UploadCloud, Copy, Share2, ExternalLink, MoreVertical, Code, Trash2, PanelLeftOpen, PanelLeftClose, Hand, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updatePage, getPage, addTemplate, updateUserProgress, publishPage, getBrand, logActivity, getPagesForProject, getCommentsForPage } from "@/lib/firestore";
import { useAuth } from "@/hooks/use-auth";
import { produce } from "immer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { ComponentSettings } from "./settings/component-settings";
import { ScrollArea } from "../ui/scroll-area";
import { ToastAction } from "../ui/toast";
import { Switch } from "../ui/switch";
import { shortenUrl } from "@/ai/flows/shorten-url-flow";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { EditCodeDialog } from "./edit-code-dialog";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { addPageComment } from "@/lib/firestore";
import { copyToClipboard } from "@/lib/utils";


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

// Function to recursively clean undefined values from an object
const cleanUndefined = (obj: any): any => {
    if (obj === null || obj === undefined) {
        return null;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => cleanUndefined(item)).filter(item => item !== undefined);
    }
    if (typeof obj === 'object') {
        const newObj: { [key: string]: any } = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                if (value !== undefined) {
                    newObj[key] = cleanUndefined(value);
                }
            }
        }
        return newObj;
    }
    return obj;
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
  const [useBitly, setUseBitly] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);

  // State for Edit Code Dialog
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [componentToCodeEdit, setComponentToCodeEdit] = useState<PageComponent | null>(null);
  
  // State for resizable panels
  const sidebarPanelRef = useRef<ImperativePanelHandle>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // State for editor modes
  const [editorMode, setEditorMode] = useState<EditorMode>('none');
  const [comments, setComments] = useState<PageComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);


  const hasUnsavedChanges = JSON.stringify(pageState) !== JSON.stringify(savedPageState);
  const hasBitlyConfig = !!(brand && brand.integrations?.bitly?.encryptedAccessToken);
  
  const selectedComponent = pageState?.components.find(c => c.id === selectedComponentId) || null;

  const pageUrl = pageState ? `${window.location.origin}/api/pages/${pageState.slug || pageState.id}` : '';

  const fetchComments = useCallback(async () => {
    // Comments disabled for now
    return;
    // if (!pageId || pageId === 'new') return;
    // setIsLoadingComments(true);
    // try {
    //     const pageComments = await getCommentsForPage(pageId);
    //     setComments(pageComments);
    // } catch (error) {
    //     toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os comentários.' });
    // } finally {
    //     setIsLoadingComments(false);
    // }
  }, []);


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
                    else if (c.order > maxOrder) maxOrder = c.order;
                  }
                });
              });
            });

            const cleanPageState = { ...pageData, name: pageData.name };
            setInitialPageState(cleanPageState);
            setSavedPageState(cleanPageState);
            resetState(cleanPageState);

            if(pageData.brandId) {
                const brandData = await getBrand(pageData.brandId);
                setBrand(brandData);
            }
            if (pageData.projectId) {
                const pages = await getPagesForProject(pageData.projectId, activeWorkspace.id);
                setProjectPages(pages);
            }
            // Fetch comments after page data is available
            fetchComments();

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
  }, [pageId, router, user, toast, authLoading, searchParams, activeWorkspace, fetchComments]);
  
  
  // Keyboard shortcut for Undo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        if(canUndo) {
          undo();
        }
      }
      // Escape key to exit comment mode
      if (event.key === 'Escape') {
          setEditorMode('none');
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
      const stateToSave = cleanUndefined(pageState);
      const finalPageState = produce(stateToSave, draft => {
          // Ensure footer is always last
          const footerIndex = draft.components.findIndex(c => c.type === 'Footer');
          if (footerIndex > -1) {
              const [footer] = draft.components.splice(footerIndex, 1);
              footer.order = 9999;
              draft.components.push(footer);
          }
      });
      
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
      
      const stateToSave = cleanUndefined(pageState);
      
      // Reset shortUrl before attempting to publish and generate a new one
      setShortUrl(null);

      try {
          if (hasUnsavedChanges) {
              await updatePage(pageId, stateToSave);
              setSavedPageState(stateToSave);
              resetState(stateToSave);
          }
          
          await publishPage(pageId, stateToSave, user.uid);

          let finalShortUrl: string | null = null;
          if (useBitly && hasBitlyConfig) {
              const result = await shortenUrl({ brandId: pageState.brandId, longUrl: pageUrl });
              finalShortUrl = result.shortUrl;
              setShortUrl(finalShortUrl);
          }
          
          toast({ 
              title: "✅ Página publicada com sucesso!",
              description: `Sua página está no ar. URL: ${finalShortUrl || pageUrl}`,
              duration: 10000,
          });

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
    copyToClipboard(url).then(() => {
        toast({ title: "URL copiada!" });
    }).catch(err => {
        console.error("Copy failed", err);
        toast({ variant: 'destructive', title: "Falha ao copiar" });
    });
  };
  
  const handleCodeEdit = (component: PageComponent) => {
    setComponentToCodeEdit(component);
    setIsCodeEditorOpen(true);
  };
  
  const handleSaveCode = (componentId: string, newHtml: string) => {
    setPageState(prev => {
      if (!prev) return null;
      return produce(prev, draft => {
        const index = draft.components.findIndex(c => c.id === componentId);
        if (index !== -1) {
          const originalComponent = draft.components[index];
          const customHtmlComponent: PageComponent = {
            id: originalComponent.id, // Keep the same ID
            type: 'CustomHTML',
            props: { htmlContent: newHtml },
            order: originalComponent.order,
            parentId: originalComponent.parentId,
            column: originalComponent.column,
            layerName: originalComponent.layerName ? `${originalComponent.layerName} (HTML)` : `HTML Customizado`,
          };
          draft.components.splice(index, 1, customHtmlComponent);
        }
      });
    });
    setIsCodeEditorOpen(false);
    setComponentToCodeEdit(null);
    setSelectedComponentId(null);
  };

  const duplicateComponent = (componentId: string) => {
    setPageState(prev => {
        if (!prev) return null;

        return produce(prev, draft => {
            const idMap: { [key: string]: string } = {};

            const duplicateRecursively = (originalCompId: string, newParentId: string | null = null, newColumnIndex?: number): string => {
                const originalComp = draft.components.find(c => c.id === originalCompId);
                if (!originalComp) return '';

                const newId = `${originalComp.type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                idMap[originalCompId] = newId;

                // Deep copy of props to avoid reference issues
                const newProps = JSON.parse(JSON.stringify(originalComp.props));
                
                const duplicatedComp: PageComponent = {
                    ...originalComp,
                    id: newId,
                    props: newProps,
                    parentId: newParentId,
                    column: newColumnIndex !== undefined ? newColumnIndex : originalComp.column,
                    // Order will be recalculated later
                };
                draft.components.push(duplicatedComp);

                if (['Columns', 'Div', 'PopUp'].includes(originalComp.type)) {
                    const children = draft.components.filter(c => c.parentId === originalCompId);
                    children.forEach(child => {
                       duplicateRecursively(child.id, newId, child.column);
                    });
                }
                return newId;
            };
            
            const originalComponent = draft.components.find(c => c.id === componentId);
            if (!originalComponent) return;

            const newMainComponentId = duplicateRecursively(componentId, originalComponent.parentId, originalComponent.column);
            
            // Reorder components
            const allComponents = draft.components.filter(c => c.parentId === originalComponent.parentId);
            const originalIndex = allComponents.findIndex(c => c.id === componentId);
            
            const newComponent = draft.components.find(c => c.id === newMainComponentId);
            if (!newComponent) return;

            // Move the new component to be right after the original
            const componentToInsert = draft.components.splice(draft.components.findIndex(c => c.id === newComponent.id), 1)[0];
            const finalOriginalIndex = draft.components.findIndex(c => c.id === componentId);
            draft.components.splice(finalOriginalIndex + 1, 0, componentToInsert);

            // Update order for all siblings
            const siblings = draft.components.filter(c => c.parentId === originalComponent.parentId && c.column === originalComponent.column);
            siblings.forEach((sibling, index) => {
                const componentInDraft = draft.components.find(c => c.id === sibling.id);
                if (componentInDraft) {
                    componentInDraft.order = index;
                }
            });
        });
    });
    // Don't select the new component, let the user do it.
    // toast({ title: "Componente duplicado!"});
  };

  const removeComponent = (id: string) => {
    setPageState(prev => {
      if (!prev) return null;
      // Also remove children of the component being removed
      const idsToRemove = new Set([id]);
      let children = prev.components.filter(c => c.parentId === id);
      while(children.length > 0) {
        const nextGenChildren: PageComponent[] = [];
        children.forEach(child => {
          idsToRemove.add(child.id);
          const grandChildren = prev.components.filter(c => c.parentId === child.id);
          nextGenChildren.push(...grandChildren);
        });
        children = nextGenChildren;
      }
      
      return {
        ...prev,
        components: prev.components.filter(c => !idsToRemove.has(c.id)),
      };
    });
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  };
  
  const toggleSidebar = () => {
    if (sidebarPanelRef.current) {
        const isCollapsed = sidebarPanelRef.current.isCollapsed();
        if (isCollapsed) {
            sidebarPanelRef.current.expand();
            setIsSidebarCollapsed(false);
        } else {
            sidebarPanelRef.current.collapse();
            setIsSidebarCollapsed(true);
        }
    }
  };
  
  const handleModeToggle = (mode: EditorMode) => {
    setEditorMode(prevMode => (prevMode === mode ? 'none' : mode));
  };
  
  const handleAddComment = async (x: number, y: number) => {
    if (!user || !activeWorkspace || !pageState) return;
    try {
        await addPageComment({
            pageId: pageState.id,
            workspaceId: activeWorkspace.id,
            userId: user.uid,
            userName: user.displayName || 'Usuário',
            userAvatarUrl: user.photoURL || '',
            position: { x, y },
            text: '', // Text is added in the modal now
            resolved: false
        });
        fetchComments();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar o comentário.' });
    } finally {
        setEditorMode('none');
    }
  }

  const handleAddComponentToContainer = (parentId: string | null, column: number, typeOrBlock: ComponentType | PageComponent[]) => {
      setPageState(prev => {
          if (!prev) return null;

          return produce(prev, draft => {
              let lastAddedComponentId: string | null = null;
              
              if (Array.isArray(typeOrBlock)) {
                // This is a block of components
                const allNewComponents: PageComponent[] = [];
                const blockQueue: PageComponent[] = [...typeOrBlock];
          
                while (blockQueue.length > 0) {
                  const comp = blockQueue.shift()!;
                  allNewComponents.push(comp);
                  if (comp.children) {
                    blockQueue.push(...comp.children);
                    delete comp.children; // Remove children array after processing
                  }
                }
          
                draft.components.push(...allNewComponents);
                if (allNewComponents.length > 0) {
                  lastAddedComponentId = allNewComponents[0].id;
                }

              } else {
                  // This is a single component
                  const siblings = draft.components.filter(c => c.parentId === parentId && c.column === column);
                  const newId = `${typeOrBlock}-${Date.now()}`;
                  const newComponent: PageComponent = {
                      id: newId,
                      type: typeOrBlock,
                      props: {},
                      parentId,
                      column,
                      order: siblings.length,
                      abTestEnabled: false,
                      abTestVariants: []
                  };
                  if (typeOrBlock === 'Columns') newComponent.props.columnCount = 2;
                  if (typeOrBlock === 'Spacer') newComponent.props.height = 20;
                  if (typeOrBlock === 'Button') newComponent.props.text = 'Botão';
                  
                  draft.components.push(newComponent);
                  lastAddedComponentId = newId;
              }

              if (lastAddedComponentId) {
                  setSelectedComponentId(lastAddedComponentId);
              }
          });
      });
  };

  if (isLoading || authLoading || !pageState) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
            <LogoIcon className="h-12 w-12 animate-star-pulse" />
       </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="flex flex-col h-screen bg-muted/40">
      <header className="flex items-center justify-between h-14 px-4 border-b flex-shrink-0 bg-card">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBackNavigation} aria-label="Voltar">
            <ArrowLeft className="h-4 w-4" />
          </Button>
           <Button variant="outline" size="icon" onClick={toggleSidebar} aria-label={isSidebarCollapsed ? 'Expandir painel' : 'Recolher painel'}>
            {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
          <div className="flex items-center gap-2 font-semibold">
            <LogoIcon className="h-6 w-6" />
            <h1>Morfeus</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" disabled>
                        <MessageSquare className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Comentários (em breve)</p>
                </TooltipContent>
            </Tooltip>
            <Button variant={editorMode === 'selection' ? 'secondary' : 'outline'} size="icon" onClick={() => handleModeToggle('selection')} aria-label="Modo de Seleção">
                <Hand className="h-5 w-5"/>
            </Button>
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
                    Confirme os detalhes e publique sua página.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
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
        <ResizablePanelGroup direction="horizontal" className="flex-grow min-h-0">
            <ResizablePanel ref={sidebarPanelRef} defaultSize={25} minSize={20} collapsible={true} collapsedSize={0} onCollapse={() => setIsSidebarCollapsed(true)} onExpand={() => setIsSidebarCollapsed(false)}>
                <SettingsPanel
                    pageState={pageState}
                    setPageState={setPageState}
                    selectedComponentId={selectedComponentId}
                    setSelectedComponentId={setSelectedComponentId}
                    pageName={pageState.name}
                    onPageNameChange={handlePageNameChange}
                    projectPages={projectPages}
                    onCodeEdit={handleCodeEdit}
                    onDuplicateComponent={duplicateComponent}
                    onDeleteComponent={removeComponent}
                    onAddComponentToContainer={handleAddComponentToContainer}
                />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={75}>
                <MainPanel
                    pageState={pageState}
                    setPageState={setPageState}
                    onDataExtensionKeyChange={handleDataExtensionKeyChange}
                    onSelectComponent={setSelectedComponentId}
                    editorMode={editorMode}
                    setEditorMode={setEditorMode}
                    onRefreshComments={fetchComments}
                    comments={comments}
                    onAddComment={handleAddComment}
                />
            </ResizablePanel>
        </ResizablePanelGroup>

       <Sheet open={!!selectedComponent} onOpenChange={(open) => !open && setSelectedComponentId(null)}>
            <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col">
                {selectedComponent && (
                    <>
                    <SheetHeader className="p-4 border-b">
                        <SheetTitle className="flex items-center justify-between">
                            <span>Configurar: {selectedComponent.layerName || selectedComponent.type}</span>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateComponent(selectedComponent.id)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta ação não pode ser desfeita e excluirá o componente.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => removeComponent(selectedComponent.id)}>Excluir</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="flex-grow">
                        <div className="p-4">
                             <ComponentSettings
                                key={selectedComponent.id}
                                component={selectedComponent}
                                onComponentChange={handleComponentChange}
                                onCodeEdit={handleCodeEdit}
                                projectPages={projectPages}
                                pageState={pageState}
                                onDuplicate={duplicateComponent}
                                onDelete={removeComponent}
                            />
                        </div>
                    </ScrollArea>
                    </>
                )}
            </SheetContent>
        </Sheet>

        {componentToCodeEdit && (
            <EditCodeDialog
                isOpen={isCodeEditorOpen}
                onOpenChange={setIsCodeEditorOpen}
                component={componentToCodeEdit}
                allComponents={pageState.components}
                onSave={handleSaveCode}
                pageState={pageState}
            />
        )}
    </div>
    </TooltipProvider>
  );
}

    
