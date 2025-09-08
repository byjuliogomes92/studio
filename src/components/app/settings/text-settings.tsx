
import type { PageComponent, CloudPage } from "@/lib/types";
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HelpCircle, AlignLeft, AlignCenter, AlignRight, Bold, Wand2, Zap, Italic, Underline, Strikethrough, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AiGenerateTextDialog } from "./ai-generate-text-dialog";
import { ColorInput } from "./color-input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ComponentSettingsProps {
  component: PageComponent;
  onPropChange: (prop: string, value: any) => void;
  onSubPropChange: (prop: string, subProp: string, value: any) => void;
  pageState: CloudPage;
}

function TextStyleSettings({ props, onPropChange, onSubPropChange, pageState }: { props: any, onPropChange: (prop: string, value: any) => void, onSubPropChange: (prop: string, subProp: string, value: any) => void, pageState: CloudPage }) {
  const styles = props.styles || {};
  const isTitle = props.isTitle; // A flag to know if we are styling a title
  
  const handleStyleChange = (prop: string, value: any) => {
    onSubPropChange('styles', prop, value);
  };
  
   const handleGradientChange = (prop: 'from' | 'to', value: string) => {
    const newGradient = { ...(styles.gradient || {}), [prop]: value };
    onSubPropChange('styles', 'gradient', newGradient);
  };


  return (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label>Alinhamento</Label>
            <ToggleGroup 
                type="single" 
                value={styles.textAlign || 'left'} 
                onValueChange={(value) => value && handleStyleChange('textAlign', value)}
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
             <ColorInput
                label="Cor"
                value={styles.color || ''}
                onChange={(value) => handleStyleChange('color', value)}
                brand={pageState.brand}
             />
          </div>
        </div>
         {isTitle && (
            <div className="space-y-2">
                <Label>Gradiente de Texto</Label>
                 <div className="grid grid-cols-2 gap-4">
                     <ColorInput label="De" value={styles.gradient?.from || ''} onChange={value => handleGradientChange('from', value)} brand={pageState.brand} />
                     <ColorInput label="Para" value={styles.gradient?.to || ''} onChange={value => handleGradientChange('to', value)} brand={pageState.brand} />
                 </div>
                 <p className="text-xs text-muted-foreground">Preencha para ativar o gradiente. Isso sobrescreve a cor sólida.</p>
            </div>
        )}
         <div className="space-y-2">
            <Label>Estilo</Label>
             <ToggleGroup 
                type="multiple" 
                variant="outline"
                value={
                    Object.entries({
                        'bold': styles.fontWeight === 'bold',
                        'italic': styles.fontStyle === 'italic',
                        'underline': styles.textDecoration?.includes('underline'),
                        'line-through': styles.textDecoration?.includes('line-through')
                    }).filter(([,v]) => v).map(([k]) => k)
                } 
                onValueChange={(value) => {
                    const decorations = value.filter(v => ['underline', 'line-through'].includes(v));
                    handleStyleChange('fontWeight', value.includes('bold') ? 'bold' : 'normal');
                    handleStyleChange('fontStyle', value.includes('italic') ? 'italic' : 'normal');
                    handleStyleChange('textDecoration', decorations.join(' '));
                }}
            >
                <ToggleGroupItem value="bold" aria-label="Negrito"><Bold className="h-4 w-4" /></ToggleGroupItem>
                <ToggleGroupItem value="italic" aria-label="Itálico"><Italic className="h-4 w-4" /></ToggleGroupItem>
                <ToggleGroupItem value="underline" aria-label="Sublinhado"><Underline className="h-4 w-4" /></ToggleGroupItem>
                <ToggleGroupItem value="line-through" aria-label="Tachado"><Strikethrough className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
        </div>
    </div>
  );
}

export function TextSettings({ component, onPropChange, onSubPropChange, pageState }: ComponentSettingsProps) {
    const isParagraph = component.type === 'Paragraph';
    const isTitle = component.type === 'Title';
    const [localText, setLocalText] = useState(component.props.text || "");
    const hasChanges = localText !== component.props.text;

    const handleSaveText = () => {
        onPropChange("text", localText);
    };

    return (
        <div className="space-y-4">
          <div className="space-y-2">
              <div className="flex items-center justify-between gap-1.5">
                <Label htmlFor="text-content">Conteúdo (aceita HTML)</Label>
                 <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                      <TooltipContent>
                          <p className="max-w-xs">Este é o texto exibido se o campo de dados conectado não for encontrado. {isParagraph && 'Suporta HTML básico.'}</p>
                      </TooltipContent>
                  </Tooltip>
              </div>
               <div className="relative">
                  <Textarea
                      id="text-content"
                      value={localText}
                      onChange={(e) => setLocalText(e.target.value)}
                      rows={isParagraph ? 8 : 4}
                      className="pr-10"
                  />
                  <AiGenerateTextDialog
                      componentType={component.type}
                      currentText={localText}
                      onTextGenerated={(newText: string) => {
                          setLocalText(newText);
                          onPropChange("text", newText); // Also update immediately on AI generation
                      }}
                      trigger={
                          <button className="absolute top-2 right-2 h-7 w-7 text-primary hover:bg-accent rounded-md grid place-items-center">
                              <Wand2 className="h-4 w-4" />
                          </button>
                      }
                  />
              </div>
              <Button onClick={handleSaveText} disabled={!hasChanges} size="sm" className="mt-2 w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar Texto
              </Button>
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
                    value={component.props.dataBinding || ''}
                    onChange={(e) => onPropChange('dataBinding', e.target.value)}
                    placeholder="Ex: FirstName"
                 />
              </div>
          </div>
          <Separator />
          <TextStyleSettings props={{...component.props, isTitle}} onPropChange={onPropChange} onSubPropChange={onSubPropChange} pageState={pageState} />
        </div>
      );
}
