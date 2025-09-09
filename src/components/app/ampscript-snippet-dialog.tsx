
"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bot } from "lucide-react";
import { ScrollArea } from '../ui/scroll-area';
import { snippets, Snippet } from '@/lib/ampscript-snippets';

interface AmpscriptSnippetDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    pageState: any; // Using 'any' as it's a representation of CloudPage
    onDataExtensionKeyChange: (newKey: string) => void;
}

export function AmpscriptSnippetDialog({ isOpen, onOpenChange, pageState, onDataExtensionKeyChange }: AmpscriptSnippetDialogProps) {
    const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
    const [config, setConfig] = useState<Record<string, string>>({});
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cloudpagestudio.vercel.app';
    const pageUrl = `${baseUrl}/api/pages/${pageState.slug || pageState.id}`;
    const snippet = `%%=TreatAsContentArea("CONTENT", HTTPGet("${pageUrl}", false, 0, @status))=%%`;


     useEffect(() => {
        if (!selectedSnippet) {
            setConfig({});
        }
    }, [selectedSnippet]);


    const handleSelectSnippet = (snippet: Snippet) => {
        setSelectedSnippet(snippet);
        const initialConfig: Record<string, string> = {};
        snippet.configFields?.forEach(field => {
            initialConfig[field.name] = field.defaultValue || '';
        });
        setConfig(initialConfig);
    };

    const handleConfigChange = (name: string, value: string) => {
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyConfig = () => {
        if (!selectedSnippet) return;
        // Logic to apply the configuration, for now, we just close
        // In a real scenario, this might update the pageState with the AMPScript
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Como Publicar no Marketing Cloud</DialogTitle>
                    <DialogDescription>
                        Siga os passos abaixo para integrar sua página criada no Morfeus com o SFMC.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <h3 className="font-semibold">Passo 1: Crie uma Data Extension</h3>
                        <p className="text-sm text-muted-foreground">
                            No Marketing Cloud, crie a Data Extension que irá armazenar os dados do seu formulário. Certifique-se de que os nomes das colunas correspondem aos campos do seu formulário.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold">Passo 2: Configure a Chave da DE</h3>
                        <p className="text-sm text-muted-foreground">
                            Insira a Chave Externa (External Key) da sua Data Extension abaixo. Isso é essencial para que o formulário funcione.
                        </p>
                        <Input 
                            value={pageState.meta?.dataExtensionKey || ''}
                            onChange={e => onDataExtensionKeyChange(e.target.value)}
                            placeholder="Insira a Chave Externa da DE aqui"
                        />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold">Passo 3: Publique no Marketing Cloud</h3>
                        <p className="text-sm text-muted-foreground">
                            Crie uma nova CloudPage no SFMC. No editor, cole o seguinte snippet de código em um bloco de HTML. Isso é tudo que você precisa colocar na CloudPage.
                        </p>
                        <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                            <code>
                                {snippet}
                            </code>
                        </pre>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
