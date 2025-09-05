
"use client";

import type { Dispatch, SetStateAction } from "react";
import type { CloudPage, ComponentType, PageComponent, SecurityType, AnimationType, Brand, Action } from "@/lib/types";
import React, { useState, useEffect } from 'react';
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
import { GripVertical, Trash2, HelpCircle, Text, Heading1, Heading2, Minus, Image, Film, Timer, MousePointerClick, StretchHorizontal, Cookie, Layers, PanelTop, Vote, Smile, MapPin, AlignStartVertical, AlignEndVertical, Star, Code, Share2, Columns, Lock, Zap, Bot, CalendarClock, Settings, LayoutGrid, Palette, Globe, Download, X, Copy, View, Sparkles, UploadCloud, Layers3, Hand, Circle, Square, ArrowUp, ArrowDown } from "lucide-react";
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
import { AmpscriptSnippetDialog } from "./ampscript-snippet-dialog";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { MediaLibraryDialog } from "./media-library-dialog";
import { getBrandsForUser, updateBrand } from "@/lib/firestore";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

interface SettingsPanelProps {
  pageState: CloudPage;
  setPageState: Dispatch<SetStateAction<CloudPage | null>>;
  selectedComponentId: string | null;
  setSelectedComponentId: Dispatch<SetStateAction<string | null>>;
  pageName: string;
  onPageNameChange: (newName: string) => void;
  projectPages: CloudPage[];
  onCodeEdit: (component: PageComponent) => void;
}

const componentIcons: Record<ComponentType, React.ElementType> = {
    Div: Layers3,
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
    DownloadButton: Download,
    Spacer: StretchHorizontal,
    Accordion: Layers,
    Tabs: PanelTop,
    Voting: Vote,
    Stripe: PanelTop,
    NPS: Smile,
    Map: MapPin,
    SocialIcons: Share2,
    Columns: Columns,
    WhatsApp: Zap,
    Carousel: View,
    FTPUpload: UploadCloud,
    DataExtensionUpload: UploadCloud,
    FloatingImage: Image,
    FloatingButton: MousePointerClick,
    Calendly: CalendarClock,
    CustomHTML: Code,
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

const tagColors = [
  'bg-blue-100 text-blue-800 border-blue-400',
  'bg-green-100 text-green-800 border-green-400',
  'bg-yellow-100 text-yellow-800 border-yellow-400',
  'bg-purple-100 text-purple-800 border-purple-400',
  'bg-pink-100 text-pink-800 border-pink-400',
  'bg-red-100 text-red-800 border-red-400',
  'bg-indigo-100 text-indigo-800 border-indigo-400',
];

const getTagColor = (tag: string) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return tagColors[Math.abs(hash) % tagColors.length];
};

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

  return (
    <div ref={setNodeRef} style={style}>
      {React.cloneElement(children as React.ReactElement, { dndAttributes: attributes, dndListeners: listeners })}
    </div>
  );
}


function Dropzone({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
    const { setNodeRef, isOver } = useSortable({ id, data: { type: 'dropzone', isDropzone: true, accepts: ['component'] } });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "p-2 bg-muted/40 rounded-lg min-h-[80px] flex flex-col gap-2 transition-colors",
                isOver ? 'bg-primary/20 ring-2 ring-primary' : '',
                className
            )}
        >
            <SortableContext items={React.Children.map(children, (child: any) => child.props.component.id) || []} strategy={verticalListSortingStrategy}>
                {children}
            </SortableContext>
        </div>
    );
}

function ComponentItem({
  component,
  selectedComponentId,
  setSelectedComponentId,
  removeComponent,
  duplicateComponent,
  moveComponent,
  isFirst,
  isLast,
  dndAttributes,
  dndListeners,
  children,
  isDraggable = true,
}: {
  component: PageComponent;
  selectedComponentId: string | null;
  setSelectedComponentId: (id: string | null) => void;
  removeComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  moveComponent: (id: string, direction: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
  dndAttributes?: any;
  dndListeners?: any;
  children?: React.ReactNode;
  isDraggable?: boolean;
}) {
  const Icon = componentIcons[component.type] || Text;
  const isContainer = ['Columns', 'Div'].includes(component.type);

   

  const handleSelect = () => {
    if (selectedComponentId === component.id) {
        setSelectedComponentId(null);
    } else {
        setSelectedComponentId(component.id);
    }
  }

  const content = (
      <div className={cn(
        "group bg-card p-1 rounded-md border",
        isContainer ? "flex flex-col items-stretch gap-1.5" : "flex items-center gap-1"
      )}>
          <div className="flex items-center min-w-0"> {/* Allow shrinking */}
            <Button asChild variant="ghost" size="icon" {...(isDraggable ? dndListeners : {})} {...(isDraggable ? dndAttributes : {})} className={cn("h-8 w-8 flex-shrink-0", isDraggable ? "cursor-grab" : "cursor-not-allowed")} aria-label={`Arrastar componente ${component.type}`}>
                <span><GripVertical className="h-5 w-5 text-muted-foreground" /></span>
            </Button>
            <Button
                variant={selectedComponentId === component.id ? "secondary" : "ghost"}
                className="flex-grow justify-start h-8 min-w-0 px-2"
                onClick={handleSelect}
            >
                <div className="flex items-center gap-2 truncate">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{component.layerName || component.type}</span>
                  {component.abTestEnabled && <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />}
                </div>
            </Button>
             <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveComponent(component.id, 'up')} disabled={isFirst}><ArrowUp className="h-4 w-4"/></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveComponent(component.id, 'down')} disabled={isLast}><ArrowDown className="h-4 w-4"/></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateComponent(component.id)}><Copy className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeComponent(component.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
          {isContainer && children && (
            <div className="pl-4 pr-1 pb-1">
                {children}
            </div>
          )}
      </div>
  );

  return isContainer ? <div className="bg-background/50 p-1.5 rounded-lg border-l-2 border-transparent">{content}</div> : content;
}



export function SettingsPanel({
  pageState,
  setPageState,
  selectedComponentId,
  setSelectedComponentId,
  pageName,
  onPageNameChange,
  onCodeEdit,
}: SettingsPanelProps) {

  const { user, activeWorkspace } = useAuth();
  const { toast } = useToast();
  const [isAmpscriptDialogOpen, setIsAmpscriptDialogOpen] = useState(false);
  const [isSchedulingEnabled, setIsSchedulingEnabled] = useState(!!pageState.publishDate || !!pageState.expiryDate);
  const [tagInput, setTagInput] = useState('');
  const [userBrands, setUserBrands] = useState<Brand[]>([]);

  useEffect(() => {
    if (activeWorkspace) {
        getBrandsForUser(activeWorkspace.id)
            .then(setUserBrands)
            .catch(err => {
                console.error("Failed to fetch brands", err);
                toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os Kits de Marca.' });
            });
    }
  }, [activeWorkspace, toast]);

  const activeBrand = userBrands.find(b => b.id === pageState.brandId);

  // Sync page state with active brand changes
  useEffect(() => {
    if (activeBrand) {
      setPageState(prev => {
        if (!prev) return null;
        // Update the brand object in the page state if it's different
        if (JSON.stringify(prev.brand) !== JSON.stringify(activeBrand)) {
          return { ...prev, brand: activeBrand };
        }
        return prev;
      });
    }
  }, [activeBrand, setPageState]);


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleTagChange = (newTags: string[]) => {
    setPageState(prev => (prev ? { ...prev, tags: newTags } : null));
  };
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !pageState.tags?.includes(newTag)) {
        handleTagChange([...(pageState.tags || []), newTag]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && tagInput === '' && pageState.tags?.length) {
      handleTagChange(pageState.tags.slice(0, -1));
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    handleTagChange((pageState.tags || []).filter(tag => tag !== tagToRemove));
  };

  const handleStyleChange = (prop: keyof CloudPage["styles"], value: string) => {
    setPageState((prev) => prev ? ({ ...prev, styles: { ...prev.styles, [prop]: value } }) : null);
  };

  const handleBrandComponentStyleChange = async (componentType: 'button' | 'input', prop: string, value: any) => {
      if (!pageState.brandId || !user) return;
      try {
          const brandToUpdate = userBrands.find(b => b.id === pageState.brandId);
          if (!brandToUpdate) return;
  
          // Use produce for immutable update
          const newBrand = produce(brandToUpdate, draft => {
              if (!draft.components) {
                  draft.components = { button: { borderRadius: ''}, input: {borderRadius: '', backgroundColor: '', borderColor: '', textColor: '' } };
              }
              if (!draft.components[componentType]) {
                  (draft.components as any)[componentType] = {};
              }
              (draft.components[componentType] as any)[prop] = value;
          });
  
          await updateBrand(pageState.brandId, { components: newBrand.components }, user.uid);
          
          setUserBrands(prevBrands => prevBrands.map(b => b.id === pageState.brandId ? newBrand : b));
  
          toast({ title: 'Estilo do Kit de Marca atualizado!' });
  
      } catch (error: any) {
          console.error("Failed to update brand component style:", error);
          toast({ variant: "destructive", title: "Erro ao atualizar Kit de Marca", description: error.message });
      }
  };
  
  const buttonBorderRadius = activeBrand?.components?.button?.borderRadius || '0.5rem';


  const handleMetaChange = (prop: keyof CloudPage["meta"], value: any) => {
    setPageState((prev) => {
        if (!prev) return null;
        return produce(prev, draft => {
            (draft.meta as any)[prop] = value;
        });
    });
  };

  const handleScheduleChange = (prop: 'publishDate' | 'expiryDate', value: string) => {
    setPageState(prev => {
        if (!prev) return null;
        const dateValue = value ? new Date(value) : null;
        return produce(prev, draft => {
            (draft as any)[prop] = dateValue;
        });
    });
  };

  const toggleScheduling = (enabled: boolean) => {
    setIsSchedulingEnabled(enabled);
    if (!enabled) {
        setPageState(prev => {
            if (!prev) return null;
            return produce(prev, draft => {
                draft.publishDate = null;
                draft.expiryDate = null;
            });
        });
    }
  }

  const handleAmpscriptChange = (newCode: string) => {
    handleMetaChange('customAmpscript', newCode);
  }

  const handleSecurityChange = (prop: string, value: any) => {
    setPageState(prev => {
        if (!prev) return null;
        return produce(prev, draft => {
            if (!draft.meta.security) {
                draft.meta.security = { type: 'none' };
            }
            (draft.meta.security as any)[prop] = value;

            if (prop === 'type' && value !== 'password') {
                delete draft.meta.security.passwordConfig;
            }
             if (prop === 'type' && value === 'password' && !draft.meta.security.passwordConfig) {
                 draft.meta.security.passwordConfig = {
                    dataExtensionKey: '',
                    identifierColumn: 'SubscriberKey',
                    passwordColumn: 'Password',
                    urlParameter: 'id',
                 }
            }
        });
    });
  };

   const handlePasswordConfigChange = (prop: string, value: string) => {
        setPageState(prev => {
            if (!prev) return null;
            return produce(prev, draft => {
                if (draft.meta.security?.passwordConfig) {
                    (draft.meta.security.passwordConfig as any)[prop] = value;
                }
            });
        });
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
    pixel: 'gtm' | 'ga4' | 'meta' | 'linkedin',
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
                        gtm: { enabled: false, id: '' },
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

  const handleBrandChange = (brandId: string) => {
    const selectedBrand = userBrands.find(b => b.id === brandId);
    setPageState(prev => {
        if (!prev) return null;
        return produce(prev, draft => {
            if (selectedBrand) {
                draft.brandId = selectedBrand.id;
                draft.brandName = selectedBrand.name;
                draft.brand = selectedBrand; // Keep the full brand object synced
                
                // Apply brand styles
                draft.styles.themeColor = selectedBrand.colors.light.primary;
                draft.styles.themeColorHover = selectedBrand.colors.light.primaryHover;
                draft.styles.fontFamily = selectedBrand.typography.fontFamilyBody;
                draft.meta.faviconUrl = selectedBrand.logos.favicon;
                draft.meta.loaderImageUrl = selectedBrand.logos.iconLight;

                // Update Header logo if it exists
                const header = draft.components.find(c => c.type === 'Header');
                if (header) {
                    header.props.logoUrl = selectedBrand.logos.horizontalLight;
                }
                 // Update Footer text if it exists
                const footer = draft.components.find(c => c.type === 'Footer');
                if (footer) {
                    footer.props.footerText1 = `© ${new Date().getFullYear()} ${selectedBrand.name}. Todos os direitos reservados.`;
                }

            } else {
                draft.brandId = '';
                draft.brandName = 'Sem Marca';
                delete draft.brand;
            }
        });
    });
  };

  const addComponent = (typeOrBlock: ComponentType | PageComponent[]) => {
    setPageState(prev => {
      if (!prev) return null;
  
      return produce(prev, draft => {
          if (Array.isArray(typeOrBlock)) {
              // It's a block (an array of components)
              const newComponents = typeOrBlock.map(comp => {
                  const siblings = draft.components.filter(c => c.parentId === comp.parentId);
                  return {...comp, order: siblings.length + (comp.order || 0) };
              });
              draft.components.push(...newComponents);
              // Select the main parent component of the block if it exists
              const mainParent = newComponents.find(c => c.parentId === null);
              if (mainParent) {
                  setSelectedComponentId(mainParent.id);
              }
          } else {
              // It's a single component type
              const type = typeOrBlock;

              if (type === 'Footer' && draft.components.some(c => c.type === 'Footer')) {
                  toast({
                      variant: 'destructive',
                      title: 'Ação não permitida',
                      description: 'Apenas um componente de Rodapé é permitido por página.'
                  });
                  return;
              }

              const parentId = null; 
              const column = 0;
              const siblings = draft.components.filter(c => c.parentId === parentId);
    
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
                  case 'Div':
                      newComponent.props = { styles: {} };
                      break;
                  case 'Columns':
                      newComponent.props = { columnCount: 2 };
                      break;
                  case 'Carousel':
                      newComponent.props = {
                          images: [
                              { id: '1', url: 'https://placehold.co/800x400.png?text=Slide+1', alt: 'Slide 1' },
                              { id: '2', url: 'https://placehold.co/800x400.png?text=Slide+2', alt: 'Slide 2' },
                              { id: '3', url: 'https://placehold.co/800x400.png?text=Slide+3', alt: 'Slide 3' },
                          ],
                          options: { loop: true, slidesPerView: 1 },
                          showArrows: true,
                          showDots: true,
                      };
                      break;
                  case 'Form':
                      newComponent.props = {
                          fields: { name: {enabled: true, conditional: null}, email: {enabled: true, conditional: null}, phone: {enabled: true, conditional: null}, cpf: {enabled: true, conditional: null}, city: {enabled: false, conditional: null}, birthdate: {enabled: false, conditional: null}, optin: {enabled: true, conditional: null} },
                          placeholders: { name: 'Nome', email: 'Email', phone: 'Telefone - Ex:(11) 9 9999-9999', cpf: 'CPF', city: 'Cidade', birthdate: 'Data de Nascimento' },
                          consentText: `Quero receber novidades e promoções da Natura e de outras empresas do Grupo Natura &Co...`,
                          buttonText: 'Finalizar',
                          buttonAlign: 'center',
                          submission: {
                            type: 'message',
                            message: '<h2>Obrigado!</h2><p>Seus dados foram recebidos.</p>',
                            url: '',
                          }
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
                      newComponent.props = { text: 'Clique Aqui', action: { type: 'URL', url: '#'}, align: 'center' };
                      break;
                  case 'DownloadButton':
                      newComponent.props = { text: 'Download', fileUrl: '', fileName: 'arquivo', align: 'center' };
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
                          question: 'Em uma escala de 0 a 10, o quão provável você é de nos recomendar a um amigo ou colega?',
                          type: 'numeric',
                          lowLabel: 'Pouco Provável',
                          highLabel: 'Muito Provável',
                          thankYouMessage: 'Obrigado pelo seu feedback!'
                      };
                      break;
                  case 'Map':
                      newComponent.props = {
                          embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.098048256196!2d-46.65684698502213!3d-23.56424408468112!2m3!1f0!2f0!3f2!3i1024!4i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0x4a3ec19a97a8d4d7!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1620994773418!5m2!1spt-BR!2sbr'
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
                  case 'WhatsApp':
                      newComponent.props = {
                          phoneNumber: '5511999999999',
                          defaultMessage: 'Olá! Gostaria de mais informações.',
                          position: 'bottom-right'
                      };
                      break;
                   case 'FTPUpload':
                      newComponent.props = {
                        label: "Enviar Arquivo CSV",
                        destinationPath: "/Import",
                        destinationFilename: "arquivo_%%Date%%.csv",
                        dataExtensionName: "",
                      };
                      break;
                  case 'DataExtensionUpload':
                      newComponent.props = {
                        label: "Upload para Data Extension",
                        dataExtensionKey: "",
                      };
                      break;
              }
              draft.components.push(newComponent);
              setSelectedComponentId(newComponent.id);
          }
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

  const duplicateComponent = (componentId: string) => {
    setPageState(prev => {
        if (!prev) return null;

        return produce(prev, draft => {
            const idMap: { [key: string]: string } = {};

            const duplicateRecursively = (originalCompId: string, newParentId: string | null = null, newColumnIndex?: number): string => {
                const originalComp = draft.components.find(c => c.id === originalCompId);
                if (!originalComp) return '';

                const newId = `${originalComp.type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                idMap[originalCompId] = newId;

                // Deep copy of props to avoid reference issues
                const newProps = JSON.parse(JSON.stringify(originalComp.props));
                
                const duplicatedComp: PageComponent = {
                    ...originalComp,
                    id: newId,
                    props: newProps,
                    parentId: newParentId,
                    column: newColumnIndex !== undefined ? newColumnIndex : originalComp.column,
                    // Order will be recalculated later
                };
                draft.components.push(duplicatedComp);

                if (['Columns', 'Div'].includes(originalComp.type)) {
                    const children = draft.components.filter(c => c.parentId === originalCompId);
                    children.forEach(child => {
                       duplicateRecursively(child.id, newId, child.column);
                    });
                }
                return newId;
            };
            
            const originalComponent = draft.components.find(c => c.id === componentId);
            if (!originalComponent) return;

            const newMainComponentId = duplicateRecursively(componentId, originalComponent.parentId, originalComponent.column);
            
            // Reorder components
            const allComponents = draft.components.filter(c => c.parentId === originalComponent.parentId);
            const originalIndex = allComponents.findIndex(c => c.id === componentId);
            
            const newComponent = draft.components.find(c => c.id === newMainComponentId);
            if (!newComponent) return;

            // Move the new component to be right after the original
            const componentToInsert = draft.components.splice(draft.components.findIndex(c => c.id === newComponent.id), 1)[0];
            const finalOriginalIndex = draft.components.findIndex(c => c.id === componentId);
            draft.components.splice(finalOriginalIndex + 1, 0, componentToInsert);

            // Update order for all siblings
            const siblings = draft.components.filter(c => c.parentId === originalComponent.parentId && c.column === originalComponent.column);
            siblings.forEach((sibling, index) => {
                const componentInDraft = draft.components.find(c => c.id === sibling.id);
                if (componentInDraft) {
                    componentInDraft.order = index;
                }
            });
        });
    });
  };

    const moveComponent = (componentId: string, direction: 'up' | 'down') => {
        setPageState(prev => {
            if (!prev) return null;

            return produce(prev, draft => {
                const componentToMove = draft.components.find(c => c.id === componentId);
                if (!componentToMove) return;

                const siblings = draft.components
                    .filter(c => c.parentId === componentToMove.parentId && c.column === componentToMove.column)
                    .sort((a, b) => a.order - b.order);
                
                const currentIndex = siblings.findIndex(c => c.id === componentId);
                if (currentIndex === -1) return;

                const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

                if (newIndex >= 0 && newIndex < siblings.length) {
                    const [movedItem] = siblings.splice(currentIndex, 1);
                    siblings.splice(newIndex, 0, movedItem);

                    siblings.forEach((sibling, index) => {
                        const componentInDraft = draft.components.find(c => c.id === sibling.id);
                        if (componentInDraft) {
                            componentInDraft.order = index;
                        }
                    });
                }
            });
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;
        const activeId = active.id.toString();
        const overId = over.id.toString();
    
        if (activeId === overId) return;
    
        setPageState(currentState => {
            if (!currentState) return null;
    
            return produce(currentState, draft => {
                const activeComponent = draft.components.find(c => c.id === activeId);
                const overComponent = draft.components.find(c => c.id === overId);
                const overIsDropzone = over.data.current?.isDropzone;

                if (!activeComponent) return;

                if (overIsDropzone) {
                    // Reparenting: Moving a component into a dropzone (root, column, or div)
                    const newParentId = overId.startsWith('root-dropzone') ? null : overId.split('-')[0];
                    const newColumnIndex = overId.includes('-') ? parseInt(overId.split('-')[1], 10) : 0;
                    
                    activeComponent.parentId = newParentId;
                    activeComponent.column = newColumnIndex;
                } else if (overComponent) {
                    // Reordering: Dropping a component onto another component
                    const sameContainer = activeComponent.parentId === overComponent.parentId;
                    
                    if (sameContainer) {
                        // Reorder within the same container
                        const parentId = activeComponent.parentId;
                        const column = activeComponent.column;
                        const siblings = draft.components.filter(c => c.parentId === parentId && c.column === column);
                        
                        const oldIndex = siblings.findIndex(c => c.id === activeId);
                        const newIndex = siblings.findIndex(c => c.id === overId);

                        if (oldIndex !== -1 && newIndex !== -1) {
                            const [movedItem] = siblings.splice(oldIndex, 1);
                            siblings.splice(newIndex, 0, movedItem);

                            // Update order property based on new array order
                            siblings.forEach((sibling, index) => {
                                const componentInDraft = draft.components.find(c => c.id === sibling.id);
                                if (componentInDraft) {
                                    componentInDraft.order = index;
                                }
                            });
                        }
                    } else {
                        // Reparent to the same container as the element being dropped on
                        activeComponent.parentId = overComponent.parentId;
                        activeComponent.column = overComponent.column;
                    }
                }
                
                // Final re-ordering of all components to ensure integrity
                const parentIds = new Set(draft.components.map(c => c.parentId));
                parentIds.add(null); 
                parentIds.forEach(pId => {
                    const container = draft.components.find(c => c.id === pId);
                    const numColumns = container?.type === 'Columns' ? (container.props.columnCount || 1) : 1;
                    
                    for(let i = 0; i < numColumns; i++) {
                        const children = draft.components.filter(c => c.parentId === pId && c.column === i);
                        const sortedChildren = arrayMove(children, 0, 0); // Just to get a stable sort
                        
                        sortedChildren.forEach((child, index) => {
                            if (child) {
                                const componentToUpdate = draft.components.find(c => c.id === child.id);
                                if (componentToUpdate) {
                                    componentToUpdate.order = index;
                                }
                            }
                        });
                    }
                });
            });
        });
    };

    const renderComponentsRecursive = (parentId: string | null, column: number | null = 0): React.ReactNode[] => {
        const componentsToRender = pageState.components
            .filter(c => c.parentId === parentId && (column === null || c.column === column))
            .sort((a, b) => a.order - b.order)
            .filter(c => !['Stripe', 'FloatingImage', 'FloatingButton', 'WhatsApp', 'Footer'].includes(c.type));

        return componentsToRender.map((component, index) => {
            const isContainer = ['Columns', 'Div'].includes(component.type);

            if (isContainer) {
                const columnCount = component.props.columnCount || (component.type === 'Div' ? 1 : 0);
                const idPrefix = component.id;

                return (
                    <SortableItem key={component.id} component={component}>
                        <ComponentItem
                            component={component}
                            selectedComponentId={selectedComponentId}
                            setSelectedComponentId={setSelectedComponentId}
                            removeComponent={removeComponent}
                            duplicateComponent={duplicateComponent}
                            moveComponent={moveComponent}
                            isFirst={index === 0}
                            isLast={index === componentsToRender.length - 1}
                        >
                            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columnCount > 0 ? columnCount : 1}, 1fr)` }}>
                                {Array.from({ length: columnCount > 0 ? columnCount : 1 }).map((_, i) => (
                                    <Dropzone key={`${idPrefix}-col-${i}`} id={`${idPrefix}-${i}`}>
                                        {renderComponentsRecursive(component.id, i)}
                                    </Dropzone>
                                ))}
                            </div>
                        </ComponentItem>
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
                        duplicateComponent={duplicateComponent}
                        moveComponent={moveComponent}
                        isFirst={index === 0}
                        isLast={index === componentsToRender.length - 1}
                    />
                </SortableItem>
            );
        });
    };
  
  const stripeComponents = pageState.components.filter(c => c.type === 'Stripe' && c.parentId === null).map(c => c.order).sort((a,b) => a-b).map(order => pageState.components.find(c => c.order === order && c.type === 'Stripe' && c.parentId === null)).filter(Boolean) as PageComponent[];
  const footerComponent = pageState.components.find(c => c.type === 'Footer');
  
    const toDatetimeLocal = (date: any) => {
        if (!date) return '';
        const d = date.toDate ? date.toDate() : new Date(date);
        const pad = (num: number) => num.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };


    return (
    <ScrollArea className="h-full">
      <TooltipProvider>
        <div className="p-4 space-y-2">
          <Accordion type="multiple" defaultValue={['page-settings', 'components']} className="w-full space-y-2">
            
            <AccordionItem value="page-settings" className="bg-card rounded-lg border">
              <AccordionTrigger className="p-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Configurações da Página</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 px-4">
                <div className="space-y-2">
                  <Label htmlFor="page-name">Nome da Página</Label>
                  <Input
                    id="page-name"
                    value={pageName}
                    onChange={(e) => onPageNameChange(e.target.value)}
                    placeholder="Ex: Campanha Dia das Mães"
                  />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="brand-id">Kit de Marca</Label>
                    <Select onValueChange={handleBrandChange} value={pageState.brandId || 'none'}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma marca..." />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="none">Nenhuma</SelectItem>
                            {userBrands.map(brand => (
                                <SelectItem key={brand.id} value={brand.id}>
                                     <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: brand.colors.light.primary }}></div>
                                        {brand.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="page-tags">Tags</Label>
                        <Tooltip>
                            <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                            <TooltipContent><p>Use vírgula ou Enter para adicionar tags.</p></TooltipContent>
                        </Tooltip>
                    </div>
                  <div className="flex flex-wrap items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
                      {(pageState.tags || []).map(tag => (
                        <div key={tag} className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", getTagColor(tag))}>
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 rounded-full p-0.5 hover:bg-black/10"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <Input
                        id="page-tags-input"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        placeholder={pageState.tags?.length ? '' : "Ex: Brasil, Latam"}
                        className="h-auto flex-1 border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
                      />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="styles" className="bg-card rounded-lg border">
              <AccordionTrigger className="p-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span>Estilos Globais</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 px-4">
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
                 <Separator />
                 <div className="space-y-3">
                     <h4 className="font-medium text-sm">Estilo dos Botões</h4>
                     <div className="space-y-2">
                        <Label>Cantos do Botão</Label>
                        <ToggleGroup type="single" value={buttonBorderRadius} onValueChange={(value) => value && handleBrandComponentStyleChange('button', 'borderRadius', value)} className="w-full" disabled={!pageState.brandId}>
                            <ToggleGroupItem value="0.25rem" aria-label="Reto"><Square className="h-5 w-5"/></ToggleGroupItem>
                            <ToggleGroupItem value="0.5rem" aria-label="Curvado"><div className="w-5 h-5 border-2 border-current rounded-md"></div></ToggleGroupItem>
                            <ToggleGroupItem value="9999px" aria-label="Redondo"><Circle className="h-5 w-5"/></ToggleGroupItem>
                        </ToggleGroup>
                        {!pageState.brandId && <p className="text-xs text-muted-foreground">Selecione um Kit de Marca para editar.</p>}
                     </div>
                 </div>
                 <Separator />
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

            <AccordionItem value="components" className="bg-card rounded-lg border">
              <AccordionTrigger className="p-4">
                 <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  <span>Componentes</span>
                 </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 px-4">
                  <div className="space-y-2">
                      {stripeComponents.map(component => (
                          <ComponentItem
                              key={component.id}
                              component={component}
                              selectedComponentId={selectedComponentId}
                              setSelectedComponentId={setSelectedComponentId}
                              removeComponent={removeComponent}
                              duplicateComponent={duplicateComponent}
                              moveComponent={moveComponent}
                              isFirst={true}
                              isLast={true}
                              isDraggable={false} // Stripe is not draggable
                          />
                      ))}
                      {stripeComponents.length > 0 && <Separator />}
                  </div>
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                      <Dropzone id="root-dropzone-0">
                          {renderComponentsRecursive(null, 0)}
                      </Dropzone>
                  </DndContext>
                  <AddComponentDialog onAddComponent={addComponent} />
                   {footerComponent && (
                      <div className="pt-2 mt-2 border-t">
                          <ComponentItem
                              key={footerComponent.id}
                              component={footerComponent}
                              selectedComponentId={selectedComponentId}
                              setSelectedComponentId={setSelectedComponentId}
                              removeComponent={removeComponent}
                              duplicateComponent={duplicateComponent}
                              moveComponent={moveComponent}
                              isFirst={true}
                              isLast={true}
                              isDraggable={false} // Footer is not draggable
                          />
                      </div>
                  )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ampscript" className="bg-card rounded-lg border">
                <AccordionTrigger className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>AMPScript Personalizado</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2 px-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1.5">
                           <div className="flex items-center gap-1.5">
                                <Label htmlFor="custom-ampscript">Código AMPScript</Label>
                                <Tooltip>
                                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                                    <TooltipContent>
                                        <div className="max-w-xs">
                                            <p>Adicione seu código AMPScript aqui. Ele será executado no topo da página.</p>
                                            <p className="mt-2"><b>Exemplo:</b></p>
                                            <pre className="text-xs bg-muted p-2 rounded-md mt-1">
                                                {`%%[
VAR @name
SET @name = AttributeValue("FirstName")
]%%`}
                                            </pre>
                                            <p className="mt-2">Então use `%%=v(@name)=%%` no HTML de um componente.</p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                           </div>
                           <Dialog open={isAmpscriptDialogOpen} onOpenChange={setIsAmpscriptDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Bot className="mr-2 h-4 w-4" />
                                        Adicionar Automação
                                    </Button>
                                </DialogTrigger>
                                <AmpscriptSnippetDialog 
                                    currentCode={pageState.meta.customAmpscript || ''}
                                    onCodeChange={handleAmpscriptChange}
                                    onClose={() => setIsAmpscriptDialogOpen(false)}
                                />
                           </Dialog>
                        </div>
                        <Textarea 
                            id="custom-ampscript"
                            value={pageState.meta.customAmpscript || ''}
                            onChange={(e) => handleMetaChange('customAmpscript', e.target.value)}
                            placeholder={'%%[ \n\n ]%%'}
                            rows={10}
                            className="font-mono text-xs"
                        />
                    </div>
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="animation" className="bg-card rounded-lg border">
                <AccordionTrigger className="p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Animações</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2 px-4">
                  <div className="space-y-2">
                    <Label>Animação de Entrada</Label>
                    <Select value={pageState.styles.animationType || 'none'} onValueChange={(value: AnimationType) => handleStyleChange('animationType', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sem animação" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            <SelectItem value="fadeIn">Surgir (Fade In)</SelectItem>
                            <SelectItem value="fadeInUp">Surgir de Baixo</SelectItem>
                            <SelectItem value="fadeInLeft">Surgir da Esquerda</SelectItem>
                            <SelectItem value="fadeInRight">Surgir da Direita</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  {(pageState.styles.animationType && pageState.styles.animationType !== 'none') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="animation-duration">Duração (s)</Label>
                        <Input id="animation-duration" type="number" step="0.1" value={pageState.styles.animationDuration || 1} onChange={e => handleStyleChange('animationDuration', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="animation-delay">Atraso (s)</Label>
                        <Input id="animation-delay" type="number" step="0.1" value={pageState.styles.animationDelay || 0} onChange={e => handleStyleChange('animationDelay', e.target.value)} />
                      </div>
                    </div>
                  )}
                </AccordionContent>
            </AccordionItem>


            <AccordionItem value="meta" className="bg-card rounded-lg border">
              <AccordionTrigger className="p-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Configurações, SEO & Pixels</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 px-4">
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
                    <Label>Configuração do Loader</Label>
                    <Select value={pageState.meta.loaderType || 'image'} onValueChange={(v) => handleMetaChange('loaderType', v)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            <SelectItem value="image">Imagem Personalizada</SelectItem>
                            <SelectItem value="animation">Animação Padrão</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
                 {pageState.meta.loaderType === 'image' && (
                    <div className="space-y-2">
                        <Label htmlFor="loader-url">URL da Imagem de Carregamento</Label>
                        <div className="flex items-center gap-2">
                            <Input 
                                id="loader-url"
                                value={pageState.meta.loaderImageUrl} 
                                onChange={(e) => handleMetaChange('loaderImageUrl', e.target.value)} 
                                className="flex-grow"
                            />
                            <MediaLibraryDialog onSelectImage={(url) => handleMetaChange('loaderImageUrl', url)}>
                                <Button variant="outline" size="icon">
                                    <Image className="h-4 w-4" />
                                </Button>
                            </MediaLibraryDialog>
                        </div>
                    </div>
                 )}
                 {pageState.meta.loaderType === 'animation' && (
                    <div className="space-y-2">
                         <Label>Animação</Label>
                         <Select value={pageState.meta.loaderAnimation || 'pulse'} onValueChange={(v) => handleMetaChange('loaderAnimation', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pulse">Pulse</SelectItem>
                                <SelectItem value="spin">Spin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                 )}

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
                  {/* GTM */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gtm-enabled">Google Tag Manager</Label>
                      <Switch id="gtm-enabled" checked={pageState.meta.tracking?.gtm?.enabled} onCheckedChange={(checked) => handleTrackingChange('gtm', 'enabled', checked)} />
                    </div>
                    {pageState.meta.tracking?.gtm?.enabled && (
                      <Input placeholder="ID do Contêiner (GTM-XXXXXXX)" value={pageState.meta.tracking?.gtm?.id || ''} onChange={(e) => handleTrackingChange('gtm', 'id', e.target.value)} />
                    )}
                  </div>
                  {/* GA4 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ga4-enabled">Google Analytics 4</Label>
                      <Switch id="ga4-enabled" checked={pageState.meta.tracking?.ga4?.enabled} onCheckedChange={(checked) => handleTrackingChange('ga4', 'enabled', checked)} />
                    </div>
                    {pageState.meta.tracking?.ga4?.enabled && (
                      <Input placeholder="ID de métricas (G-XXXXXXXXXX)" value={pageState.meta.tracking?.ga4?.id || ''} onChange={(e) => handleTrackingChange('ga4', 'id', e.target.value)} />
                    )}
                  </div>
                  {/* Meta Pixel */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="meta-enabled">Meta Pixel</Label>
                      <Switch id="meta-enabled" checked={pageState.meta.tracking?.meta?.enabled} onCheckedChange={(checked) => handleTrackingChange('meta', 'enabled', checked)} />
                    </div>
                    {pageState.meta.tracking?.meta?.enabled && (
                      <Input placeholder="ID do Pixel" value={pageState.meta.tracking?.meta?.id || ''} onChange={(e) => handleTrackingChange('meta', 'id', e.target.value)} />
                    )}
                  </div>
                  {/* LinkedIn Pixel */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="linkedin-enabled">LinkedIn Insight Tag</Label>
                      <Switch id="linkedin-enabled" checked={pageState.meta.tracking?.linkedin?.enabled} onCheckedChange={(checked) => handleTrackingChange('linkedin', 'enabled', checked)} />
                    </div>
                    {pageState.meta.tracking?.linkedin?.enabled && (
                      <Input placeholder="ID de parceiro" value={pageState.meta.tracking?.linkedin?.id || ''} onChange={(e) => handleTrackingChange('linkedin', 'id', e.target.value)} />
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cookie-banner" className="bg-card rounded-lg border">
                <AccordionTrigger className="p-4">
                  <div className="flex items-center gap-2">
                    <Cookie className="h-4 w-4" />
                    <span>Banner de Cookies</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2 px-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="cookie-enabled" className="flex items-center gap-2">
                            Ativar Banner de Cookies
                        </Label>
                        <Switch
                            id="cookie-enabled"
                            checked={pageState.cookieBanner?.enabled || false}
                            onCheckedChange={(checked) => handleCookieBannerChange('enabled', checked)}
                        />
                    </div>
                    {pageState.cookieBanner?.enabled && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="cookie-text">Texto do Banner</Label>
                                <Textarea
                                    id="cookie-text"
                                    value={pageState.cookieBanner.text}
                                    onChange={(e) => handleCookieBannerChange('text', e.target.value)}
                                    rows={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cookie-button-text">Texto do Botão</Label>
                                <Input
                                    id="cookie-button-text"
                                    value={pageState.cookieBanner.buttonText}
                                    onChange={(e) => handleCookieBannerChange('buttonText', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="security" className="bg-card rounded-lg border">
                <AccordionTrigger className="p-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>Segurança & Acesso</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2 px-4">
                     <div className="space-y-2">
                        <Label htmlFor="security-type">Tipo de Proteção</Label>
                        <Select value={pageState.meta.security?.type || 'none'} onValueChange={(value: SecurityType) => handleSecurityChange('type', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um tipo de proteção" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Sem proteção (Pública)</SelectItem>
                                <SelectItem value="sso">SSO do Marketing Cloud</SelectItem>
                                <SelectItem value="password">Senha única por usuário</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {pageState.meta.security?.type === 'sso' && (
                         <p className="text-sm text-muted-foreground">
                            Os usuários serão redirecionados para a tela de login do Salesforce Marketing Cloud se não estiverem autenticados.
                        </p>
                    )}

                     {pageState.meta.security?.type === 'password' && pageState.meta.security.passwordConfig && (
                        <div className="space-y-4 pt-4 border-t">
                            <h4 className="font-medium text-sm">Configuração da Senha</h4>
                            <div className="space-y-2">
                                <Label htmlFor="pw-de-key">Chave da Data Extension de Senhas</Label>
                                <Input id="pw-de-key" value={pageState.meta.security.passwordConfig.dataExtensionKey} onChange={(e) => handlePasswordConfigChange('dataExtensionKey', e.target.value)} placeholder="Ex: DE_SENHAS_USUARIOS" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="pw-id-col">Coluna do Identificador do Usuário</Label>
                                <Input id="pw-id-col" value={pageState.meta.security.passwordConfig.identifierColumn} onChange={(e) => handlePasswordConfigChange('identifierColumn', e.target.value)} placeholder="Ex: SubscriberKey ou EmailAddress"/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="pw-pass-col">Coluna da Senha</Label>
                                <Input id="pw-pass-col" value={pageState.meta.security.passwordConfig.passwordColumn} onChange={(e) => handlePasswordConfigChange('passwordColumn', e.target.value)} placeholder="Ex: Senha" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="pw-url-param">Parâmetro de URL para Identificador</Label>
                                <Input id="pw-url-param" value={pageState.meta.security.passwordConfig.urlParameter} onChange={(e) => handlePasswordConfigChange('urlParameter', e.target.value)} placeholder="Ex: id" />
                            </div>
                        </div>
                    )}

                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="scheduling" className="bg-card rounded-lg border">
                <AccordionTrigger className="p-4">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    <span>Agendamento</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2 px-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="scheduling-enabled">Ativar Agendamento</Label>
                        <Switch
                            id="scheduling-enabled"
                            checked={isSchedulingEnabled}
                            onCheckedChange={toggleScheduling}
                        />
                    </div>
                    {isSchedulingEnabled && (
                        <div className="space-y-4 pt-4 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="publish-date">Data de Publicação</Label>
                                <Input
                                    id="publish-date"
                                    type="datetime-local"
                                    value={toDatetimeLocal(pageState.publishDate)}
                                    onChange={(e) => handleScheduleChange('publishDate', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expiry-date">Data de Expiração</Label>
                                <Input
                                    id="expiry-date"
                                    type="datetime-local"
                                    value={toDatetimeLocal(pageState.expiryDate)}
                                    onChange={(e) => handleScheduleChange('expiryDate', e.target.value)}
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
