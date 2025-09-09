

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { accessibilityCheck } from "@/ai/flows/accessibility-checker";
import { Info, Loader2, Sparkles, Monitor, Smartphone, ExternalLink, Copy, Download, Bold, Italic, Underline, Strikethrough, Link as LinkIcon, CaseUpper, CaseLower, Quote, Heading1, Heading2, Text, Tablet, Code, Percent, Hand, MoreVertical, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AmpscriptSnippetDialog } from "./ampscript-snippet-dialog";
import type { CloudPage, PageComment, EditorMode } from "@/lib/types";
import { generateHtml } from "@/lib/html-generator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { CommentPin } from "./comment-pin";

interface MainPanelProps {
  pageState: CloudPage;
  setPageState: Dispatch<SetStateAction<CloudPage | null>>;
  onDataExtensionKeyChange: (newKey: string) => void;
  onSelectComponent: (id: string) => void;
  editorMode: EditorMode;
  setEditorMode: Dispatch<SetStateAction<EditorMode>>;
  onRefreshComments: () => void;
  comments: PageComment[];
  onAddComment: (x: number, y: number) => void;
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


export function MainPanel({ pageState, setPageState, onDataExtensionKeyChange, onSelectComponent, editorMode, setEditorMode, onRefreshComments, comments, onAddComment }: MainPanelProps) {
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);
  const [accessibilityIssues, setAccessibilityIssues] = useState<string | null>(null);
  const [isAmpscriptDialogOpen, setIsAmpscriptDialogOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeWrapperRef = useRef<HTMLDivElement>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device>(devices[0]);
  const [hideAmpscript, setHideAmpscript] = useState(true);

  // Generate HTML for preview and for final code separately
  const previewHtmlCode = generateHtml(pageState, true, '', hideAmpscript);
  const finalHtmlCode = generateHtml(pageState, false);
  
  // This function is called from within the iframe's script
  (window as any).handleComponentSelect = (componentId: string) => {
    onSelectComponent(componentId);
    setEditorMode('none'); 
  };

  // This function is also called from within the iframe
  (window as any).handleAddComment = (x: number, y: number, iframeRect: any) => {
      const adjustedX = ((x - iframeRect.left) / iframeRect.width) * 100;
      const adjustedY = ((y - iframeRect.top) / iframeRect.height) * 100;
      onAddComment(adjustedX, adjustedY);
  };


  const handleOpenInNewTab = () => {
    try {
        const previewHtml = generateHtml(pageState, true);
        
        const stateToStore = {
            previewHtml: previewHtml,
        };
        localStorage.setItem('cloudPagePreviewState', JSON.stringify(stateToStore));

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
               <Button onClick={() => setIsAmpscriptDialogOpen(true)} variant="outline">
                <Info className="mr-2 h-4 w-4" />
                Como Publicar
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

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Mais opções">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleOpenInNewTab}>
                            <ExternalLink className="mr-2 h-4 w-4"/>
                            Abrir em Nova Aba
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={!hideAmpscript}
                            onCheckedChange={(checked) => setHideAmpscript(!checked)}
                        >
                             <Percent className="mr-2 h-4 w-4" />
                            Mostrar AMPScript
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
          </div>
        </div>
        <div className="flex-grow overflow-auto relative">
          <TabsContent value="preview" className="w-full h-full m-0">
            <div 
                ref={iframeWrapperRef}
                className={cn(
                    "h-full w-full flex items-start justify-center p-4 overflow-y-auto"
                )}
            >
              <div className="relative flex-shrink-0 transition-all duration-300 ease-in-out" style={selectedDevice.name !== 'Desktop' ? { width: `${selectedDevice.width}px`, height: `${selectedDevice.height}px` } : { width: '100%', height: '100%' }}>
                  <iframe
                      key={`${previewHtmlCode}-${editorMode}`} // Force re-render of iframe when mode changes
                      ref={iframeRef}
                      srcDoc={generateHtml(pageState, true, '', hideAmpscript, editorMode)}
                      title="Preview da Cloud Page"
                      className={cn(
                          "border-8 border-background shadow-2xl rounded-lg bg-white w-full h-full"
                      )}
                  />
                  {/* Comments disabled for now */}
                  {/* {comments.map(comment => (
                        <CommentPin key={comment.id} comment={comment} onUpdate={onRefreshComments} />
                    ))} */}
              </div>
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
      <AmpscriptSnippetDialog
        isOpen={isAmpscriptDialogOpen}
        onOpenChange={setIsAmpscriptDialogOpen}
        pageState={pageState}
        onDataExtensionKeyChange={onDataExtensionKeyChange}
      />
    </>
  );
}
