"use client";

import type { PageComponent, ComponentType, FormFieldConfig } from "@/lib/types";
import React, { useState, useEffect, useCallback } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, AlignLeft, AlignCenter, AlignRight, Bold, Trash2, Plus, Star, Scaling, Facebook, Instagram, Linkedin, MessageCircle, Youtube, Twitter, Zap, Wand2, Loader2, Download, Send, ArrowRight, CheckCircle } from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { produce } from 'immer';
import { generateText } from "@/ai/flows/text-generator";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ComponentSettingsProps {
  component: PageComponent;
  onComponentChange: (id: string, newProps: Partial<PageComponent>) => void;
}

const formFields: {id: keyof PageComponent['props']['fields'], label: string}[] = [
    { id: 'name', label: 'Nome' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Telefone' },
    { id: 'cpf', label: 'CPF' },
    { id: 'city', label: 'Cidades' },
    { id: 'birthdate', label: 'Data de Nascimento' },
];

const lucideIcons = [
    { value: 'send', label: 'Enviar' },
    { value: 'arrow-right', label: 'Seta para a Direita' },
    { value: 'check-circle', label: 'Círculo de Verificação' },
    { value: 'plus', label: 'Mais' },
    { value: 'download', label: 'Download' },
    { value: 'star', label: 'Estrela' },
    { value: 'zap', label: 'Raio' },
];

function SpacingSettings({ props, onPropChange }: { props: any, onPropChange: (prop: string, value: any) => void }) {
    const styles = props.styles || {};
    const handleStyleChange = (prop: string, value: any) => {
      onPropChange('styles', { ...styles, [prop]: value });
    };
  
    return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Margem</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Topo" value={styles.marginTop || ''} onChange={e => handleStyleChange('marginTop', e.target.value)} />
                    <Input placeholder="Direita" value={styles.marginRight || ''} onChange={e => handleStyleChange('marginRight', e.target.value)} />
                    <Input placeholder="Baixo" value={styles.marginBottom || ''} onChange={e => handleStyleChange('marginBottom', e.target.value)} />
                    <Input placeholder="Esquerda" value={styles.marginLeft || ''} onChange={e => handleStyleChange('marginLeft', e.target.value)} />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Padding</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Topo" value={styles.paddingTop || ''} onChange={e => handleStyleChange('paddingTop', e.target.value)} />
                    <Input placeholder="Direita" value={styles.paddingRight || ''} onChange={e => handleStyleChange('paddingRight', e.target.value)} />
                    <Input placeholder="Baixo" value={styles.paddingBottom || ''} onChange={e => handleStyleChange('paddingBottom', e.target.value)} />
                    <Input placeholder="Esquerda" value={styles.paddingLeft || ''} onChange={e => handleStyleChange('paddingLeft', e.target.value)} />
                </div>
            </div>
        </div>
        </div>
    )
  }

function TextStyleSettings({ props, onPropChange }: { props: any, onPropChange: (prop: string, value: any) => void }) {
  const styles = props.styles || {};
  
  const handleStyleChange = (prop: string, value: any) => {
    onPropChange('styles', { ...styles, [prop]: value });
  };

  return (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label>Alinhamento</Label>
            <ToggleGroup 
                type="single" 
                value={styles.textAlign || 'left'} 
                onValueChange={(value) => handleStyleChange('textAlign', value)}
                className="w-full"
            >
                <ToggleGroupItem value="left" aria-label="Alinhar à esquerda" className="flex-1">
                    <AlignLeft className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="center" aria-label="Centralizar" className="flex-1">
                    <AlignCenter className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="right" aria-label="Alinhar à direita" className="flex-1">
                    <AlignRight className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tamanho Fonte</Label>
            <Input 
              type="text"
              value={styles.fontSize || ''} 
              onChange={(e) => handleStyleChange('fontSize', e.target.value)}
              placeholder="ex: 16px ou 1em"
            />
          </div>
           <div className="space-y-2">
            <Label>Cor</Label>
            <Input 
              type="color"
              value={styles.color || '#000000'} 
              onChange={(e) => handleStyleChange('color', e.target.value)}
              className="p-1 h-10"
            />
          </div>
        </div>
         <div className="space-y-2">
            <Label>Estilo</Label>
             <ToggleGroup 
                type="single" 
                variant="outline"
                value={styles.fontWeight} 
                onValueChange={(value) => handleStyleChange('fontWeight', value)}
            >
                <ToggleGroupItem value="bold" aria-label="Negrito">
                    <Bold className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    </div>
  );
}

function ListManager({
    items,
    onPropChange,
  }: {
    items: { id: string; title: string; content: string }[];
    onPropChange: (prop: string, value: any) => void;
  }) {
    const handleItemChange = (itemId: string, field: 'title' | 'content', value: string) => {
      const newItems = items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      );
      onPropChange('items', newItems);
    };
  
    const addItem = () => {
      const newItem = {
        id: `item-${Date.now()}`,
        title: 'Novo Item',
        content: 'Conteúdo do novo item.',
      };
      onPropChange('items', [...items, newItem]);
    };
  
    const removeItem = (itemId: string) => {
      onPropChange(
        'items',
        items.filter((item) => item.id !== itemId)
      );
    };
  
    return (
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="p-3 border rounded-md space-y-3 relative">
             <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 text-destructive/80 hover:text-destructive"
                onClick={() => removeItem(item.id)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            <div className="space-y-2">
              <Label htmlFor={`item-title-${item.id}`}>Título {index + 1}</Label>
              <Input
                id={`item-title-${item.id}`}
                value={item.title}
                onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`item-content-${item.id}`}>Conteúdo {index + 1}</Label>
              <Textarea
                id={`item-content-${item.id}`}
                value={item.content}
                onChange={(e) => handleItemChange(item.id, 'content', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar Item
        </Button>
      </div>
    );
  }

function VotingOptionsManager({
    options,
    onPropChange,
}: {
    options: { id: string; text: string }[];
    onPropChange: (prop: string, value: any) => void;
}) {
    const handleOptionChange = (optionId: string, value: string) => {
        const newOptions = options.map((opt) =>
            opt.id === optionId ? { ...opt, text: value } : opt
        );
        onPropChange('options', newOptions);
    };

    const addOption = () => {
        const newOption = {
            id: `opt-${Date.now()}`,
            text: 'Nova Opção',
        };
        onPropChange('options', [...options, newOption]);
    };

    const removeOption = (optionId: string) => {
        onPropChange('options', options.filter((opt) => opt.id !== optionId));
    };

    return (
        <div className="space-y-3">
            {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                    <Input
                        id={`option-text-${option.id}`}
                        value={option.text}
                        onChange={(e) => handleOptionChange(option.id, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive/80 hover:text-destructive shrink-0"
                        onClick={() => removeOption(option.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button variant="outline" className="w-full" onClick={addOption}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar Opção
            </Button>
        </div>
    );
}

function AiGenerateTextDialog({
  componentType,
  currentText,
  onTextGenerated,
  trigger
}: {
  componentType: string;
  currentText: string;
  onTextGenerated: (newText: string) => void;
  trigger: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, insira um comando.' });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateText({
        prompt,
        componentType,
        context: currentText
      });
      onTextGenerated(result.suggestion);
      setIsOpen(false);
      setPrompt("");
      toast({ title: 'Texto gerado com sucesso!' });
    } catch (error) {
      console.error("AI text generation failed:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível gerar o texto." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar Texto com IA</DialogTitle>
          <DialogDescription>
            Descreva o que você quer para o texto do seu componente de {componentType.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="ai-prompt">Comando</Label>
          <Textarea
            id="ai-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: um título chamativo para uma promoção de batom"
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Gerar Texto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// A generic text input component that updates on blur
const DebouncedTextInput = ({ value, onBlur, ...props }: { value: string; onBlur: (value: string) => void;[key: string]: any; }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <Textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={() => onBlur(localValue)}
            {...props}
        />
    );
}

const renderComponentSettings = (type: ComponentType, props: any, onPropChange: (prop: string, value: any) => void, onSubPropChange: (prop: string, subProp: string, value: any) => void) => {
    switch (type) {
      case "Header":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="logo-url">URL do Logo</Label>
              <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>URL para a imagem do logo no cabeçalho.</p></TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="logo-url"
              value={props.logoUrl || ""}
              onChange={(e) => onPropChange("logoUrl", e.target.value)}
            />
          </div>
        );
      case "Banner":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="image-url">URL da Imagem</Label>
              <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>URL para a imagem principal do banner.</p></TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="image-url"
              value={props.imageUrl || ""}
              onChange={(e) => onPropChange("imageUrl", e.target.value)}
            />
          </div>
        );
      case "Title":
      case "Subtitle":
      case "Paragraph":
         const isParagraph = type === 'Paragraph';
         return (
          <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <Label htmlFor="text-content">Texto Padrão</Label>
                   <Tooltip>
                        <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">Este é o texto exibido se o campo de dados conectado não for encontrado. {isParagraph && 'Suporta HTML básico.'}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                 <div className="relative">
                    <DebouncedTextInput
                        id="text-content"
                        value={props.text || ""}
                        onBlur={(value) => onPropChange("text", value)}
                        rows={isParagraph ? 8 : 4}
                        className="pr-10"
                    />
                    <AiGenerateTextDialog
                        componentType={type}
                        currentText={props.text || ""}
                        onTextGenerated={(newText) => onPropChange("text", newText)}
                        trigger={
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-primary">
                                <Wand2 className="h-4 w-4" />
                            </Button>
                        }
                    />
                </div>
            </div>
            <Separator />
             <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                    <Label htmlFor="data-binding">Conectar a um Campo de Dados</Label>
                    <Tooltip>
                        <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">Insira o nome da variável AMPScript (sem @ ou %%) para exibir dados dinâmicos. Ex: 'FirstName' para usar `%%=v(@FirstName)=%%`.</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                   <Zap className="h-4 w-4 text-muted-foreground" />
                   <Input
                      id="data-binding"
                      value={props.dataBinding || ''}
                      onChange={(e) => onPropChange('dataBinding', e.target.value)}
                      placeholder="Ex: FirstName"
                   />
                </div>
            </div>
            <Separator />
            <TextStyleSettings props={props} onPropChange={onPropChange} />
          </div>
        );
      case "Image":
        return (
          <div className="space-y-4">
             <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="image-src">URL da Imagem</Label>
                   <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>URL de origem para a imagem.</p></TooltipContent>
                  </Tooltip>
                </div>
                <Input
                    id="image-src"
                    value={props.src || ""}
                    onChange={(e) => onPropChange("src", e.target.value)}
                    placeholder="https://placehold.co/800x200.png"
                />
             </div>
              <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="image-alt">Texto Alternativo</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                      <TooltipContent><p>Texto descritivo para acessibilidade.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                      id="image-alt"
                      value={props.alt || ""}
                      onChange={(e) => onPropChange("alt", e.target.value)}
                      placeholder="Texto descritivo para a imagem"
                  />
              </div>
          </div>
        );
    case 'Video':
        return (
          <div className="space-y-2">
            <Label htmlFor="video-url">URL do Vídeo (YouTube)</Label>
            <Input
              id="video-url"
              value={props.url || ''}
              onChange={(e) => onPropChange('url', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        );
      case 'Countdown':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="countdown-date">Data e Hora do Fim</Label>
              <Input
                id="countdown-date"
                type="datetime-local"
                value={props.targetDate || ''}
                onChange={(e) => onPropChange('targetDate', e.target.value)}
              />
            </div>
            <Separator />
            <TextStyleSettings props={props} onPropChange={onPropChange} />
          </div>
        );
      case 'Divider':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="divider-thickness">Espessura (px)</Label>
              <Input
                id="divider-thickness"
                type="number"
                value={props.thickness || 1}
                onChange={(e) => onPropChange('thickness', parseInt(e.target.value, 10) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="divider-style">Estilo</Label>
              <Select value={props.style || 'solid'} onValueChange={(value) => onPropChange('style', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Sólido</SelectItem>
                  <SelectItem value="dotted">Pontilhado</SelectItem>
                  <SelectItem value="dashed">Tracejado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="divider-color">Cor</Label>
              <Input
                id="divider-color"
                type="color"
                value={props.color || '#cccccc'}
                onChange={(e) => onPropChange('color', e.target.value)}
                className="p-1 h-10"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="divider-margin">Margem Vertical (px)</Label>
              <Input
                id="divider-margin"
                type="number"
                value={props.margin || 20}
                onChange={(e) => onPropChange('margin', parseInt(e.target.value, 10) || 0)}
              />
            </div>
          </div>
        );
      case 'Spacer':
        return (
            <div className="space-y-2">
                <Label htmlFor="spacer-height">Altura (px)</Label>
                <Input
                id="spacer-height"
                type="number"
                value={props.height || 20}
                onChange={(e) => onPropChange('height', parseInt(e.target.value, 10))}
                />
            </div>
        );
    case 'Button':
        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="button-text">Texto do Botão</Label>
                     <div className="relative">
                        <Input
                            id="button-text"
                            value={props.text || ''}
                            onChange={(e) => onPropChange('text', e.target.value)}
                            placeholder="Clique Aqui"
                            className="pr-10"
                        />
                         <AiGenerateTextDialog
                            componentType="Button"
                            currentText={props.text || ""}
                            onTextGenerated={(newText) => onPropChange("text", newText)}
                            trigger={
                                <Button variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8 text-primary">
                                    <Wand2 className="h-4 w-4" />
                                </Button>
                            }
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="button-href">URL do Link</Label>
                    <Input
                        id="button-href"
                        value={props.href || ''}
                        onChange={(e) => onPropChange('href', e.target.value)}
                        placeholder="https://exemplo.com"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="button-align">Alinhamento</Label>
                     <Select value={props.align || 'center'} onValueChange={(value) => onPropChange('align', value)}>
                        <SelectTrigger>
                        <SelectValue placeholder="Selecione o alinhamento" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="left">Esquerda</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="right">Direita</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
    case 'DownloadButton':
        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="download-text">Texto do Botão</Label>
                    <Input
                        id="download-text"
                        value={props.text || 'Download'}
                        onChange={(e) => onPropChange('text', e.target.value)}
                        placeholder="Ex: Baixar PDF"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="download-url">URL do Arquivo</Label>
                    <Input
                        id="download-url"
                        value={props.fileUrl || ''}
                        onChange={(e) => onPropChange('fileUrl', e.target.value)}
                        placeholder="https://exemplo.com/arquivo.pdf"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="download-filename">Nome do Arquivo (ao Salvar)</Label>
                    <Input
                        id="download-filename"
                        value={props.fileName || ''}
                        onChange={(e) => onPropChange('fileName', e.target.value)}
                        placeholder="Ex: catalogo.pdf"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="download-align">Alinhamento</Label>
                     <Select value={props.align || 'center'} onValueChange={(value) => onPropChange('align', value)}>
                        <SelectTrigger>
                        <SelectValue placeholder="Selecione o alinhamento" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="left">Esquerda</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="right">Direita</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Separator />
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="conditional-display" className="font-semibold">Exibição Condicional</Label>
                        <Switch
                            id="conditional-display"
                            checked={props.conditionalDisplay?.enabled || false}
                            onCheckedChange={(checked) => onSubPropChange('conditionalDisplay', 'enabled', checked)}
                        />
                    </div>
                    {props.conditionalDisplay?.enabled && (
                        <div className="space-y-2">
                            <Label htmlFor="conditional-trigger">Gatilho de Exibição</Label>
                            <Select 
                                value={props.conditionalDisplay?.trigger || 'form_submission'}
                                onValueChange={(value) => onSubPropChange('conditionalDisplay', 'trigger', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="form_submission">Após envio de formulário</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>
        );
        case "Form": {
            const fieldsConfig: Record<string, FormFieldConfig> = {};

            // Ensure all form fields are objects for backward compatibility
            for (const fieldKey of Object.keys(props.fields || {})) {
                const fieldValue = props.fields[fieldKey];
                if (typeof fieldValue === 'boolean') {
                    fieldsConfig[fieldKey] = { enabled: fieldValue, conditional: null };
                } else {
                    fieldsConfig[fieldKey] = fieldValue;
                }
            }
          
            const handleFieldChange = (fieldId: string, property: keyof FormFieldConfig, value: any) => {
              const newFields = produce(fieldsConfig, (draft) => {
                if (typeof draft[fieldId] !== 'object' || draft[fieldId] === null) {
                    draft[fieldId] = { enabled: false, conditional: null };
                }
                (draft[fieldId] as any)[property] = value;
              });
              onPropChange('fields', newFields);
            };
          
            const handleConditionalChange = (fieldId: string, property: 'field' | 'value', value: string) => {
              const newFields = produce(fieldsConfig, (draft) => {
                const field = draft[fieldId];
                if (field && field.conditional) {
                  field.conditional[property] = value;
                }
              });
              onPropChange('fields', newFields);
            };
          
            const enabledFields = formFields.filter(f => fieldsConfig[f.id]?.enabled);
          
            return (
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">Campos do Formulário</Label>
                  <div className="space-y-3 mt-2">
                    {formFields.map((field, index) => (
                      <div key={field.id} className="p-3 border rounded-md space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`field-${field.id}`}>{field.label}</Label>
                          <Switch
                            id={`field-${field.id}`}
                            checked={fieldsConfig[field.id]?.enabled || false}
                            onCheckedChange={(checked) => handleFieldChange(field.id, 'enabled', checked)}
                          />
                        </div>
                        {fieldsConfig[field.id]?.enabled && index > 0 && (
                          <div className="space-y-3 pt-3 border-t">
                            <div className="flex items-center justify-between">
                               <Label htmlFor={`cond-${field.id}`} className="text-xs">Lógica Condicional</Label>
                                <Switch
                                    id={`cond-${field.id}`}
                                    checked={!!fieldsConfig[field.id]?.conditional}
                                    onCheckedChange={(checked) => handleFieldChange(field.id, 'conditional', checked ? { field: '', value: '' } : null)}
                                />
                            </div>
                            {fieldsConfig[field.id]?.conditional && (
                                <div className="space-y-2 text-xs">
                                     <Label>Exibir se:</Label>
                                     <Select 
                                        value={fieldsConfig[field.id]?.conditional?.field}
                                        onValueChange={(value) => handleConditionalChange(field.id, 'field', value)}
                                     >
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="Selecione um campo..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {enabledFields
                                                .filter(f => f.id !== field.id)
                                                .map(f => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)
                                            }
                                        </SelectContent>
                                     </Select>
                                     <Input 
                                        placeholder="Tiver o valor..."
                                        className="h-8"
                                        value={fieldsConfig[field.id]?.conditional?.value || ''}
                                        onChange={(e) => handleConditionalChange(field.id, 'value', e.target.value)}
                                     />
                                </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
          
                <Separator />
          
                <div>
                  <Label className="font-semibold">Placeholders dos Campos</Label>
                  <div className="space-y-3 mt-2">
                    {formFields.filter(f => fieldsConfig[f.id]?.enabled && f.id !== 'city').map((field) => (
                      <div className="space-y-2" key={`placeholder-${field.id}`}>
                        <Label htmlFor={`placeholder-${field.id}`}>{field.label}</Label>
                        <Input
                          id={`placeholder-${field.id}`}
                          value={props.placeholders?.[field.id] || ''}
                          onChange={(e) => onSubPropChange('placeholders', field.id, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
          
                {fieldsConfig.city?.enabled && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="form-cities">Lista de Cidades</Label>
                        <Tooltip>
                          <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                          <TooltipContent><p>Uma cidade por linha. Serão exibidas no dropdown.</p></TooltipContent>
                        </Tooltip>
                      </div>
                      <Textarea
                        id="form-cities"
                        value={props.cities || ''}
                        onChange={(e) => onPropChange('cities', e.target.value)}
                        rows={6}
                      />
                    </div>
                  </>
                )}
          
                <Separator />
          
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="field-optin" className="font-semibold">Opt-in de Consentimento</Label>
                    <Switch
                      id="field-optin"
                      checked={fieldsConfig.optin?.enabled || false}
                      onCheckedChange={(checked) => handleFieldChange('optin', 'enabled', checked)}
                    />
                  </div>
                  {fieldsConfig.optin?.enabled && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="form-consent-text">Texto de Consentimento</Label>
                        <Tooltip>
                          <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                          <TooltipContent><p>O texto legal para o consentimento do usuário. Suporta HTML.</p></TooltipContent>
                        </Tooltip>
                      </div>
                      <Textarea
                        id="form-consent-text"
                        value={props.consentText || ""}
                        onChange={(e) => onPropChange("consentText", e.target.value)}
                        rows={10}
                      />
                    </div>
                  )}
                </div>
          
                <Separator />

                <div>
                    <h4 className="font-semibold mb-4">Estilo do Botão de Envio</h4>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="form-button-text">Texto do Botão</Label>
                            <Input id="form-button-text" value={props.buttonText || ""} onChange={(e) => onPropChange("buttonText", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="form-button-align">Alinhamento do Botão</Label>
                            <Select value={props.buttonAlign || 'center'} onValueChange={(value) => onPropChange('buttonAlign', value)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="left">Esquerda</SelectItem>
                                    <SelectItem value="center">Centro</SelectItem>
                                    <SelectItem value="right">Direita</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cor de Fundo</Label>
                                <Input type="color" value={props.buttonProps?.bgColor || '#000000'} onChange={(e) => onSubPropChange('buttonProps', 'bgColor', e.target.value)} className="p-1 h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label>Cor do Texto</Label>
                                <Input type="color" value={props.buttonProps?.textColor || '#FFFFFF'} onChange={(e) => onSubPropChange('buttonProps', 'textColor', e.target.value)} className="p-1 h-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Ícone</Label>
                            <Select value={props.buttonProps?.icon || ''} onValueChange={(value) => onSubPropChange('buttonProps', 'icon', value)}>
                                <SelectTrigger><SelectValue placeholder="Sem ícone"/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Sem ícone</SelectItem>
                                    {lucideIcons.map(icon => <SelectItem key={icon.value} value={icon.value}>{icon.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        {props.buttonProps?.icon && (
                            <div className="space-y-2">
                                <Label>Posição do Ícone</Label>
                                <Select value={props.buttonProps?.iconPosition || 'left'} onValueChange={(value) => onSubPropChange('buttonProps', 'iconPosition', value)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="left">Esquerda</SelectItem>
                                        <SelectItem value="right">Direita</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <Label htmlFor="enable-when-valid" className="flex items-center gap-2">
                                <HelpCircle className="h-4 w-4" />
                                Habilitar ao preencher
                            </Label>
                            <Switch id="enable-when-valid" checked={props.buttonProps?.enableWhenValid || false} onCheckedChange={(checked) => onSubPropChange('buttonProps', 'enableWhenValid', checked)} />
                        </div>
                    </div>
                </div>
          
                <Separator />
          
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="form-thank-you">Mensagem de Agradecimento</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <p>Esta mensagem aparecerá após o envio. Você pode usar HTML e variáveis dos campos.</p>
                          <p className="mt-2">Ex. de variável: `<h2>Obrigado, {'{{NOME}}'}!</h2>`.</p>
                          <p className="mt-1">Ex. de botão: `&lt;a href="https://..." class="custom-button"&gt;Clique Aqui&lt;/a&gt;`.</p>
                          <p className="mt-1">Variáveis disponíveis: `{'{{NOME}}'}`, `{'{{EMAIL}}'}`, etc.</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    id="form-thank-you"
                    value={props.thankYouMessage || ''}
                    onChange={(e) => onPropChange('thankYouMessage', e.target.value)}
                    rows={8}
                    placeholder="<h2>Obrigado!</h2><p>Seus dados foram recebidos.</p>"
                  />
                </div>
              </div>
            );
          }
      case 'Accordion':
      case 'Tabs':
        return <ListManager items={props.items || []} onPropChange={onPropChange} />;
      case 'Voting':
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="voting-question">Pergunta da Votação</Label>
                        <Input
                            id="voting-question"
                            value={props.question || ''}
                            onChange={(e) => onPropChange('question', e.target.value)}
                            placeholder="Qual sua pergunta?"
                        />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label>Opções de Voto</Label>
                        <VotingOptionsManager
                            options={props.options || []}
                            onPropChange={onPropChange}
                        />
                    </div>
                </div>
            );
        case 'Stripe':
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="stripe-text">Texto da Tarja</Label>
                        <Textarea
                            id="stripe-text"
                            value={props.text || ''}
                            onChange={(e) => onPropChange('text', e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stripe-link">URL do Link (Opcional)</Label>
                        <Input
                            id="stripe-link"
                            value={props.linkUrl || ''}
                            onChange={(e) => onPropChange('linkUrl', e.target.value)}
                            placeholder="https://exemplo.com"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="stripe-bg-color">Cor de Fundo</Label>
                            <Input
                                id="stripe-bg-color"
                                type="color"
                                value={props.backgroundColor || '#000000'}
                                onChange={(e) => onPropChange('backgroundColor', e.target.value)}
                                className="p-1 h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stripe-text-color">Cor do Texto</Label>
                            <Input
                                id="stripe-text-color"
                                type="color"
                                value={props.textColor || '#FFFFFF'}
                                onChange={(e) => onPropChange('textColor', e.target.value)}
                                className="p-1 h-10"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="stripe-closable">Permitir Fechar</Label>
                        <Switch
                            id="stripe-closable"
                            checked={props.isClosable}
                            onCheckedChange={(checked) => onPropChange('isClosable', checked)}
                        />
                    </div>
                </div>
            );
        case 'NPS':
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nps-question">Pergunta Principal</Label>
                        <Textarea
                            id="nps-question"
                            value={props.question || ''}
                            onChange={(e) => onPropChange('question', e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nps-type">Tipo de Escala</Label>
                        <Select value={props.type || 'numeric'} onValueChange={(value) => onPropChange('type', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="numeric">Numérica (0-10)</SelectItem>
                                <SelectItem value="faces">Carinhas (Emojis)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nps-low-label">Rótulo Inferior</Label>
                        <Input
                            id="nps-low-label"
                            value={props.lowLabel || ''}
                            onChange={(e) => onPropChange('lowLabel', e.target.value)}
                            placeholder="Ex: Pouco provável"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nps-high-label">Rótulo Superior</Label>
                        <Input
                            id="nps-high-label"
                            value={props.highLabel || ''}
                            onChange={(e) => onPropChange('highLabel', e.target.value)}
                            placeholder="Ex: Muito provável"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="nps-thanks">Mensagem de Agradecimento</Label>
                        <Textarea
                            id="nps-thanks"
                            value={props.thankYouMessage || ''}
                            onChange={(e) => onPropChange('thankYouMessage', e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>
            );
      case "Map":
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                    <Label htmlFor="map-embed-url">URL de Incorporação do Google Maps</Label>
                    <Tooltip>
                        <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">
                                No Google Maps, encontre um local, clique em "Compartilhar", depois em "Incorporar um mapa" e copie a URL que está dentro do atributo `src` do iframe.
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <Textarea
                    id="map-embed-url"
                    value={props.embedUrl || ""}
                    onChange={(e) => onPropChange("embedUrl", e.target.value)}
                    rows={5}
                    placeholder='Cole aqui a URL do atributo "src" do iframe de incorporação do Google Maps'
                />
            </div>
        );
      case "SocialIcons":
        const socials: {key: string, label: string}[] = [
            { key: 'facebook', label: 'Facebook' },
            { key: 'instagram', label: 'Instagram' },
            { key: 'twitter', label: 'X (Twitter)' },
            { key: 'linkedin', label: 'LinkedIn' },
            { key: 'youtube', label: 'YouTube' },
            { key: 'tiktok', label: 'TikTok' },
            { key: 'pinterest', label: 'Pinterest' },
            { key: 'snapchat', label: 'Snapchat' },
        ];
        return (
            <div className="space-y-4">
                 <div className="space-y-3">
                    <Label className="font-semibold">Links das Redes Sociais</Label>
                    {socials.map(social => (
                        <div key={social.key} className="space-y-2">
                            <Label htmlFor={`social-${social.key}`}>{social.label}</Label>
                            <Input
                                id={`social-${social.key}`}
                                value={props.links?.[social.key] || ''}
                                onChange={(e) => onSubPropChange('links', social.key, e.target.value)}
                                placeholder={`URL do perfil do ${social.label}`}
                            />
                        </div>
                    ))}
                </div>
                <Separator />
                <div className="space-y-3">
                    <Label className="font-semibold">Estilos</Label>
                    <div className="space-y-2">
                        <Label htmlFor="social-align">Alinhamento</Label>
                        <Select value={props.styles?.align || 'center'} onValueChange={(value) => onSubPropChange('styles', 'align', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o alinhamento" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Esquerda</SelectItem>
                                <SelectItem value="center">Centro</SelectItem>
                                <SelectItem value="right">Direita</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="social-size">Tamanho do Ícone (px)</Label>
                        <Input
                            id="social-size"
                            type="number"
                            value={props.styles?.iconSize?.replace('px','') || 24}
                            onChange={(e) => onSubPropChange('styles', 'iconSize', `${e.target.value}px`)}
                        />
                    </div>
                </div>
            </div>
        );
      case "WhatsApp":
        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="wa-phone">Número de Telefone</Label>
                    <Input
                        id="wa-phone"
                        value={props.phoneNumber || ''}
                        onChange={(e) => onPropChange('phoneNumber', e.target.value)}
                        placeholder="Ex: 5511999999999"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="wa-message">Mensagem Padrão</Label>
                    <Textarea
                        id="wa-message"
                        value={props.defaultMessage || ''}
                        onChange={(e) => onPropChange('defaultMessage', e.target.value)}
                        rows={4}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="wa-position">Posição do Botão</Label>
                    <Select value={props.position || 'bottom-right'} onValueChange={(value) => onPropChange('position', value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bottom-right">Canto Inferior Direito</SelectItem>
                            <SelectItem value="bottom-left">Canto Inferior Esquerdo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
      case "Footer":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="footer-text-1">Texto do Rodapé 1</Label>
                  <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Primeira linha de texto no rodapé (ex: copyright).</p></TooltipContent>
                  </Tooltip>
                </div>
                <DebouncedTextInput id="footer-text-1" value={props.footerText1 || ""} onBlur={(value) => onPropChange("footerText1", value)} rows={3}/>
            </div>
            <div className="space-y-2">
                 <div className="flex items-center gap-1.5">
                  <Label htmlFor="footer-text-2">Texto do Rodapé 2</Label>
                   <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Segunda linha de texto no rodapé (ex: informações da empresa).</p></TooltipContent>
                  </Tooltip>
                </div>
                <DebouncedTextInput id="footer-text-2" value={props.footerText2 || ""} onBlur={(value) => onPropChange("footerText2", value)} rows={6} />
            </div>
            <div className="space-y-2">
                 <div className="flex items-center gap-1.5">
                  <Label htmlFor="footer-text-3">Texto do Rodapé 3</Label>
                   <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>Terceira linha de texto no rodapé (ex: aviso legal).</p></TooltipContent>
                  </Tooltip>
                </div>
                <DebouncedTextInput id="footer-text-3" value={props.footerText3 || ""} onBlur={(value) => onPropChange("footerText3", value)} rows={4}/>
            </div>
          </div>
        );
      default:
        return <p className="text-sm text-muted-foreground">Nenhuma configuração disponível para este componente.</p>;
    }
}

export function ComponentSettings({ component, onComponentChange }: ComponentSettingsProps) {

  const abTestEnabled = component.abTestEnabled || false;
  const variantProps = (component.abTestVariants && component.abTestVariants[0]) || {};

  const handlePropChange = (prop: string, value: any) => {
    const updatedComponent = produce(component, draft => {
      draft.props[prop] = value;
    });
    onComponentChange(component.id, updatedComponent);
  };

  const handleSubPropChange = (prop: string, subProp: string, value: any) => {
    const updatedComponent = produce(component, draft => {
        if (!draft.props[prop]) {
            draft.props[prop] = {};
        }
        draft.props[prop][subProp] = value;
    });
    onComponentChange(component.id, updatedComponent);
  };

  const handleAbTestToggle = (checked: boolean) => {
    const updatedComponent = produce(component, draft => {
      draft.abTestEnabled = checked;
      if (checked && (!draft.abTestVariants || draft.abTestVariants.length === 0)) {
        draft.abTestVariants = [{}];
      }
    });
    onComponentChange(component.id, updatedComponent);
  };
  

  const handleVariantPropChange = (variantIndex: number, prop: string, value: any) => {
    const updatedComponent = produce(component, draft => {
      if (!draft.abTestVariants) {
        draft.abTestVariants = [];
      }
      while (draft.abTestVariants.length <= variantIndex) {
        draft.abTestVariants.push({});
      }
      draft.abTestVariants[variantIndex] = {
        ...draft.abTestVariants[variantIndex],
        [prop]: value,
      };
    });
    onComponentChange(component.id, updatedComponent);
  };
  
  const handleVariantSubPropChange = (variantIndex: number, prop: string, subProp: string, value: any) => {
    const updatedComponent = produce(component, draft => {
        if (!draft.abTestVariants) {
            draft.abTestVariants = [{}];
        }
        if (!draft.abTestVariants[variantIndex]) {
            draft.abTestVariants[variantIndex] = {};
        }
        if (!draft.abTestVariants[variantIndex][prop]) {
            draft.abTestVariants[variantIndex][prop] = {};
        }
        draft.abTestVariants[variantIndex][prop][subProp] = value;
    });
    onComponentChange(component.id, updatedComponent);
  };


  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
            <h3 className="text-sm font-medium mb-4">Configurações Gerais</h3>
            {renderComponentSettings(component.type, component.props, handlePropChange, handleSubPropChange)}
        </div>
        
        <Separator />
        
        <div>
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2"><Scaling className="h-4 w-4" /> Espaçamento</h3>
            <SpacingSettings props={component.props} onPropChange={handlePropChange} />
        </div>

        <Separator />
        
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <Label htmlFor="ab-test-enabled" className="flex items-center gap-2 font-semibold">
                    <Star className="h-4 w-4 text-yellow-500"/>
                    Teste A/B
                </Label>
                <Switch
                    id="ab-test-enabled"
                    checked={abTestEnabled}
                    onCheckedChange={handleAbTestToggle}
                />
            </div>
            {abTestEnabled && (
                <div className="p-4 border rounded-md space-y-6 bg-muted/30">
                     <h4 className="font-medium text-sm text-muted-foreground">Configurações da Variante B</h4>
                     <div>
                        <h3 className="text-sm font-medium mb-4">Configurações Gerais (Variante)</h3>
                         {renderComponentSettings(
                             component.type, 
                             variantProps, 
                             (prop, value) => handleVariantPropChange(0, prop, value), 
                             (prop, subProp, value) => handleVariantSubPropChange(0, prop, subProp, value)
                          )}
                     </div>
                     <Separator/>
                     <div>
                        <h3 className="text-sm font-medium mb-4 flex items-center gap-2"><Scaling className="h-4 w-4" /> Espaçamento (Variante)</h3>
                        <SpacingSettings props={variantProps} onPropChange={(prop, value) => handleVariantPropChange(0, prop, value)} />
                     </div>
                </div>
            )}
        </div>
      </div>
    </TooltipProvider>
  )
}

    
    