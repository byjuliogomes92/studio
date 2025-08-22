

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
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComponentSettings } from "./component-settings";
import { GripVertical, Plus, Trash2, HelpCircle, Text, Heading1, Heading2, Minus, Image, Film, Timer, MousePointerClick, StretchHorizontal, Cookie, Layers, PanelTop, Vote } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";

interface SettingsPanelProps {
  pageState: CloudPage;
  setPageState: Dispatch<SetStateAction<CloudPage>>;
  selectedComponentId: string | null;
  setSelectedComponentId: Dispatch<SetStateAction<string | null>>;
  pageName: string;
  setPageName: Dispatch<SetStateAction<string>>;
}

const componentIcons: Record<ComponentType, React.ElementType> = {
    Header: Heading1,
    Footer: Heading1,
    Banner: Image,
    Form: Text,
    Title: Heading1,
    Subtitle: Heading2,
    Paragraph: Text,
    Divider: Minus,
    Image: Image,
    Video: Film,
    Countdown: Timer,
    Button: MousePointerClick,
    Spacer: StretchHorizontal,
    Accordion: Layers,
    Tabs: PanelTop,
    Voting: Vote,
    Stripe: PanelTop,
};


export function SettingsPanel({
  pageState,
  setPageState,
  selectedComponentId,
  setSelectedComponentId,
  pageName,
  setPageName,
}: SettingsPanelProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    setPageState(prev => ({ ...prev, tags }));
  };

  const handleStyleChange = (prop: keyof CloudPage["styles"], value: string) => {
    setPageState((prev) => ({ ...prev, styles: { ...prev.styles, [prop]: value } }));
  };

  const handleMetaChange = (prop: keyof CloudPage["meta"], value: string) => {
    setPageState((prev) => ({ ...prev, meta: { ...prev.meta, [prop]: value } }));
  };
  
  const handleCookieBannerChange = (prop: keyof NonNullable<CloudPage['cookieBanner']>, value: any) => {
     setPageState(prev => ({
      ...prev,
      cookieBanner: {
        ...(prev.cookieBanner || { enabled: false, text: '', buttonText: '' }),
        [prop]: value,
      },
    }));
  }

  const handleTrackingChange = (
    pixel: 'ga4' | 'meta' | 'linkedin',
    prop: 'enabled' | 'id',
    value: boolean | string
  ) => {
    setPageState(prev => ({
        ...prev,
        meta: {
            ...prev.meta,
            tracking: {
                ...(prev.meta.tracking || { 
                    ga4: { enabled: false },
                    meta: { enabled: false },
                    linkedin: { enabled: false }
                }),
                [pixel]: {
                    ...(prev.meta.tracking?.[pixel] || { enabled: false }),
                    [prop]: value
                }
            }
        }
    }));
  };

  const addComponent = (type: ComponentType) => {
    let props: PageComponent['props'] = {};
    const baseProps = { id: Date.now().toString(), type };

    switch(type) {
        case 'Form':
            props = {
                fields: { name: true, email: true, phone: true, cpf: true, city: false, birthdate: false, optin: true },
                placeholders: { name: 'Nome', email: 'Email', phone: 'Telefone - Ex:(11) 9 9999-9999', cpf: 'CPF', city: 'Cidade', birthdate: 'Data de Nascimento' },
                consentText: `Quero receber novidades e promoções da Natura e de outras empresas do Grupo Natura &Co...`,
                buttonText: 'Finalizar'
            };
            break;
        case 'Countdown':
            props = { targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) }; // Default to 10 days from now
            break;
        case 'Spacer':
            props = { height: 20 };
            break;
        case 'Divider':
            props = { thickness: 1, style: 'solid', color: '#cccccc', margin: 20 };
            break;
        case 'Button':
            props = { text: 'Clique Aqui', href: '#', align: 'center' };
            break;
        case 'Accordion':
        case 'Tabs':
            props = {
                items: [
                    { id: 'item-1', title: 'Item 1', content: 'Conteúdo do item 1.' },
                    { id: 'item-2', title: 'Item 2', content: 'Conteúdo do item 2.' },
                ]
            };
            break;
        case 'Voting':
            props = {
                question: 'Qual sua cor favorita?',
                options: [
                    { id: 'opt1', text: 'Azul' },
                    { id: 'opt2', text: 'Verde' },
                ]
            };
            break;
        case 'Stripe':
            props = {
                text: 'Anúncio ou aviso importante aqui!',
                isClosable: true,
                backgroundColor: '#000000',
                textColor: '#FFFFFF',
                linkUrl: ''
            };
            break;
        // Other components get empty props by default
    }

    const newComponent: PageComponent = { ...baseProps, props, };

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
    setPageState(prev => ({ ...prev, components: items }));
  };

  const handlePropChange = (id: string, prop: string, value: any) => {
    setPageState((prev) => ({
      ...prev,
      components: prev.components.map((c) =>
        c.id === id ? { ...c, props: { ...c.props, [prop]: value } } : c
      ),
    }));
  };

  const handleSubPropChange = (id: string, prop: string, subProp: string, value: any) => {
    setPageState((prev) => ({
      ...prev,
      components: prev.components.map((c) =>
        c.id === id
          ? {
            ...c,
            props: {
              ...c.props,
              [prop]: {
                ...c.props[prop],
                [subProp]: value,
              },
            },
          }
          : c
      ),
    }));
  };

  const selectedComponent = pageState.components.find((c) => c.id === selectedComponentId);
  const tracking = pageState.meta.tracking;
  const cookieBanner = pageState.cookieBanner;

  return (
    <ScrollArea className="h-full">
      <TooltipProvider>
        <div className="p-4 space-y-6">
          <Accordion type="multiple" defaultValue={['page-settings', 'components']} className="w-full">
            <AccordionItem value="page-settings">
              <AccordionTrigger>Configurações da Página</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="page-name">Nome da Página</Label>
                  <Input
                    id="page-name"
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                    placeholder="Ex: Campanha Dia das Mães"
                  />
                </div>
                 <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="page-tags">Tags</Label>
                        <Tooltip>
                            <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                            <TooltipContent><p>Separe as tags por vírgulas (ex: Brasil, Latam, CF).</p></TooltipContent>
                        </Tooltip>
                    </div>
                  <Input
                    id="page-tags"
                    value={(pageState.tags || []).join(', ')}
                    onChange={handleTagChange}
                    placeholder="Ex: Brasil, Latam, CF"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="styles">
              <AccordionTrigger>Estilos Globais</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label>Cor de Fundo</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent><p>Selecione a cor de fundo principal da página.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Input type="color" value={pageState.styles.backgroundColor} onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} className="p-1" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label>URL da Imagem de Fundo</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent><p>Forneça uma URL para uma imagem de fundo.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Input value={pageState.styles.backgroundImage} onChange={(e) => handleStyleChange('backgroundImage', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label>Cor do Tema</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent><p>Define a cor principal para botões e outros elementos.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Input type="color" value={pageState.styles.themeColor} onChange={(e) => handleStyleChange('themeColor', e.target.value)} className="p-1" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label>Cor do Tema (Hover)</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent><p>A cor dos botões quando o usuário passa o mouse sobre eles.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Input type="color" value={pageState.styles.themeColorHover} onChange={(e) => handleStyleChange('themeColorHover', e.target.value)} className="p-1" />
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
                          {pageState.components.map((c, index) => {
                            const Icon = componentIcons[c.type] || Text;
                            return (
                                <Draggable key={c.id} draggableId={c.id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="flex items-center gap-2 group"
                                    >
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                    <Button
                                        variant={selectedComponentId === c.id ? "secondary" : "ghost"}
                                        className="flex-grow justify-start"
                                        onClick={() => setSelectedComponentId(c.id)}
                                    >
                                        <Icon className="h-4 w-4 mr-2"/>
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
                            )
                          })}
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
                    <DropdownMenuItem onClick={() => addComponent("Form")}>Formulário</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addComponent("Footer")}>Rodapé</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => addComponent("Title")}>Título</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addComponent("Subtitle")}>Subtítulo</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addComponent("Paragraph")}>Parágrafo</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addComponent("Image")}>Imagem</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addComponent("Video")}>Vídeo</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => addComponent("Accordion")}>Accordion</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addComponent("Tabs")}>Tabs</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addComponent("Voting")}>Votação</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addComponent("Stripe")}>Tarja</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => addComponent("Countdown")}>Contador Regressivo</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addComponent("Button")}>Botão</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addComponent("Divider")}>Divisor</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addComponent("Spacer")}>Espaçador</DropdownMenuItem>
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
                    onSubPropChange={(prop, subProp, value) => handleSubPropChange(selectedComponent.id, prop, subProp, value)}
                  />
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="meta">
              <AccordionTrigger>Configurações, SEO & Pixels</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label>Título da Página</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent><p>O título que aparece na aba do navegador (tag &lt;title&gt;).</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Input value={pageState.meta.title} onChange={(e) => handleMetaChange('title', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label>Meta Descrição</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent><p>Um resumo conciso do conteúdo da página para os motores de busca.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea value={pageState.meta.metaDescription} onChange={(e) => handleMetaChange('metaDescription', e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label>Meta Palavras-chave</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent><p>Palavras-chave relevantes para a página, separadas por vírgulas.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Input value={pageState.meta.metaKeywords} onChange={(e) => handleMetaChange('metaKeywords', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label>URL do Favicon</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent><p>O ícone pequeno na aba do navegador (favicon).</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Input value={pageState.meta.faviconUrl} onChange={(e) => handleMetaChange('faviconUrl', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label>URL da Imagem de Carregamento</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent><p>Imagem para exibir durante o carregamento da página.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Input value={pageState.meta.loaderImageUrl} onChange={(e) => handleMetaChange('loaderImageUrl', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label>URL de Redirecionamento</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent><p>URL para redirecionar após o envio do formulário.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Input value={pageState.meta.redirectUrl} onChange={(e) => handleMetaChange('redirectUrl', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label>Chave da Data Extension</Label>                 <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                      <TooltipContent><p>A Chave Externa da Data Extension do Salesforce Marketing Cloud.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Input value={pageState.meta.dataExtensionKey} onChange={(e) => handleMetaChange('dataExtensionKey', e.target.value)} />
                </div>

                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Tracking & Pixels</h4>
                  {/* GA4 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ga4-enabled">Google Analytics 4</Label>
                      <Switch id="ga4-enabled" checked={tracking?.ga4?.enabled} onCheckedChange={(checked) => handleTrackingChange('ga4', 'enabled', checked)} />
                    </div>
                    {tracking?.ga4?.enabled && (
                      <Input placeholder="ID de métricas (G-XXXXXXXXXX)" value={tracking?.ga4?.id || ''} onChange={(e) => handleTrackingChange('ga4', 'id', e.target.value)} />
                    )}
                  </div>
                  {/* Meta Pixel */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="meta-enabled">Meta Pixel</Label>
                      <Switch id="meta-enabled" checked={tracking?.meta?.enabled} onCheckedChange={(checked) => handleTrackingChange('meta', 'enabled', checked)} />
                    </div>
                    {tracking?.meta?.enabled && (
                      <Input placeholder="ID do Pixel" value={tracking?.meta?.id || ''} onChange={(e) => handleTrackingChange('meta', 'id', e.target.value)} />
                    )}
                  </div>
                  {/* LinkedIn Pixel */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="linkedin-enabled">LinkedIn Insight Tag</Label>
                      <Switch id="linkedin-enabled" checked={tracking?.linkedin?.enabled} onCheckedChange={(checked) => handleTrackingChange('linkedin', 'enabled', checked)} />
                    </div>
                    {tracking?.linkedin?.enabled && (
                      <Input placeholder="ID de parceiro" value={tracking?.linkedin?.id || ''} onChange={(e) => handleTrackingChange('linkedin', 'id', e.target.value)} />
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="cookie-banner">
                <AccordionTrigger>Banner de Cookies</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="cookie-enabled" className="flex items-center gap-2">
                            <Cookie className="h-4 w-4"/>
                            Ativar Banner de Cookies
                        </Label>
                        <Switch
                            id="cookie-enabled"
                            checked={cookieBanner?.enabled || false}
                            onCheckedChange={(checked) => handleCookieBannerChange('enabled', checked)}
                        />
                    </div>
                    {cookieBanner?.enabled && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="cookie-text">Texto do Banner</Label>
                                <Textarea
                                    id="cookie-text"
                                    value={cookieBanner.text}
                                    onChange={(e) => handleCookieBannerChange('text', e.target.value)}
                                    rows={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cookie-button-text">Texto do Botão</Label>
                                <Input
                                    id="cookie-button-text"
                                    value={cookieBanner.buttonText}
                                    onChange={(e) => handleCookieBannerChange('buttonText', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </TooltipProvider>
    </ScrollArea>
  );
}
