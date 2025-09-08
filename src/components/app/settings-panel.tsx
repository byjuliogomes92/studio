

"use client";

import type { Dispatch, SetStateAction } from "react";
import type { CloudPage, PageComponent, ComponentType, SecurityType, AnimationType, Brand, Action, CookieCategory } from "@/lib/types";
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
import { GripVertical, HelpCircle, Text, Heading1, Heading2, Minus, Image, Film, Timer, MousePointerClick, StretchHorizontal, Cookie, Layers, PanelTop, Vote, Smile, MapPin, AlignStartVertical, AlignEndVertical, Star, Code, Share2, Columns, Lock, Zap, Bot, CalendarClock, Settings, LayoutGrid, Palette, Globe, Download, X, Copy, View, Sparkles, UploadCloud, Layers3, Hand, Circle, Square, ArrowLeft, Trash2, PlusCircle, Plus, Megaphone, Library, ArrowUp, ArrowDown } from "lucide-react";
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
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { MediaLibraryDialog } from "./media-library-dialog";
import { getBrandsForUser, updateBrand } from "@/lib/firestore";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { ColorInput } from "./settings/color-input";
import { ComponentSettings } from './settings/component-settings';
import { ImageInput } from "./settings/image-input";


interface SettingsPanelProps {
  pageState: CloudPage;
  setPageState: Dispatch<SetStateAction<CloudPage | null>>;
  selectedComponentId: string | null;
  setSelectedComponentId: Dispatch<SetStateAction<string | null>>;
  pageName: string;
  onPageNameChange: (newName: string) => void;
  projectPages: CloudPage[];
  onCodeEdit: (component: PageComponent) => void;
  onDuplicateComponent: (id: string) => void;
  onDeleteComponent: (id: string) => void;
  onAddComponentToContainer: (parentId: string | null, column: number, typeOrBlock: ComponentType | PageComponent[]) => void;
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
    AddToCalendar: CalendarClock,
    PopUp: Megaphone,
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


function Dropzone({ id, children, className, onAddComponent }: { id: string; children: React.ReactNode; className?: string, onAddComponent: (typeOrBlock: ComponentType | PageComponent[]) => void }) {
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
             <AddComponentDialog onAddComponent={onAddComponent}>
                <Button variant="outline" size="sm" className="w-full h-8 mt-1 border-dashed">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Adicionar
                </Button>
            </AddComponentDialog>
        </div>
    );
}

function ComponentItem({
  component,
  selectedComponentId,
  setSelectedComponentId,
  moveComponent,
  onDeleteComponent,
  isDraggable = true,
  dndAttributes,
  dndListeners,
  children,
}: {
  component: PageComponent;
  selectedComponentId: string | null;
  setSelectedComponentId: (id: string | null) => void;
  moveComponent: (id: string, direction: 'up' | 'down') => void;
  onDeleteComponent: (id: string) => void;
  isDraggable?: boolean;
  dndAttributes?: any;
  dndListeners?: any;
  children?: React.ReactNode;
}) {
  const Icon = componentIcons[component.type] || Text;
  const isContainer = ['Columns', 'Div', 'PopUp'].includes(component.type);

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
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveComponent(component.id, 'up')}><ArrowUp className="h-4 w-4"/></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveComponent(component.id, 'down')}><ArrowDown className="h-4 w-4"/></Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4"/></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Componente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir o componente "{component.layerName || component.type}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteComponent(component.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </div>
          {isContainer && children && (
            <div className="pl-4 pr-1 pb-1">
                {children}
            </div>
          )}
      </div>
  );

  return isContainer ? <div className="bg-background/50 p-1.5 rounded-lg border-l-2 border-primary/20">{content}</div> : content;
}


export function SettingsPanel({
  pageState,
  setPageState,
  selectedComponentId,
  setSelectedComponentId,
  pageName,
  onPageNameChange,
  projectPages,
  onCodeEdit,
  onDuplicateComponent,
  onDeleteComponent,
  onAddComponentToContainer
}: SettingsPanelProps) {

  const { user, activeWorkspace } = useAuth();
  const { toast } = useToast();
  const [isAmpscriptDialogOpen, setIsAmpscriptDialogOpen] = useState(false);
  const [isSchedulingEnabled, setIsSchedulingEnabled] = useState(!!pageState?.publishDate || !!pageState?.expiryDate);
  const [tagInput, setTagInput] = useState('');
  const [userBrands, setUserBrands] = useState<Brand[]>([]);

  useEffect(() => {
    if (!pageState) return;
    if (activeWorkspace) {
        getBrandsForUser(activeWorkspace.id)
            .then(setUserBrands)
            .catch(err => {
                console.error("Failed to fetch brands", err);
                toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os Kits de Marca.' });
            });
    }
  }, [activeWorkspace, toast, pageState]);

  if (!pageState || !pageState.components) {
    return null; // or a loading state
  }


  const activeBrand = userBrands.find(b => b.id === pageState?.brandId);

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

  const handleStyleChange = (prop: keyof CloudPage["styles"], value: any) => {
    setPageState((prev) => prev ? ({ ...prev, styles: { ...prev.styles, [prop]: value } }) : null);
  };

  const handleScrollbarStyleChange = (prop: keyof NonNullable<CloudPage['styles']['scrollbar']>, value: any) => {
    setPageState(prev => {
        if (!prev) return null;
        return produce(prev, draft => {
            if (!draft.styles.scrollbar) {
                draft.styles.scrollbar = {
                    enabled: false, width: '10px', trackColor: '#f1f1f1',
                    thumbColor: '#888888', thumbHoverColor: '#555555', thumbBorderRadius: '5px'
                };
            }
            (draft.styles.scrollbar as any)[prop] = value;
        });
    });
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
  
  const handleCookieBannerChange = (prop: string, value: any) => {
    setPageState(prev => {
        if (!prev) return null;
        
        return produce(prev, draft => {
            if (!draft.cookieBanner) {
                draft.cookieBanner = {
                    enabled: false, position: 'bottom', layout: 'bar',
                    title: '', description: '', acceptButtonText: 'Aceitar',
                    declineButtonText: 'Recusar', preferencesButtonText: 'Preferências',
                    privacyPolicyLink: '', categories: [],
                    styles: { backgroundColor: '', textColor: '', buttonBackgroundColor: '', buttonTextColor: '' }
                };
            }

            const path = prop.split('.');
            if (path.length > 1) {
                if (!(draft.cookieBanner as any)[path[0]]) {
                    (draft.cookieBanner as any)[path[0]] = {};
                }
                (draft.cookieBanner as any)[path[0]][path[1]] = value;
            } else {
                (draft.cookieBanner as any)[prop] = value;
            }
        });
    });
  };

  const handleCookieCategoryChange = (index: number, prop: keyof CookieCategory, value: string | boolean) => {
      setPageState(prev => {
          if (!prev || !prev.cookieBanner) return prev;
          const newBanner = produce(prev.cookieBanner, draft => {
              (draft.categories[index] as any)[prop] = value;
          });
          return { ...prev, cookieBanner: newBanner };
      });
  };

  const addCookieCategory = () => {
      const newCategory: CookieCategory = {
          id: `cat_${Date.now()}`,
          name: 'Nova Categoria',
          description: '',
          scripts: '',
          required: false,
      };
       handleCookieBannerChange('categories', [...(pageState.cookieBanner?.categories || []), newCategory]);
  }
  
  const removeCookieCategory = (index: number) => {
      if (!pageState.cookieBanner) return;
      const newCategories = pageState.cookieBanner.categories.filter((_, i) => i !== index);
      handleCookieBannerChange('categories', newCategories);
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
  
     const moveComponent = (componentId: string, direction: 'up' | 'down') => {
        setPageState(currentState => {
            if (!currentState) return null;
            
            return produce(currentState, draft => {
                const componentIndex = draft.components.findIndex(c => c.id === componentId);
                if (componentIndex === -1) return;

                const component = draft.components[componentIndex];
                const siblings = draft.components
                    .filter(c => c.parentId === component.parentId && c.column === component.column)
                    .sort((a, b) => a.order - b.order);
                
                const currentOrderIndex = siblings.findIndex(s => s.id === componentId);
                
                let swapIndex = -1;
                if (direction === 'up' && currentOrderIndex > 0) {
                    swapIndex = currentOrderIndex - 1;
                } else if (direction === 'down' && currentOrderIndex < siblings.length - 1) {
                    swapIndex = currentOrderIndex + 1;
                }

                if (swapIndex !== -1) {
                    const siblingToSwap = siblings[swapIndex];
                    const originalOrder = component.order;
                    
                    const componentInDraft = draft.components.find(c => c.id === componentId);
                    const siblingInDraft = draft.components.find(c => c.id === siblingToSwap.id);
                    
                    if (componentInDraft && siblingInDraft) {
                       componentInDraft.order = siblingToSwap.order;
                       siblingInDraft.order = originalOrder;
                    }
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
                    const newParentId = overId.startsWith('root-dropzone') ? null : overId.split('-')[0];
                    const newColumnIndex = overId.includes('-') ? parseInt(overId.split('-')[1], 10) : 0;
                    
                    activeComponent.parentId = newParentId;
                    activeComponent.column = newColumnIndex;
                } else if (overComponent) {
                    const sameContainer = activeComponent.parentId === overComponent.parentId;
                    
                    if (sameContainer) {
                        // Reorder within the same container
                        const parentId = activeComponent.parentId;
                        const column = activeComponent.column;
                        const siblings = draft.components
                            .filter(c => c.parentId === parentId && c.column === column)
                            .sort((a,b) => a.order - b.order); // Sort to ensure correct indexing
                        
                        const oldIndex = siblings.findIndex(c => c.id === activeId);
                        const newIndex = siblings.findIndex(c => c.id === overId);

                        if (oldIndex !== -1 && newIndex !== -1) {
                            const [movedItem] = siblings.splice(oldIndex, 1);
                            siblings.splice(newIndex, 0, movedItem);

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
                        const children = draft.components
                          .filter(c => c.parentId === pId && c.column === i)
                          .sort((a,b) => a.order - b.order); // Ensure we are iterating in a stable order
                        
                        children.forEach((child, index) => {
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
        if (!pageState || !pageState.components) { // Safety check
            return [];
        }
        const componentsToRender = pageState.components
            .filter(c => c.parentId === parentId && (column === null || c.column === column))
            .sort((a, b) => a.order - b.order);
        
        return componentsToRender.map((component) => (
            <SortableItem key={component.id} component={component}>
                <ComponentItem
                    component={component}
                    selectedComponentId={selectedComponentId}
                    setSelectedComponentId={setSelectedComponentId}
                    moveComponent={moveComponent}
                    onDeleteComponent={onDeleteComponent}
                >
                    {['Columns', 'Div', 'PopUp'].includes(component.type) && (
                        <div 
                            className="grid gap-2" 
                            style={{ gridTemplateColumns: `repeat(${component.props.columnCount || 1}, 1fr)` }}
                        >
                            {Array.from({ length: component.props.columnCount || 1 }).map((_, i) => (
                                <Dropzone 
                                    key={`${component.id}-col-${i}`} 
                                    id={`${component.id}-${i}`}
                                    onAddComponent={(typeOrBlock) => onAddComponentToContainer(component.id, i, typeOrBlock)}
                                >
                                    {renderComponentsRecursive(component.id, i)}
                                </Dropzone>
                            ))}
                        </div>
                    )}
                </ComponentItem>
            </SortableItem>
        ));
    };
    
  
  const rootComponents = pageState.components.filter(c => c.parentId === null && !['Stripe', 'FloatingImage', 'FloatingButton', 'WhatsApp', 'Footer', 'PopUp'].includes(c.type));

  const toDatetimeLocal = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

    return (
    <div className="flex flex-col h-full bg-card border-r w-full">
      <ScrollArea className="flex-grow">
        {selectedComponentId && pageState.components.find(c => c.id === selectedComponentId) ? (
            <div className="p-4">
                 <Button variant="ghost" onClick={() => setSelectedComponentId(null)} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para Camadas
                </Button>
                <ComponentSettings 
                    key={selectedComponentId}
                    component={pageState.components.find(c => c.id === selectedComponentId)!}
                    onComponentChange={(id, newProps) => setPageState(prev => prev ? produce(prev, draft => {
                        const index = draft.components.findIndex(c => c.id === id);
                        if (index !== -1) {
                            draft.components[index] = { ...draft.components[index], ...newProps };
                        }
                    }) : null)}
                    onCodeEdit={onCodeEdit}
                    projectPages={projectPages}
                    pageState={pageState}
                    onDuplicate={onDuplicateComponent}
                    onDelete={onDeleteComponent}
                />
            </div>
        ) : (
            <TooltipProvider>
              <div className="p-4 space-y-2">
                  <Accordion type="multiple" defaultValue={['components']} className="w-full space-y-2">
                    
                    <AccordionItem value="page-settings" className="bg-card rounded-lg border">
                      <AccordionTrigger className="p-4 text-sm font-medium">
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
      
                    <AccordionItem value="components" className="bg-card rounded-lg border">
                      <AccordionTrigger className="p-4 text-sm font-medium">
                         <div className="flex items-center gap-2">
                          <LayoutGrid className="h-4 w-4" />
                          <span>Camadas</span>
                         </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2 px-4">
                           <DndContext 
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                          >
                            <Dropzone id="root-dropzone-0" onAddComponent={(typeOrBlock) => onAddComponentToContainer(null, 0, typeOrBlock)}>
                                {renderComponentsRecursive(null)}
                            </Dropzone>
                           </DndContext>
                      </AccordionContent>
                    </AccordionItem>

                     <AccordionItem value="global-styles" className="bg-card rounded-lg border">
                      <AccordionTrigger className="p-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          <span>Estilo Global</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2 px-4">
                         <div className="space-y-2">
                           <Label>Fonte Global</Label>
                           <Select value={pageState.styles.fontFamily} onValueChange={(value) => handleStyleChange('fontFamily', value)}>
                             <SelectTrigger><SelectValue/></SelectTrigger>
                             <SelectContent>
                               {googleFonts.map(font => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                             </SelectContent>
                           </Select>
                         </div>
                        <div className="space-y-2">
                           <ColorInput label="Cor de Fundo da Página" value={pageState.styles.backgroundColor || ''} onChange={(value) => handleStyleChange('backgroundColor', value)} brand={activeBrand}/>
                        </div>
                        <div className="space-y-2">
                           <ImageInput label="URL da Imagem de Fundo" value={pageState.styles.backgroundImage || ''} onPropChange={(prop, value) => handleStyleChange(prop as any, value)} propName="backgroundImage" tooltipText="URL para a imagem de fundo da página."/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <ColorInput label="Cor do Tema" value={pageState.styles.themeColor || ''} onChange={(value) => handleStyleChange('themeColor', value)} brand={activeBrand} tooltip="Define a cor principal para botões e outros elementos."/>
                           </div>
                           <div className="space-y-2">
                             <ColorInput label="Cor do Tema (Hover)" value={pageState.styles.themeColorHover || ''} onChange={(value) => handleStyleChange('themeColorHover', value)} brand={activeBrand} tooltip="Cor ao passar o mouse sobre botões."/>
                           </div>
                        </div>
                        <Separator />
                         <div className="space-y-2">
                           <h4 className="font-semibold text-sm">Estilos Globais de Componentes</h4>
                            <p className="text-xs text-muted-foreground">Isso define o estilo padrão para todos os componentes deste tipo, que pode ser sobrescrito individualmente. Os estilos são herdados do Kit de Marca, se houver um selecionado.</p>
                           <div className="space-y-2">
                               <Label>Cantos do Botão</Label>
                               <ToggleGroup type="single" value={buttonBorderRadius} onValueChange={(value) => value && handleBrandComponentStyleChange('button', 'borderRadius', value)} className="w-full">
                                   <ToggleGroupItem value="0.25rem" aria-label="Reto"><Square className="h-5 w-5"/></ToggleGroupItem>
                                   <ToggleGroupItem value="0.5rem" aria-label="Curvado"><div className="w-5 h-5 border-2 border-current rounded-md"></div></ToggleGroupItem>
                                   <ToggleGroupItem value="9999px" aria-label="Redondo"><Circle className="h-5 w-5"/></ToggleGroupItem>
                               </ToggleGroup>
                           </div>
                        </div>
                         <Separator />
                        <div className="flex items-center justify-between">
                            <Label htmlFor="scrollbar-enabled">Customizar Barra de Rolagem</Label>
                            <Switch id="scrollbar-enabled" checked={pageState.styles.scrollbar?.enabled || false} onCheckedChange={(checked) => handleScrollbarStyleChange('enabled', checked)}/>
                        </div>
                        {pageState.styles.scrollbar?.enabled && (
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <Label className="text-xs">Largura</Label>
                                    <Input value={pageState.styles.scrollbar.width || ''} onChange={e => handleScrollbarStyleChange('width', e.target.value)} />
                                </div>
                                 <div className="space-y-2">
                                    <Label className="text-xs">Borda do Polegar</Label>
                                    <Input value={pageState.styles.scrollbar.thumbBorderRadius || ''} onChange={e => handleScrollbarStyleChange('thumbBorderRadius', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <ColorInput label="Cor da Trilha" value={pageState.styles.scrollbar.trackColor || ''} onChange={v => handleScrollbarStyleChange('trackColor', v)} />
                                </div>
                                 <div className="space-y-2">
                                    <ColorInput label="Cor do Polegar" value={pageState.styles.scrollbar.thumbColor || ''} onChange={v => handleScrollbarStyleChange('thumbColor', v)} />
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                           <Label htmlFor="custom-css">CSS Customizado</Label>
                           <Textarea id="custom-css" value={pageState.styles.customCss || ''} onChange={(e) => handleStyleChange('customCss', e.target.value)} rows={5} placeholder=".minha-classe { color: red; }" />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                     <AccordionItem value="page-meta" className="bg-card rounded-lg border">
                      <AccordionTrigger className="p-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>SEO & Metadados</span>
                        </div>
                      </AccordionTrigger>
                       <AccordionContent className="space-y-4 pt-2 px-4">
                         <div className="space-y-2">
                            <Label htmlFor="meta-title">Título da Aba do Navegador</Label>
                            <Input id="meta-title" value={pageState.meta.title || ''} onChange={e => handleMetaChange('title', e.target.value)} />
                         </div>
                          <div className="space-y-2">
                            <Label htmlFor="meta-description">Descrição da Página (para buscadores)</Label>
                            <Textarea id="meta-description" value={pageState.meta.metaDescription || ''} onChange={e => handleMetaChange('metaDescription', e.target.value)} rows={3} />
                         </div>
                          <div className="space-y-2">
                            <Label htmlFor="meta-keywords">Palavras-chave (separadas por vírgula)</Label>
                            <Input id="meta-keywords" value={pageState.meta.metaKeywords || ''} onChange={e => handleMetaChange('metaKeywords', e.target.value)} />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label>Favicon</Label>
                              <div className="flex items-center gap-2">
                                 <Input value={pageState.meta.faviconUrl || ''} onChange={e => handleMetaChange('faviconUrl', e.target.value)} />
                                  <MediaLibraryDialog onSelectImage={(url) => handleMetaChange('faviconUrl', url)}>
                                       <Button variant="outline" size="icon"><Library className="h-4 w-4"/></Button>
                                  </MediaLibraryDialog>
                              </div>
                           </div>
                           <div className="space-y-2">
                              <Label>Loader</Label>
                               <Select value={pageState.meta.loaderType || 'animation'} onValueChange={v => handleMetaChange('loaderType', v)}>
                                 <SelectTrigger><SelectValue/></SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="animation">Animação</SelectItem>
                                   <SelectItem value="image">Imagem</SelectItem>
                                   <SelectItem value="none">Nenhum</SelectItem>
                                 </SelectContent>
                               </Select>
                           </div>
                         </div>
                         {pageState.meta.loaderType === 'image' && (
                           <div className="space-y-2">
                               <Label>Imagem do Loader</Label>
                               <div className="flex items-center gap-2">
                                  <Input value={pageState.meta.loaderImageUrl || ''} onChange={e => handleMetaChange('loaderImageUrl', e.target.value)} />
                                   <MediaLibraryDialog onSelectImage={(url) => handleMetaChange('loaderImageUrl', url)}>
                                       <Button variant="outline" size="icon"><Library className="h-4 w-4"/></Button>
                                   </MediaLibraryDialog>
                               </div>
                           </div>
                         )}
                          {pageState.meta.loaderType !== 'none' && pageState.meta.loaderType !== 'image' && (
                             <div className="space-y-2">
                                <Label>Animação do Loader</Label>
                                 <Select value={pageState.meta.loaderAnimation || 'spin'} onValueChange={v => handleMetaChange('loaderAnimation', v)}>
                                   <SelectTrigger><SelectValue/></SelectTrigger>
                                   <SelectContent>
                                     <SelectItem value="spin">Girar</SelectItem>
                                     <SelectItem value="pulse">Pulsar</SelectItem>
                                   </SelectContent>
                                 </Select>
                             </div>
                           )}
                       </AccordionContent>
                     </AccordionItem>

                      <AccordionItem value="scheduling" className="bg-card rounded-lg border">
                        <AccordionTrigger className="p-4 text-sm font-medium">
                            <div className="flex items-center gap-2">
                            <CalendarClock className="h-4 w-4" />
                            <span>Agendamento</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2 px-4">
                             <div className="flex items-center justify-between">
                                <Label htmlFor="schedule-enabled">Habilitar Agendamento</Label>
                                <Switch id="schedule-enabled" checked={isSchedulingEnabled} onCheckedChange={toggleScheduling} />
                            </div>
                            {isSchedulingEnabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="publish-date">Data de Publicação</Label>
                                        <Input id="publish-date" type="datetime-local" value={toDatetimeLocal(pageState.publishDate)} onChange={(e) => handleScheduleChange('publishDate', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry-date">Data de Expiração</Label>
                                        <Input id="expiry-date" type="datetime-local" value={toDatetimeLocal(pageState.expiryDate)} onChange={(e) => handleScheduleChange('expiryDate', e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </AccordionContent>
                      </AccordionItem>

                     <AccordionItem value="security-tracking" className="bg-card rounded-lg border">
                        <AccordionTrigger className="p-4 text-sm font-medium">
                            <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            <span>Segurança e Tracking</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-6 pt-2 px-4">
                            <div className="space-y-2">
                                <Label htmlFor="security-type">Tipo de Proteção</Label>
                                <Select value={pageState.meta.security?.type || 'none'} onValueChange={v => handleSecurityChange('type', v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Nenhuma</SelectItem>
                                        <SelectItem value="sso">SSO do Marketing Cloud</SelectItem>
                                        <SelectItem value="password">Senha da Data Extension</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {pageState.meta.security?.type === 'password' && (
                                <div className="p-3 border rounded-md space-y-3 bg-muted/40">
                                    <div className="space-y-2">
                                        <Label htmlFor="sec-dekey" className="text-xs">DE da Senha</Label>
                                        <Input id="sec-dekey" value={pageState.meta.security.passwordConfig?.dataExtensionKey || ''} onChange={e => handlePasswordConfigChange('dataExtensionKey', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                         <div className="space-y-2">
                                            <Label htmlFor="sec-idcol" className="text-xs">Coluna ID</Label>
                                            <Input id="sec-idcol" value={pageState.meta.security.passwordConfig?.identifierColumn || 'SubscriberKey'} onChange={e => handlePasswordConfigChange('identifierColumn', e.target.value)} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="sec-passcol" className="text-xs">Coluna Senha</Label>
                                            <Input id="sec-passcol" value={pageState.meta.security.passwordConfig?.passwordColumn || 'Password'} onChange={e => handlePasswordConfigChange('passwordColumn', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sec-urlparam" className="text-xs">Parâmetro na URL</Label>
                                        <Input id="sec-urlparam" value={pageState.meta.security.passwordConfig?.urlParameter || 'id'} onChange={e => handlePasswordConfigChange('urlParameter', e.target.value)} />
                                    </div>
                                </div>
                            )}

                             <Separator/>
                             <div className="space-y-2">
                                <Label>Pixels de Tracking</Label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Switch id="ga4-enabled" checked={pageState.meta.tracking?.ga4?.enabled} onCheckedChange={c => handleTrackingChange('ga4', 'enabled', c)} />
                                        <Input value={pageState.meta.tracking?.ga4?.id || ''} onChange={e => handleTrackingChange('ga4', 'id', e.target.value)} placeholder="GA4 ID (G-...)" />
                                    </div>
                                     <div className="flex items-center gap-2">
                                        <Switch id="meta-enabled" checked={pageState.meta.tracking?.meta?.enabled} onCheckedChange={c => handleTrackingChange('meta', 'enabled', c)} />
                                        <Input value={pageState.meta.tracking?.meta?.id || ''} onChange={e => handleTrackingChange('meta', 'id', e.target.value)} placeholder="Meta Pixel ID" />
                                    </div>
                                     <div className="flex items-center gap-2">
                                        <Switch id="linkedin-enabled" checked={pageState.meta.tracking?.linkedin?.enabled} onCheckedChange={c => handleTrackingChange('linkedin', 'enabled', c)} />
                                        <Input value={pageState.meta.tracking?.linkedin?.id || ''} onChange={e => handleTrackingChange('linkedin', 'id', e.target.value)} placeholder="LinkedIn Partner ID" />
                                    </div>
                                </div>
                             </div>
                        </AccordionContent>
                     </AccordionItem>

                    <AccordionItem value="cookie" className="bg-card rounded-lg border">
                      <AccordionTrigger className="p-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Cookie className="h-4 w-4" />
                          <span>Banner de Cookies</span>
                        </div>
                      </AccordionTrigger>
                       <AccordionContent className="space-y-4 pt-2 px-4">
                         <div className="flex items-center justify-between">
                            <Label htmlFor="cookie-enabled">Habilitar Banner</Label>
                            <Switch id="cookie-enabled" checked={pageState.cookieBanner?.enabled ?? false} onCheckedChange={(checked) => handleCookieBannerChange('enabled', checked)}/>
                         </div>
                         {pageState.cookieBanner?.enabled && (
                            <div className="space-y-4">
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Posição</Label>
                                    <Select value={pageState.cookieBanner.position || 'bottom'} onValueChange={v => handleCookieBannerChange('position', v)}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="bottom">Barra (Inferior)</SelectItem>
                                        <SelectItem value="bottom-left">Card (Inf. Esq.)</SelectItem>
                                        <SelectItem value="bottom-right">Card (Inf. Dir.)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Layout</Label>
                                    <Select value={pageState.cookieBanner.layout || 'bar'} onValueChange={v => handleCookieBannerChange('layout', v)}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="bar">Barra</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                               </div>

                               <div className="space-y-2">
                                   <Label htmlFor="cookie-title">Título</Label>
                                   <Input id="cookie-title" value={pageState.cookieBanner.title || ''} onChange={e => handleCookieBannerChange('title', e.target.value)} />
                               </div>
                               <div className="space-y-2">
                                   <Label htmlFor="cookie-description">Descrição</Label>
                                   <Textarea id="cookie-description" value={pageState.cookieBanner.description || ''} onChange={e => handleCookieBannerChange('description', e.target.value)} rows={4} />
                               </div>
                               <div className="space-y-2">
                                   <Label htmlFor="cookie-privacy-link">Link da Política de Privacidade</Label>
                                   <Input id="cookie-privacy-link" value={pageState.cookieBanner.privacyPolicyLink || ''} onChange={e => handleCookieBannerChange('privacyPolicyLink', e.target.value)} />
                               </div>

                               <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-2">
                                      <Label>Cor de Fundo</Label>
                                      <ColorInput value={pageState.cookieBanner.styles?.backgroundColor || ''} onChange={v => handleCookieBannerChange('styles.backgroundColor', v)} />
                                   </div>
                                    <div className="space-y-2">
                                      <Label>Cor do Texto</Label>
                                      <ColorInput value={pageState.cookieBanner.styles?.textColor || ''} onChange={v => handleCookieBannerChange('styles.textColor', v)} />
                                   </div>
                               </div>

                                <Separator />
                                <h4 className="font-semibold text-sm">Botões</h4>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label>Texto (Aceitar)</Label>
                                        <Input value={pageState.cookieBanner.acceptButtonText || ''} onChange={e => handleCookieBannerChange('acceptButtonText', e.target.value)} />
                                     </div>
                                      <div className="space-y-2">
                                        <Label>Texto (Recusar)</Label>
                                        <Input value={pageState.cookieBanner.declineButtonText || ''} onChange={e => handleCookieBannerChange('declineButtonText', e.target.value)} />
                                     </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label>Cor de Fundo (Botão)</Label>
                                        <ColorInput value={pageState.cookieBanner.styles?.buttonBackgroundColor || ''} onChange={v => handleCookieBannerChange('styles.buttonBackgroundColor', v)} />
                                     </div>
                                      <div className="space-y-2">
                                        <Label>Cor do Texto (Botão)</Label>
                                        <ColorInput value={pageState.cookieBanner.styles?.buttonTextColor || ''} onChange={v => handleCookieBannerChange('styles.buttonTextColor', v)} />
                                     </div>
                                </div>

                                <Separator />
                                <h4 className="font-semibold text-sm">Categorias de Cookies</h4>
                                <div className="space-y-2">
                                    {(pageState.cookieBanner.categories || []).map((category, index) => (
                                        <div key={category.id} className="p-3 border rounded-lg bg-muted/40 space-y-2">
                                            <div className="flex justify-end">
                                                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeCookieCategory(index)} disabled={category.required}>
                                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Nome da Categoria</Label>
                                                    <Input value={category.name || ''} onChange={e => handleCookieCategoryChange(index, 'name', e.target.value)} disabled={category.required}/>
                                                </div>
                                                <div className="flex items-end pb-1">
                                                    <div className="flex items-center space-x-2">
                                                        <Switch id={`cat-required-${category.id}`} checked={category.required} onCheckedChange={c => handleCookieCategoryChange(index, 'required', c)} disabled={category.required}/>
                                                        <Label htmlFor={`cat-required-${category.id}`} className="text-xs">Obrigatório</Label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Descrição</Label>
                                                <Textarea value={category.description || ''} onChange={e => handleCookieCategoryChange(index, 'description', e.target.value)} rows={2} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Scripts (cole a tag aqui)</Label>
                                                <Textarea value={category.scripts || ''} onChange={e => handleCookieCategoryChange(index, 'scripts', e.target.value)} rows={4} className="font-mono text-xs"/>
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" className="w-full" onClick={addCookieCategory}>
                                        <Plus className="h-4 w-4 mr-2"/> Adicionar Categoria
                                    </Button>
                                </div>
                            </div>
                         )}
                       </AccordionContent>
                     </AccordionItem>

                     <AccordionItem value="ampscript" className="bg-card rounded-lg border">
                      <AccordionTrigger className="p-4 text-sm font-medium">
                         <div className="flex items-center gap-2">
                           <Bot className="h-4 w-4" />
                           <span>AMPScript Customizado</span>
                         </div>
                      </AccordionTrigger>
                       <AccordionContent className="space-y-4 pt-2 px-4">
                            <Dialog open={isAmpscriptDialogOpen} onOpenChange={setIsAmpscriptDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        <Sparkles className="mr-2 h-4 w-4"/>
                                        Usar Automação Pronta
                                    </Button>
                                </DialogTrigger>
                                <AmpscriptSnippetDialog 
                                    currentCode={pageState.meta.customAmpscript || ''}
                                    onCodeChange={handleAmpscriptChange}
                                    onClose={() => setIsAmpscriptDialogOpen(false)}
                                />
                            </Dialog>
                           <Textarea 
                                id="custom-ampscript"
                                value={pageState.meta.customAmpscript || ''}
                                onChange={e => handleAmpscriptChange(e.target.value)}
                                placeholder='%%[ VAR @meuAtributo ... ]%%'
                                rows={10}
                                className="font-mono text-xs"
                           />
                       </AccordionContent>
                     </AccordionItem>
                  </Accordion>
              </div>
            </TooltipProvider>
            )}
        </ScrollArea>
    </div>
    );
}

    
    
