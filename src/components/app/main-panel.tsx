
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { accessibilityCheck } from "@/ai/flows/accessibility-checker";
import { Info, Loader2, Sparkles, Monitor, Smartphone, ExternalLink, Copy, Download, Bold, Italic, Underline, Strikethrough, Link as LinkIcon, CaseUpper, CaseLower, Quote, Heading1, Heading2, Text, Tablet, Code, Percent, Hand } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HowToUseDialog } from "./how-to-use-dialog";
import type { CloudPage } from "@/lib/types";
import { generateHtml } from "@/lib/html-generator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface MainPanelProps {
  pageState: CloudPage;
  setPageState: Dispatch<SetStateAction<CloudPage | null>>;
  onDataExtensionKeyChange: (newKey: string) => void;
  onSelectComponent: (id: string) => void;
}

interface Device {
    name: string;
    width: number;
    height: number;
    icon: React.ElementType;
}
  
const devices: Device[] = [
    { name: 'Desktop', width: 1920, height: 1080, icon: Monitor },
    { name: 'Tablet', width: 768, height: 1024, icon: Tablet },
    { name: 'iPhone 12 Pro', width: 390, height: 844, icon: Smartphone },
    { name: 'Samsung S20 Ultra', width: 412, height: 915, icon: Smartphone },
];

function WysiwygToolbar({ editor, iframe, onAction }: { editor: HTMLElement | null, iframe: HTMLIFrameElement | null, onAction: () => void }) {
    if (!editor || !iframe?.contentWindow) return null;

    const selection = iframe.contentWindow.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    if (!range) return null;

    // Don't show toolbar for collapsed selections (carets)
    if (range.collapsed) return null;
    
    const iframeRect = iframe.getBoundingClientRect();
    const rangeRect = range.getBoundingClientRect();
    
    // Position the toolbar above the selection
    const top = iframeRect.top + rangeRect.top - 50; 
    const left = iframeRect.left + rangeRect.left + (rangeRect.width / 2) - 150;

    const applyStyle = (command: string, value?: string) => {
        iframe.contentWindow?.document.execCommand(command, false, value);
        onAction();
        editor.focus();
    };
    
    const createLink = () => {
        const url = prompt('Digite a URL do link:');
        if (url) {
            applyStyle('createLink', url);
        }
    };
    
    const setCase = (caseType: 'uppercase' | 'lowercase') => {
        const sel = iframe.contentWindow?.getSelection();
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const selectedText = range.toString();
            const newText = caseType === 'uppercase' ? selectedText.toUpperCase() : selectedText.toLowerCase();
            range.deleteContents();
            range.insertNode(iframe.contentWindow.document.createTextNode(newText));
            onAction();
        }
    };


    return (
        <div 
            className="fixed z-50 bg-card border shadow-lg rounded-lg p-1 flex items-center gap-1"
            style={{ top: `${top}px`, left: `${left}px` }}
            onMouseDown={(e) => e.preventDefault()} // Prevent toolbar from stealing focus
        >
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyStyle('bold')}><Bold className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyStyle('italic')}><Italic className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyStyle('underline')}><Underline className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyStyle('strikeThrough')}><Strikethrough className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={createLink}><LinkIcon className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyStyle('formatBlock', '<blockquote>')}><Quote className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCase('uppercase')}><CaseUpper className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCase('lowercase')}><CaseLower className="h-4 w-4" /></Button>
        </div>
    );
}

function AmpscriptIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M5.5 15h13" />
            <path d="M5.5 9h13" />
            <path d="M4 20l-2-8 2-8" />
            <path d="M20 20l2-8-2-8" />
        </svg>
    );
}

export function MainPanel({ pageState, setPageState, onDataExtensionKeyChange, onSelectComponent }: MainPanelProps) {
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);
  const [accessibilityIssues, setAccessibilityIssues] = useState<string | null>(null);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device>(devices[0]);
  const [hideAmpscript, setHideAmpscript] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);


  const [activeEditor, setActiveEditor] = useState<HTMLElement | null>(null);
  const [toolbarUpdate, setToolbarUpdate] = useState(0);

  // Generate HTML for preview and for final code separately
  const previewHtmlCode = generateHtml(pageState, true, '', hideAmpscript);
  const finalHtmlCode = generateHtml(pageState, false);

  const handleInlineEdit = useCallback((componentId: string, propName: string, newContent: string) => {
    setPageState(prev => {
      if (!prev) return null;
      // Avoid updating state if content hasn't changed
      const component = prev.components.find(c => c.id === componentId);
      if (component && component.props[propName] === newContent) {
          return prev;
      }
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

  const forceToolbarUpdate = () => {
    setToolbarUpdate(v => v + 1);
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeClick = (e: MouseEvent) => {
        if (!isSelectionMode) return;
        
        let target = e.target as HTMLElement | null;
        let componentId = null;
        
        while(target && target !== iframe.contentDocument?.body) {
            if (target.hasAttribute('data-component-id')) {
                componentId = target.getAttribute('data-component-id');
                break;
            }
            target = target.parentElement;
        }

        if (componentId) {
            onSelectComponent(componentId);
            setIsSelectionMode(false); // Turn off selection mode after selecting
        }
    };
    
    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.hasAttribute('contenteditable')) {
        const componentId = target.dataset.componentId;
        const propName = target.dataset.propName;
        if (componentId && propName) {
            handleInlineEdit(componentId, propName, target.innerHTML);
        }
      }
      // Check if the focus is moving outside the iframe before hiding the toolbar
      setTimeout(() => {
        const iframeDoc = iframe.contentWindow?.document;
        if (iframeDoc && (iframeDoc.activeElement === iframeDoc.body || iframeDoc.activeElement === null)) {
            setActiveEditor(null);
        }
      }, 100);
    };

    const handleLoad = () => {
      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) return;
      
      iframeDoc.body.addEventListener('click', handleIframeClick);

      const handleSelectionChange = () => {
        const selection = iframeDoc.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const parentElement = range.startContainer.parentElement;

          if (parentElement?.isContentEditable) {
            setActiveEditor(parentElement);
            return;
          }
        }
        // Hide toolbar if selection is not in an editable area or is collapsed
        if (selection?.isCollapsed) {
          setActiveEditor(null);
        }
      };

      iframeDoc.addEventListener('selectionchange', handleSelectionChange);
      iframeDoc.body.addEventListener('blur', handleBlur, true);

      // Return a cleanup function for when the iframe reloads or component unmounts
      return () => {
        iframeDoc.body.removeEventListener('click', handleIframeClick);
        iframeDoc.removeEventListener('selectionchange', handleSelectionChange);
        iframeDoc.body.removeEventListener('blur', handleBlur, true);
      };
    };

    let cleanupLoad: (() => void) | undefined;
    
    const setup = () => {
      cleanupLoad = handleLoad();
    }
    
    iframe.addEventListener('load', setup);

    // Main cleanup for when the component unmounts
    return () => {
      iframe.removeEventListener('load', setup);
      if (cleanupLoad) {
        cleanupLoad();
      }
    };
  }, [previewHtmlCode, handleInlineEdit, isSelectionMode, onSelectComponent]);


  const handleOpenInNewTab = () => {
    try {
        // Generate the preview HTML
        const previewHtml = generateHtml(pageState, true);
        
        // Store it in localStorage. This is a simple way to pass a potentially large
        // string to a new tab without hitting URL length limits.
        const stateToStore = {
            previewHtml: previewHtml,
        };
        localStorage.setItem('cloudPagePreviewState', JSON.stringify(stateToStore));

        // Open the dedicated preview route in a new tab.
        window.open('/api/preview', '_blank');

    } catch (error) {
        console.error("Failed to open in new tab:", error);
        toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível abrir o preview em uma nova aba.",
        });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(finalHtmlCode);
    toast({
      title: "Copiado para a Área de Transferência!",
    });
  };

  const handleDownloadCode = () => {
    const blob = new Blob([finalHtmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pageState.name.replace(/ /g, "_") || "cloudpage"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const handleAccessibilityCheck = async () => {
    setChecking(true);
    setAccessibilityIssues(null);
    try {
      const result = await accessibilityCheck({ htmlCode: generateHtml(pageState, false) });
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
      <WysiwygToolbar key={toolbarUpdate} editor={activeEditor} iframe={iframeRef.current} onAction={forceToolbarUpdate} />
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
               <Button onClick={() => setIsSelectionMode(!isSelectionMode)} variant={isSelectionMode ? "secondary" : "ghost"} size="icon" aria-label="Modo de Seleção">
                    <Hand className="h-5 w-5"/>
               </Button>
              <Button onClick={() => setIsHowToUseOpen(true)} variant="secondary">
                <Info className="mr-2 h-4 w-4" />
                Como Publicar
              </Button>
               <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button><Percent className="h-4 w-4 text-muted-foreground"/></button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{hideAmpscript ? 'Mostrar' : 'Ocultar'} código AMPScript</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Switch
                  id="ampscript-toggle"
                  checked={!hideAmpscript}
                  onCheckedChange={(checked) => setHideAmpscript(!checked)}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={handleOpenInNewTab} aria-label="Abrir em nova aba">
                  <ExternalLink className="h-5 w-5"/>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <selectedDevice.icon className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {devices.map(device => (
                        <DropdownMenuItem key={device.name} onClick={() => setSelectedDevice(device)}>
                            <device.icon className="mr-2 h-4 w-4" />
                            <span>{device.name}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>
        <div className="flex-grow overflow-auto">
          <TabsContent value="preview" className="w-full h-full m-0">
            <div className={cn("h-full w-full flex items-start justify-center p-4 overflow-y-auto", isSelectionMode && "selection-mode")}>
              <iframe
                  ref={iframeRef}
                  srcDoc={previewHtmlCode}
                  title="Preview da Cloud Page"
                  className={cn(
                      "border-8 border-background shadow-2xl rounded-lg bg-white transition-all duration-300 ease-in-out flex-shrink-0",
                      selectedDevice.name === 'Desktop' ? 'w-full h-full' : '',
                      isSelectionMode && "pointer-events-auto" // Enable pointer events only in selection mode
                  )}
                  style={selectedDevice.name !== 'Desktop' ? { width: `${selectedDevice.width}px`, height: `${selectedDevice.height}px` } : {}}
              />
            </div>
          </TabsContent>
           <TabsContent value="code" className="w-full h-full m-0 relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button variant="secondary" onClick={handleCopyCode}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Código
              </Button>
              <Button variant="secondary" onClick={handleDownloadCode}>
                <Download className="mr-2 h-4 w-4" />
                Baixar HTML
              </Button>
            </div>
            <SyntaxHighlighter
              language="html"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                height: '100%',
                width: '100%',
                borderRadius: 0,
              }}
              codeTagProps={{
                style: {
                  fontFamily: 'var(--font-mono)',
                },
              }}
              showLineNumbers
            >
              {finalHtmlCode}
            </SyntaxHighlighter>
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
        onDataExtensionKeyChange={onDataExtensionKeyChange}
      />
    </>
  );
}
