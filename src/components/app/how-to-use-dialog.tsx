
"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CloudPage } from "@/lib/types";
import { Copy, AlertTriangle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface HowToUseDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  pageState: CloudPage;
}

export function HowToUseDialog({ isOpen, onOpenChange, pageState }: HowToUseDialogProps) {
  const { toast } = useToast();
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    // This ensures the URL is constructed only on the client-side where `window.location` is available.
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/api/pages/${pageState.id}`;
      setPageUrl(url);
    }
  }, [pageState.id]);

  const proxySnippet = `%%=TreatAsContentArea("CONTENT", HTTPGet("${pageUrl}", false, 0, @status))=%%`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado para a Área de Transferência!",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Como Publicar sua CloudPage (Método Rápido)</DialogTitle>
          <DialogDescription>
            Use este método para publicar suas alterações instantaneamente, sem o cache do Marketing Cloud.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
          <div className="space-y-6 py-4">

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Como Funciona?</AlertTitle>
              <AlertDescription>
                Você colará um pequeno código na sua CloudPage **apenas uma vez**. A partir daí, todas as alterações salvas aqui serão refletidas na sua página publicada instantaneamente, sem precisar editar nada no Marketing Cloud novamente.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Passo 1: Cole este Snippet na sua CloudPage</h3>
              <p className="text-sm text-muted-foreground">
                No Content Builder, crie uma CloudPage, selecione o layout em branco e cole o código AMPScript abaixo em um bloco de conteúdo "HTML". **Faça isso apenas uma vez por página.**
              </p>
              <div className="relative">
                  <SyntaxHighlighter language="ampscript" style={vscDarkPlus} customStyle={{ margin: 0, borderRadius: '0.5rem', padding: '1rem' }}>
                    {proxySnippet}
                  </SyntaxHighlighter>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => handleCopy(proxySnippet)}
                  >
                      <Copy className="h-4 w-4" />
                  </Button>
              </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Passo 2: Configure sua Data Extension</h3>
                <p className="text-sm text-muted-foreground">
                    Certifique-se de que sua Data Extension no Marketing Cloud está configurada corretamente para receber os dados. A chave externa (ou nome) da DE deve ser exatamente a mesma que você configurou no painel de "Configurações, SEO & Pixels": <strong>{pageState.meta.dataExtensionKey}</strong>.
                </p>
                 <img src="https://i.postimg.cc/J0bW8Gz2/step2.png" alt="Cole o código no Content Builder" className="rounded-md border" />
            </div>

             <div className="space-y-4">
                <h3 className="font-semibold text-lg">Passo 3: Salve e Publique</h3>
                <p className="text-sm text-muted-foreground">
                    Salve e publique sua CloudPage. É isso! A partir de agora, qualquer alteração que você salvar aqui na plataforma aparecerá automaticamente na sua página publicada.
                </p>
                 <img src="https://i.postimg.cc/q7yZ26Y1/step3.png" alt="Crie e publique a CloudPage" className="rounded-md border" />
            </div>

          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={() => window.open(pageUrl, '_blank')}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Testar URL da Página
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
