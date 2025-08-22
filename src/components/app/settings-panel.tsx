
"use client";

import type { Dispatch, SetStateAction } from "react";
import type { CloudPage, ComponentType, PageComponent } from "@/lib/types";
import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComponentSettings } from "./component-settings";
import { GripVertical, Trash2, HelpCircle, Text, Heading1, Heading2, Minus, Image, Film, Timer, MousePointerClick, StretchHorizontal, Cookie, Layers, PanelTop, Vote, Smile, MapPin, AlignStartVertical, AlignEndVertical, Star } from "lucide-react";
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
import { AddComponentDialog } from './add-component-dialog';

interface SettingsPanelProps {
  pageState: CloudPage;
  setPageState: Dispatch<SetStateAction<CloudPage | null>>;
  selectedComponentId: string | null;
  setSelectedComponentId: Dispatch<SetStateAction<string | null>>;
  pageName: string;
  setPageName: Dispatch<SetStateAction<string>>;
  onComponentChange: (id: string, newProps: Partial<PageComponent>) => void;
}

const componentIcons: Record<ComponentType, React.ElementType> = {
    Header: AlignStartVertical,
    Footer: AlignEndVertical,
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
    NPS: Smile,
    Map: MapPin,
};

function SortableItem({ component, selectedComponentId, setSelectedComponentId, removeComponent }: {
  component: PageComponent;
  selectedComponentId: string | null;
  setSelectedComponentId: Dispatch<SetStateAction<string | null>>;
  removeComponent: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: component.id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const Icon = componentIcons[component.type] || Text;
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 group">
      <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab h-8 w-8">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </Button>
      <Button
          variant={selectedComponentId === component.id ? "secondary" : "ghost"}
          className="flex-grow justify-start"
          onClick={() => setSelectedComponentId(component.id)}
      >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4"/>
            <span>{component.type}</span>
            {component.abTestEnabled && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
          </div>
      </Button>
      <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive/80 hover:text-destructive"
          onClick={() => removeComponent(component.id)}
      >
          <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function SettingsPanel({
  pageState,
  setPageState,
  selectedComponentId,
  setSelectedComponentId,
  pageName,
  setPageName,
  onComponentChange,
}: SettingsPanelProps) {

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    setPageState(prev => prev ? ({ ...prev, tags }) : null);
  };

  const handleStyleChange = (prop: keyof CloudPage["styles"], value: string) => {
    setPageState((prev) => prev ? ({ ...prev, styles: { ...prev.styles, [prop]: value } }) : null);
  };

  const handleMetaChange = (prop: keyof CloudPage["meta"], value: string) => {
    setPageState((prev) => prev ? ({ ...prev, meta: { ...prev.meta, [prop]: value } }) : null);
  };
  
  const handleCookieBannerChange = (prop: keyof NonNullable<CloudPage['cookieBanner']>, value: any) => {
     setPageState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        cookieBanner: {
          ...(prev.cookieBanner || { enabled: false, text: '', buttonText: '' }),
          [prop]: value,
        },
      }
    });
  }

  const handleTrackingChange = (
    pixel: 'ga4' | 'meta' | 'linkedin',
    prop: 'enabled' | 'id',
    value: boolean | string
  ) => {
    setPageState(prev => {
        if (!prev) return null;
        return {
            ...prev,
            meta: {
                ...prev.meta,
                tracking: {
                    ...(prev.meta.tracking || { 
                        ga4: { enabled: false, id: '' },
                        meta: { enabled: false, id: '' },
                        linkedin: { enabled: false, id: '' }
                    }),
                    [pixel]: {
                        ...(prev.meta.tracking?.[pixel] || { enabled: false, id: '' }),
                        [prop]: value
                    }
                }
            }
        }
    });
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
        case 'NPS':
            props = {
                question: 'Em uma escala de 0 a 10, o quão provável você é de recomendar nosso produto/serviço a um amigo ou colega?',
                type: 'numeric',
                lowLabel: 'Pouco provável',
                highLabel: 'Muito provável',
                thankYouMessage: 'Obrigado pelo seu feedback!'
            };
            break;
        case 'Map':
            props = {
                embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.098048256196!2d-46.65684698502213!3d-23.56424408468112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0x4a3ec19a97a8d4d7!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1620994773418!5m2!1spt-BR!2sbr'
            };
            break;
        // Other components get empty props by default
    }

    const newComponent: PageComponent = { ...baseProps, props, abTestEnabled: false, abTestVariants: [] };

    setPageState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        components: [...prev.components, newComponent],
      }
    });
    setSelectedComponentId(newComponent.id);
  };

  const removeComponent = (id: string) => {
    setPageState((prev) => {
      if (!prev) return null;
      return {
      ...prev,
      components: prev.components.filter((c) => c.id !== id),
    }});
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;

    if (active.id !== over?.id) {
      setPageState((page) => {
        if (!page) return null;
        const oldIndex = page.components.findIndex((c) => c.id === active.id);
        const newIndex = page.components.findIndex((c) => c.id === over?.id);
        return {
          ...page,
          components: arrayMove(page.components, oldIndex, newIndex),
        };
      });
    }
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
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={pageState.components}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                    {pageState.components.map((c) => (
                      <SortableItem 
                        key={c.id} 
                        component={c}
                        selectedComponentId={selectedComponentId}
                        setSelectedComponentId={setSelectedComponentId}
                        removeComponent={removeComponent}
                      />
                    ))}
                    </div>
                  </SortableContext>
                </DndContext>
                <AddComponentDialog onAddComponent={addComponent} />
              </AccordionContent>
            </AccordionItem>
            {selectedComponent && (
              <AccordionItem value="component-settings">
                <AccordionTrigger>Configurações de {selectedComponent.type}</AccordionTrigger>
                <AccordionContent className="pt-2">
                  <ComponentSettings
                    component={selectedComponent}
                    onComponentChange={onComponentChange}
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
