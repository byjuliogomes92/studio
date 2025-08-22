
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CloudPage, PageComponent } from "@/lib/types";
import { generateHtml } from "@/lib/html-generator";
import { SettingsPanel } from "./settings-panel";
import { MainPanel } from "./main-panel";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updatePage, getPage } from "@/lib/firestore";
import { useAuth } from "@/hooks/use-auth";

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
  const { state: pageState, setState: setPageState, undo, canUndo, resetState } = useHistoryState<CloudPage | null>(initialPageState);

  const [htmlCode, setHtmlCode] = useState("");
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [pageName, setPageName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
          const pageData = await getPage(pageId);
          if (pageData && pageData.userId === user.uid) {
             let needsUpdate = false;
            const updatedComponents = pageData.components.map((component: PageComponent) => {
              // Migration from TextBlock to Paragraph
              if ((component.type as any) === 'TextBlock') {
                  needsUpdate = true;
                  return { ...component, type: 'Paragraph' };
              }
              if (component.type === 'Form' && (!component.props.placeholders || !component.props.fields)) {
                needsUpdate = true;
                const newProps = { ...component.props };
                if (!newProps.fields) {
                  newProps.fields = { name: true, email: true, phone: true, cpf: true, city: false, birthdate: false, optin: true };
                }
                if (!newProps.placeholders) {
                  newProps.placeholders = { name: 'Nome', email: 'Email', phone: 'Telefone - Ex:(11) 9 9999-9999', cpf: 'CPF', birthdate: 'Data de Nascimento' };
                }
                return { ...component, props: newProps };
              }
              return component;
            });
            if (needsUpdate) {
              pageData.components = updatedComponents;
            }
            setInitialPageState(pageData);
            resetState(pageData); // Initialize history
            setPageName(pageData.name);
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
  }, [pageId, router, user, toast, authLoading, searchParams, resetState]);
  
  useEffect(() => {
    if(pageState) {
      setHtmlCode(generateHtml(pageState));
    }
  }, [pageState]);

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
      // After saving, the new state is the baseline. Reset history.
      resetState(finalPageState);
      toast({ title: "Página atualizada!", description: `A página "${pageName}" foi salva com sucesso.` });
    } catch(error) {
         toast({ variant: "destructive", title: "Erro ao salvar", description: "Não foi possível salvar a página." });
         console.error("Save error:", error);
    } finally {
        setIsSaving(false);
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
            <h1>Cloud Page Forge</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={undo} disabled={!canUndo}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Desfazer
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSaving ? 'Salvando...' : 'Salvar Página'}
            </Button>
        </div>
      </header>
      <div className="flex flex-grow overflow-hidden">
        <aside className="w-[380px] border-r flex-shrink-0 bg-card/20">
          <SettingsPanel
            pageState={pageState}
            setPageState={setPageState}
            selectedComponentId={selectedComponentId}
            setSelectedComponentId={setSelectedComponentId}
            pageName={pageName}
            setPageName={setPageName}
          />
        </aside>
        <main className="flex-grow h-full">
          <MainPanel 
            htmlCode={htmlCode} 
            pageState={pageState} 
            setPageState={setPageState}
            onDataExtensionKeyChange={handleDataExtensionKeyChange}
           />
        </main>
      </div>
    </div>
    </>
  );
}
