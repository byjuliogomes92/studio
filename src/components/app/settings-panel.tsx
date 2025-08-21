
"use client";

import type { Dispatch, SetStateAction } from "react";
import type { CloudPage, ComponentType, PageComponent } from "@/lib/types";
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComponentSettings } from "./component-settings";
import { GripVertical, Plus, Trash2, HelpCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "../ui/textarea";


interface SettingsPanelProps {
  pageState: CloudPage;
  setPageState: Dispatch<SetStateAction<CloudPage>>;
  selectedComponentId: string | null;
  setSelectedComponentId: Dispatch<SetStateAction<string | null>>;
}

export function SettingsPanel({
  pageState,
  setPageState,
  selectedComponentId,
  setSelectedComponentId,
}: SettingsPanelProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const handleStyleChange = (prop: keyof CloudPage["styles"], value: string) => {
    setPageState((prev) => ({ ...prev, styles: { ...prev.styles, [prop]: value } }));
  };

  const handleMetaChange = (prop: keyof CloudPage["meta"], value: string) => {
    setPageState((prev) => ({ ...prev, meta: { ...prev.meta, [prop]: value } }));
  };

  const addComponent = (type: ComponentType) => {
    const newComponent: PageComponent = {
      id: Date.now().toString(),
      type,
      props: {},
    };
    setPageState((prev) => ({
      ...prev,
      components: [...prev.components, newComponent],
    }));
    setSelectedComponentId(newComponent.id);
  };

  const removeComponent = (id: string) => {
    setPageState((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== id),
    }));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  };
  
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(pageState.components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPageState(prev => ({...prev, components: items}));
  };

  const handlePropChange = (id: string, prop: string, value: any) => {
    setPageState((prev) => ({
      ...prev,
      components: prev.components.map((c) =>
        c.id === id ? { ...c, props: { ...c.props, [prop]: value } } : c
      ),
    }));
  };

  const selectedComponent = pageState.components.find((c) => c.id === selectedComponentId);

  return (
    <ScrollArea className="h-full">
    <TooltipProvider>
    <div className="p-4 space-y-6">
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="styles">
          <AccordionTrigger>Estilos Globais</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label>Cor de Fundo</Label>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>Selecione a cor de fundo principal da página.</p></TooltipContent>
                </Tooltip>
              </div>
              <Input type="color" value={pageState.styles.backgroundColor} onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} className="p-1"/>
            </div>
             <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label>URL da Imagem de Fundo</Label>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>Forneça uma URL para uma imagem de fundo.</p></TooltipContent>
                </Tooltip>
              </div>
              <Input value={pageState.styles.backgroundImage} onChange={(e) => handleStyleChange('backgroundImage', e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label>Cor do Tema</Label>
                 <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>Define a cor principal para botões e outros elementos.</p></TooltipContent>
                </Tooltip>
              </div>
              <Input type="color" value={pageState.styles.themeColor} onChange={(e) => handleStyleChange('themeColor', e.target.value)} className="p-1"/>
            </div>
             <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label>Cor do Tema (Hover)</Label>
                 <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>A cor dos botões quando o usuário passa o mouse sobre eles.</p></TooltipContent>
                </Tooltip>
              </div>
              <Input type="color" value={pageState.styles.themeColorHover} onChange={(e) => handleStyleChange('themeColorHover', e.target.value)} className="p-1"/>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="components">
          <AccordionTrigger>Componentes</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
             {isClient && (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="components">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {pageState.components.map((c, index) => (
                        <Draggable key={c.id} draggableId={c.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center gap-2 group"
                            >
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Button
                                variant={selectedComponentId === c.id ? "secondary" : "ghost"}
                                className="flex-grow justify-start"
                                onClick={() => setSelectedComponentId(c.id)}
                              >
                                {c.type}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive/80 hover:text-destructive"
                                onClick={() => removeComponent(c.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Componente
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => addComponent("Header")}>Header</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addComponent("Banner")}>Banner</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addComponent("TextBlock")}>Bloco de Texto</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addComponent("Image")}>Imagem</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addComponent("Form")}>Formulário</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addComponent("Footer")}>Rodapé</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </AccordionContent>
        </AccordionItem>
         {selectedComponent && (
          <AccordionItem value="component-settings">
            <AccordionTrigger>Configurações de {selectedComponent.type}</AccordionTrigger>
            <AccordionContent className="pt-2">
                <ComponentSettings
                component={selectedComponent}
                onPropChange={(prop, value) => handlePropChange(selectedComponent.id, prop, value)}
                />
            </AccordionContent>
          </AccordionItem>
        )}
         <AccordionItem value="meta">
          <AccordionTrigger>Configurações e SEO</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label>Título da Página</Label>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>O título que aparece na aba do navegador (tag &lt;title&gt;).</p></TooltipContent>
                </Tooltip>
              </div>
              <Input value={pageState.meta.title} onChange={(e) => handleMetaChange('title', e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label>Meta Descrição</Label>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>Um resumo conciso do conteúdo da página para os motores de busca.</p></TooltipContent>
                </Tooltip>
              </div>
              <Textarea value={pageState.meta.metaDescription} onChange={(e) => handleMetaChange('metaDescription', e.target.value)} rows={3} />
            </div>
             <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label>Meta Palavras-chave</Label>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>Palavras-chave relevantes para a página, separadas por vírgulas.</p></TooltipContent>
                </Tooltip>
              </div>
              <Input value={pageState.meta.metaKeywords} onChange={(e) => handleMetaChange('metaKeywords', e.target.value)} />
            </div>
             <div className="space-y-2">
               <div className="flex items-center gap-1.5">
                <Label>URL do Favicon</Label>
                <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>O ícone pequeno na aba do navegador (favicon).</p></TooltipContent>
                </Tooltip>
              </div>
              <Input value={pageState.meta.faviconUrl} onChange={(e) => handleMetaChange('faviconUrl', e.target.value)} />
            </div>
             <div className="space-y-2">
               <div className="flex items-center gap-1.5">
                <Label>URL da Imagem de Carregamento</Label>
                 <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>Imagem para exibir durante o carregamento da página.</p></TooltipContent>
                </Tooltip>
              </div>
              <Input value={pageState.meta.loaderImageUrl} onChange={(e) => handleMetaChange('loaderImageUrl', e.target.value)} />
            </div>
             <div className="space-y-2">
               <div className="flex items-center gap-1.5">
                <Label>URL de Redirecionamento</Label>
                 <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>URL para redirecionar após o envio do formulário.</p></TooltipContent>
                </Tooltip>
              </div>
              <Input value={pageState.meta.redirectUrl} onChange={(e) => handleMetaChange('redirectUrl', e.target.value)} />
            </div>
            <div className="space-y-2">
               <div className="flex items-center gap-1.5">
                <Label>Chave da Data Extension</Label>
                 <Tooltip>
                  <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                  <TooltipContent><p>A Chave Externa da Data Extension do Salesforce Marketing Cloud.</p></TooltipContent>
                </Tooltip>
              </div>
              <Input value={pageState.meta.dataExtensionKey} onChange={(e) => handleMetaChange('dataExtensionKey', e.target.value)} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
    </TooltipProvider>
    </ScrollArea>
  );
}
