
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { accessibilityCheck } from "@/ai/flows/accessibility-checker";
import { Copy, Loader2, Sparkles, Download, Monitor, Smartphone, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HowToUseDialog } from "./how-to-use-dialog";
import type { CloudPage } from "@/lib/types";

interface MainPanelProps {
  htmlCode: string;
  pageState: CloudPage;
  setPageState: Dispatch<SetStateAction<CloudPage | null>>;
  onDataExtensionKeyChange: (newKey: string) => void;
}

export function MainPanel({ htmlCode, pageState, setPageState, onDataExtensionKeyChange }: MainPanelProps) {
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);
  const [accessibilityIssues, setAccessibilityIssues] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleInlineEdit = useCallback((componentId: string, propName: string, newContent: string) => {
    setPageState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        components: prev.components.map(c => 
          c.id === componentId 
            ? { ...c, props: { ...c.props, [propName]: newContent } } 
            : c
        ),
      };
    });
  }, [setPageState]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;
      
      const editableElements = iframeDoc.querySelectorAll<HTMLElement>('[contenteditable="true"]');

      editableElements.forEach(el => {
          const handleBlur = () => {
              const componentId = el.dataset.componentId;
              const propName = el.dataset.propName;
              if(componentId && propName) {
                  handleInlineEdit(componentId, propName, el.innerHTML);
              }
          };

          const handleKeyDown = (e: KeyboardEvent) => {
              // Prevent new lines on Enter, and save on Enter
              if (e.key === 'Enter') {
                  e.preventDefault();
                  el.blur();
              }
          };
          
          el.addEventListener('blur', handleBlur);
          el.addEventListener('keydown', handleKeyDown);
      });
    };

    iframe.addEventListener('load', handleIframeLoad);

    // Cleanup
    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if(iframeDoc) {
        const editableElements = iframeDoc.querySelectorAll<HTMLElement>('[contenteditable="true"]');
         editableElements.forEach(el => {
             // You can't easily remove anonymous functions, so this part is tricky
             // For this app, since the iframe reloads, it's not a huge memory leak issue.
         });
      }
    };
  }, [htmlCode, handleInlineEdit]);

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlCode);
    toast({
      title: "Copiado para a Área de Transferência",
      description: "O código HTML foi copiado.",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cloudpage.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Download Iniciado",
      description: "O download do seu arquivo HTML começou.",
    });
  }

  const handleOpenInNewTab = () => {
    try {
        const blob = new Blob([htmlCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        // Revogar a URL do objeto após um tempo para permitir que a nova aba a carregue
        setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
        console.error("Failed to open in new tab:", error);
        toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível abrir o preview em uma nova aba.",
        });
    }
  };

  const handleAccessibilityCheck = async () => {
    setChecking(true);
    setAccessibilityIssues(null);
    try {
      const result = await accessibilityCheck({ htmlCode });
      setAccessibilityIssues(result.suggestions);
    } catch (error) {
      console.error("A verificação de acessibilidade falhou:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao executar a verificação de acessibilidade.",
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <Tabs defaultValue="preview" className="w-full h-full flex flex-col bg-muted/20">
        <div className="flex-shrink-0 border-b bg-card flex justify-between items-center pr-2">
          <div className="flex">
            <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 max-w-sm rounded-none">
              <TabsTrigger value="preview" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">Preview</TabsTrigger>
              <TabsTrigger value="code" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">Código</TabsTrigger>
            </TabsList>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
                    Acessibilidade
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Em breve</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleOpenInNewTab} aria-label="Abrir em nova aba">
                  <ExternalLink className="h-5 w-5"/>
              </Button>
              <Button variant={previewMode === 'desktop' ? 'secondary' : 'ghost'} size="icon" onClick={() => setPreviewMode('desktop')} aria-label="Visualização Desktop">
                  <Monitor className="h-5 w-5"/>
              </Button>
              <Button variant={previewMode === 'mobile' ? 'secondary' : 'ghost'} size="icon" onClick={() => setPreviewMode('mobile')} aria-label="Visualização Mobile">
                  <Smartphone className="h-5 w-5"/>
              </Button>
          </div>
        </div>
        <div className="flex-grow overflow-auto">
          <TabsContent value="preview" className="w-full h-full m-0">
            <div className="h-full w-full flex items-start justify-center p-4 overflow-y-auto">
              <iframe
                  ref={iframeRef}
                  srcDoc={htmlCode}
                  title="Preview da Cloud Page"
                  className={cn(
                      "border-8 border-background shadow-2xl rounded-lg bg-white transition-all duration-300 ease-in-out flex-shrink-0",
                      previewMode === 'desktop' ? 'w-full h-full' : 'w-[375px] h-[667px]'
                  )}
              />
            </div>
          </TabsContent>
          <TabsContent value="code" className="w-full h-full m-0 p-4 flex flex-col gap-4">
            <div className="flex-shrink-0 flex items-center gap-2">
              <Button onClick={() => setIsHowToUseOpen(true)} variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                Copiar Código & Ver Instruções
              </Button>
              <Button onClick={() => setIsHowToUseOpen(true)} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download & Ver Instruções
              </Button>
            </div>
            <div className="w-full flex-grow text-xs font-mono bg-card rounded-md overflow-hidden">
              <SyntaxHighlighter language="html" style={vscDarkPlus} showLineNumbers customStyle={{ margin: 0, height: '100%', width: '100%', fontSize: '14px' }}>
                  {htmlCode}
              </SyntaxHighlighter>
            </div>
          </TabsContent>
          <TabsContent value="accessibility" className="w-full h-full m-0 p-6">
            <div className="flex flex-col items-start gap-4">
              <Button onClick={handleAccessibilityCheck} disabled={checking}>
                {checking ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Verificar Problemas de Acessibilidade
              </Button>
              {checking && <p>Analisando seu código...</p>}
              {accessibilityIssues && (
                <div className="prose prose-sm dark:prose-invert mt-4 p-4 border rounded-md bg-card w-full max-w-none">
                  <h3 className="font-semibold">Sugestões de Acessibilidade</h3>
                  <pre className="whitespace-pre-wrap font-sans text-sm">{accessibilityIssues}</pre>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
      <HowToUseDialog 
        isOpen={isHowToUseOpen}
        onOpenChange={setIsHowToUseOpen}
        pageState={pageState}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onDataExtensionKeyChange={onDataExtensionKeyChange}
      />
    </>
  );
}

    