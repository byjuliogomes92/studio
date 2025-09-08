
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
    currentCode: string;
    onCodeChange: (newCode: string) => void;
    onClose: () => void;
}

export function AmpscriptSnippetDialog({ currentCode, onCodeChange, onClose }: AmpscriptSnippetDialogProps) {
    const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
    const [config, setConfig] = useState<Record<string, string>>({});

     useEffect(() => {
        // Reset state when a new snippet is not selected, or when dialog is re-opened.
        if (!selectedSnippet) {
            setConfig({});
        }
    }, [selectedSnippet]);


    const handleSelectSnippet = (snippet: Snippet) => {
        setSelectedSnippet(snippet);
        // Initialize config state with default values from the snippet's config fields
        const initialConfig: Record<string, string> = {};
        snippet.configFields?.forEach(field => {
            initialConfig[field.name] = field.defaultValue || '';
        });
        setConfig(initialConfig);
    };

    const handleConfigChange = (name: string, value: string) => {
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSnippet = () => {
        if (!selectedSnippet) return;

        const generatedCode = selectedSnippet.generate(config);
        const newCode = `${currentCode}\n\n${generatedCode}`;
        onCodeChange(newCode.trim());
        
        // Reset state and close dialog
        onClose();
        setSelectedSnippet(null);
        setConfig({});
    };

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Biblioteca de Automações AMPScript</DialogTitle>
                <DialogDescription>
                    Selecione uma automação para adicioná-la e configurá-la facilmente.
                </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] py-4">
                <ScrollArea className="h-[55vh] pr-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium mb-2">Selecione uma Automação</p>
                        {snippets.map(snippet => (
                            <Button
                                key={snippet.id}
                                variant={selectedSnippet?.id === snippet.id ? "secondary" : "outline"}
                                className="w-full justify-start text-left h-auto py-2"
                                onClick={() => handleSelectSnippet(snippet)}
                            >
                                <div className="flex flex-col">
                                    <span className="font-semibold">{snippet.name}</span>
                                    <span className="text-xs text-muted-foreground">{snippet.description}</span>
                                </div>
                            </Button>
                        ))}
                    </div>
                </ScrollArea>

                <ScrollArea className="h-[55vh] pr-4">
                    <div className="space-y-4">
                        {selectedSnippet ? (
                            <>
                                <p className="text-sm font-medium">Configure a Automação</p>
                                {selectedSnippet.configFields?.map(field => (
                                    <div key={field.name} className="space-y-2">
                                        <Label htmlFor={field.name}>{field.label}</Label>
                                        <Input
                                            id={field.name}
                                            value={config[field.name] || ''}
                                            onChange={(e) => handleConfigChange(field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                        />
                                    </div>
                                ))}
                                {selectedSnippet.configFields.length === 0 && (
                                    <p className="text-sm text-muted-foreground">Esta automação não requer configuração.</p>
                                )}
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-center text-muted-foreground p-4">
                                <p>Selecione uma automação à esquerda para começar a configuração.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleAddSnippet} disabled={!selectedSnippet}>Adicionar à Página</Button>
            </DialogFooter>
        </DialogContent>
    );
}
