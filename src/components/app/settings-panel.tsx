

"use client";

import type { Dispatch, SetStateAction } from "react";
import type { CloudPage, ComponentType, PageComponent } from "@/lib/types";
import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, type Active, type Over } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { produce } from 'immer';
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
import { GripVertical, Trash2, HelpCircle, Text, Heading1, Heading2, Minus, Image, Film, Timer, MousePointerClick, StretchHorizontal, Cookie, Layers, PanelTop, Vote, Smile, MapPin, AlignStartVertical, AlignEndVertical, Star, Code, Share2, Columns, Lock } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cn } from "@/lib/utils";


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
    SocialIcons: Share2,
    Columns: Columns,
};

const googleFonts = [
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Oswald",
    "Source Sans Pro",
    "Raleway",
    "Poppins",
    "Nunito",
    "Merriweather",
];

function SortableItem({ component, children }: { component: PageComponent; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id, data: { type: 'component', component } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };
  
  // Clone the child and pass the dnd props to it
  const childWithDndProps = React.cloneElement(children as React.ReactElement, {
    dndAttributes: attributes,
    dndListeners: listeners,
  });

  return (
    <div ref={setNodeRef} style={style}>
      {React.isValidElement(children) ? React.cloneElement(children, {
          // Pass dnd props only if the child is the ComponentItem for a Column container
          // or if it's a regular ComponentItem
          dndAttributes: attributes,
          dndListeners: listeners,
        }) : children}
    </div>
  );
}

function ColumnDropzone({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
  const { setNodeRef, isOver } = useSortable({ id, data: { type: 'column', isColumn: true } });
  
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-2 bg-muted/40 rounded-lg min-h-[80px] flex flex-col gap-2 transition-colors",
        isOver ? 'bg-primary/20 ring-2 ring-primary' : '',
        className
      )}
    >
      {children}
    </div>
  );
}


function ComponentItem({
  component,
  selectedComponentId,
  setSelectedComponentId,
  removeComponent,
  dndAttributes,
  dndListeners,
}: {
  component: PageComponent;
  selectedComponentId: string | null;
  setSelectedComponentId: (id: string) => void;
  removeComponent: (id: string) => void;
  dndAttributes?: any; // These are passed from SortableItem
  dndListeners?: any; // These are passed from SortableItem
}) {
  const Icon = componentIcons[component.type] || Text;
  return (
    <div className="flex items-center gap-1 group bg-card p-1 rounded-md border">
      <Button asChild variant="ghost" size="icon" {...dndListeners} {...dndAttributes} className="cursor-grab h-8 w-8">
        <span><GripVertical className="h-5 w-5 text-muted-foreground" /></span>
      </Button>
      <Button
        variant={selectedComponentId === component.id ? "secondary" : "ghost"}
        className="flex-grow justify-start"
        onClick={() => setSelectedComponentId(component.id)}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span>{component.type}</span>
          {component.abTestEnabled && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
        </div>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive/80 hover:text-destructive opacity-0 group-hover:opacity-100"
        onClick={() => removeComponent(component.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
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

  const handleMetaChange = (prop: keyof CloudPage["meta"], value: string | boolean | ('key' | 'name')) => {
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

  const addComponent = (type: ComponentType, parentId: string | null = null, column: number = 0) => {
    setPageState(prev => {
      if (!prev) return null;
  
      return produce(prev, draft => {
        const siblings = draft.components.filter(c => c.parentId === parentId && c.column === column);
  
        const newComponent: PageComponent = {
          id: Date.now().toString(),
          type,
          props: {},
          parentId,
          order: siblings.length,
          column,
          abTestEnabled: false,
          abTestVariants: [],
        };
  
        // Default props for new components
        switch(type) {
            case 'Columns':
                newComponent.props = { columnCount: 2 };
                break;
            case 'Form':
                newComponent.props = {
                    fields: { name: true, email: true, phone: true, cpf: true, city: false, birthdate: false, optin: true },
                    placeholders: { name: 'Nome', email: 'Email', phone: 'Telefone - Ex:(11) 9 9999-9999', cpf: 'CPF', city: 'Cidade', birthdate: 'Data de Nascimento' },
                    consentText: `Quero receber novidades e promoções da Natura e de outras empresas do Grupo Natura &Co...`,
                    buttonText: 'Finalizar'
                };
                break;
            case 'Countdown':
                newComponent.props = { targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) };
                break;
            case 'Spacer':
                newComponent.props = { height: 20 };
                break;
            case 'Divider':
                newComponent.props = { thickness: 1, style: 'solid', color: '#cccccc', margin: 20 };
                break;
            case 'Button':
                newComponent.props = { text: 'Clique Aqui', href: '#', align: 'center' };
                break;
            case 'Accordion':
            case 'Tabs':
                newComponent.props = {
                    items: [
                        { id: 'item-1', title: 'Item 1', content: 'Conteúdo do item 1.' },
                        { id: 'item-2', title: 'Item 2', content: 'Conteúdo do item 2.' },
                    ]
                };
                break;
            case 'Voting':
                newComponent.props = {
                    question: 'Qual sua cor favorita?',
                    options: [
                        { id: 'opt1', text: 'Azul' },
                        { id: 'opt2', text: 'Verde' },
                    ]
                };
                break;
            case 'Stripe':
                newComponent.props = {
                    text: 'Anúncio ou aviso importante aqui!',
                    isClosable: true,
                    backgroundColor: '#000000',
                    textColor: '#FFFFFF',
                    linkUrl: ''
                };
                break;
            case 'NPS':
                newComponent.props = {
                    question: 'Em uma escala de 0 a 10, o quão provável você é de recomendar nosso produto/serviço a um amigo ou colega?',
                    type: 'numeric',
                    lowLabel: 'Pouco provável',
                    highLabel: 'Muito provável',
                    thankYouMessage: 'Obrigado pelo seu feedback!'
                };
                break;
            case 'Map':
                newComponent.props = {
                    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.098048256196!2d-46.65684698502213!3d-23.56424408468112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0x4a3ec19a97a8d4d7!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1620994773418!5m2!1spt-BR!2sbr'
                };
                break;
            case 'SocialIcons':
                newComponent.props = {
                    links: {
                        facebook: '',
                        instagram: '',
                        twitter: '',
                        linkedin: '',
                        youtube: '',
                        tiktok: '',
                        pinterest: '',
                        snapchat: '',
                    },
                    styles: {
                        align: 'center',
                        iconSize: '24px',
                    }
                };
                break;
        }

        draft.components.push(newComponent);
        setSelectedComponentId(newComponent.id);
      });
    });
  };

  const removeComponent = (id: string) => {
    setPageState(prev => {
      if (!prev) return null;
      // Also remove children of the component being removed
      const idsToRemove = new Set([id]);
      let children = prev.components.filter(c => c.parentId === id);
      while(children.length > 0) {
        const nextGenChildren: PageComponent[] = [];
        children.forEach(child => {
          idsToRemove.add(child.id);
          const grandChildren = prev.components.filter(c => c.parentId === child.id);
          nextGenChildren.push(...grandChildren);
        });
        children = nextGenChildren;
      }
      
      return {
        ...prev,
        components: prev.components.filter(c => !idsToRemove.has(c.id)),
      };
    });
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId === overId) {
      return;
    }

    setPageState(currentState => {
      if (!currentState) return null;

      return produce(currentState, draft => {
        const findComponent = (id: string) => draft.components.find(c => c.id === id);
        const findComponentIndex = (id: string) => draft.components.findIndex(c => c.id === id);

        const activeComponent = findComponent(activeId);
        if (!activeComponent) return;

        const overIsColumn = over.data.current?.isColumn;
        
        let newParentId: string | null = null;
        let newColumnIndex: number = 0;
        let overIndex: number;

        if (overIsColumn) {
            const overIdString = over.id.toString();
            newParentId = overIdString.split('-')[0];
            newColumnIndex = parseInt(overIdString.split('-')[1], 10);
            
            // Find the last component in that column to place the new one after
            const siblingsInNewColumn = draft.components
                .filter(c => c.parentId === newParentId && c.column === newColumnIndex)
                .sort((a,b) => a.order - b.order);
            
            if (siblingsInNewColumn.length > 0) {
                overIndex = findComponentIndex(siblingsInNewColumn[siblingsInNewColumn.length - 1].id);
            } else {
                 // If column is empty, find the parent column container and place it there
                 overIndex = findComponentIndex(newParentId)
            }
        } else {
            const overComponent = findComponent(overId);
            if (!overComponent) return;
            newParentId = overComponent.parentId;
            newColumnIndex = overComponent.column || 0;
            overIndex = findComponentIndex(overId);
        }

        const activeIndex = findComponentIndex(activeId);
        
        // Update component's parent and column
        draft.components[activeIndex].parentId = newParentId;
        draft.components[activeIndex].column = newColumnIndex;
        
        // Move the component in the array
        const [movedComponent] = draft.components.splice(activeIndex, 1);
        const correctedOverIndex = findComponentIndex(overId); // Recalculate index after splice
        draft.components.splice(correctedOverIndex, 0, movedComponent);

        // Re-order all components to ensure data integrity
        const allParentIds = [null, ...draft.components.filter(c => c.type === 'Columns').map(c => c.id)];
        allParentIds.forEach(pId => {
            const parentComponent = findComponent(pId as string);
            const columnCount = parentComponent?.props.columnCount || 1;

            for (let i = 0; i < columnCount; i++) {
                const childrenInColumn = draft.components
                    .filter(c => c.parentId === pId && (c.column || 0) === i)
                    .sort((a, b) => {
                        const posA = draft.components.findIndex(d => d.id === a.id);
                        const posB = draft.components.findIndex(d => d.id === b.id);
                        return posA - posB;
                    });
                
                childrenInColumn.forEach((child, index) => {
                    const childInDraft = findComponent(child.id)!;
                    childInDraft.order = index;
                });
            }
        });
      });
    });
  };

  const selectedComponent = pageState.components.find((c) => c.id === selectedComponentId);
  const tracking = pageState.meta.tracking;
  const cookieBanner = pageState.cookieBanner;

  const renderComponents = (parentId: string | null) => {
    const componentsToRender = pageState.components
      .filter(c => c.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  
    return componentsToRender.map(component => {
      if (component.type === 'Columns') {
        const columnCount = component.props.columnCount || 2;
        return (
          <SortableItem key={component.id} component={component}>
            <div className="flex flex-col gap-2 bg-background/50 p-2 rounded-lg border">
              <ComponentItem
                component={component}
                selectedComponentId={selectedComponentId}
                setSelectedComponentId={setSelectedComponentId}
                removeComponent={removeComponent}
                // dnd props passed by SortableItem's cloneElement
              />
              <div className={`grid grid-cols-${columnCount} gap-2`}>
                {Array.from({ length: columnCount }, (_, i) => (
                  <ColumnDropzone key={i} id={`${component.id}-${i}`}>
                    {renderColumnContent(component.id, i)}
                  </ColumnDropzone>
                ))}
              </div>
            </div>
          </SortableItem>
        );
      }
      return (
        <SortableItem key={component.id} component={component}>
          <ComponentItem
            component={component}
            selectedComponentId={selectedComponentId}
            setSelectedComponentId={setSelectedComponentId}
            removeComponent={removeComponent}
             // dnd props passed by SortableItem's cloneElement
          />
        </SortableItem>
      );
    });
  };

  const renderColumnContent = (parentId: string, columnIndex: number) => {
    const columnComponents = pageState.components
        .filter(c => c.parentId === parentId && c.column === columnIndex)
        .sort((a, b) => a.order - b.order);

    return (
        <SortableContext items={columnComponents.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {columnComponents.map(component => (
                 <SortableItem key={component.id} component={component}>
                    <ComponentItem
                        component={component}
                        selectedComponentId={selectedComponentId}
                        setSelectedComponentId={setSelectedComponentId}
                        removeComponent={removeComponent}
                    />
                </SortableItem>
            ))}
        </SortableContext>
    );
  };

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
                 <div className="space-y-2">
                    <Label>Fonte Principal</Label>
                    <Select value={pageState.styles.fontFamily} onValueChange={(value) => handleStyleChange('fontFamily', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma fonte" />
                        </SelectTrigger>
                        <SelectContent>
                            {googleFonts.map(font => (
                                <SelectItem key={font} value={font}>{font}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="custom-css">CSS Personalizado</Label>
                        <Tooltip>
                            <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                            <TooltipContent><p>Adicione seu próprio CSS aqui. Use com cuidado.</p></TooltipContent>
                        </Tooltip>
                    </div>
                    <Textarea 
                        id="custom-css"
                        value={pageState.styles.customCss}
                        onChange={(e) => handleStyleChange('customCss', e.target.value)}
                        placeholder="Ex: .meu-componente { color: red; }"
                        rows={8}
                        className="font-mono text-xs"
                    />
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
                    <SortableContext items={pageState.components.map(c => c.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                          {renderComponents(null)}
                      </div>
                    </SortableContext>
                </DndContext>
                <AddComponentDialog onAddComponent={(type) => addComponent(type)} />
              </AccordionContent>
            </AccordionItem>
            {selectedComponent && (
              <AccordionItem value="component-settings">
                <AccordionTrigger className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <span>Configurações de {selectedComponent.type}</span>
                 </AccordionTrigger>
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
                    <Label>Identificador da Data Extension</Label>
                    <Tooltip>
                      <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                      <TooltipContent><p>O Nome ou a Chave Externa da sua Data Extension.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex gap-2">
                     <Select 
                        value={pageState.meta.dataExtensionTargetMethod || 'key'} 
                        onValueChange={(value: 'key' | 'name') => handleMetaChange('dataExtensionTargetMethod', value)}
                     >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="key">Chave Externa</SelectItem>
                            <SelectItem value="name">Nome da DE</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input 
                      value={pageState.meta.dataExtensionKey} 
                      onChange={(e) => handleMetaChange('dataExtensionKey', e.target.value)}
                      placeholder="Insira o Nome ou Chave"
                    />
                  </div>
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
             <AccordionItem value="security">
                <AccordionTrigger>Segurança & Acesso</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="sso-enabled" className="flex items-center gap-2">
                            <Lock className="h-4 w-4"/>
                            Proteger com SSO do Marketing Cloud
                        </Label>
                        <Switch
                            id="sso-enabled"
                            checked={pageState.meta.ssoProtection || false}
                            onCheckedChange={(checked) => handleMetaChange('ssoProtection', checked)}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Se ativado, os usuários serão redirecionados para a tela de login do Salesforce Marketing Cloud se não estiverem autenticados antes de poderem ver esta página.
                    </p>
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
