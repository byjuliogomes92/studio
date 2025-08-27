

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Plus,
  AlignStartVertical,
  Image,
  PanelTop,
  AlignEndVertical,
  Heading1,
  Heading2,
  Text,
  Film,
  MapPin,
  MousePointerClick,
  Timer,
  Minus,
  StretchHorizontal,
  Layers,
  Vote,
  Smile,
  Share2,
  type LucideIcon,
  Columns,
  BarChart,
  Zap,
  Download,
  Building2,
  GalleryThumbnails,
  Newspaper,
  LayoutTemplate,
} from "lucide-react";
import type { ComponentType, PageComponent } from "@/lib/types";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

type BlockType = 'product-showcase' | 'simple-gallery' | 'news-section';

const componentList: {
  category: string;
  components: { name: ComponentType; icon: LucideIcon; enabled: boolean }[];
}[] = [
  {
    category: "Estrutura",
    components: [
      { name: "Header", icon: AlignStartVertical, enabled: true },
      { name: "Banner", icon: Image, enabled: true },
      { name: "Stripe", icon: PanelTop, enabled: true },
      { name: "Footer", icon: AlignEndVertical, enabled: true },
    ],
  },
  {
    category: "Conteúdo",
    components: [
      { name: "Title", icon: Heading1, enabled: true },
      { name: "Subtitle", icon: Heading2, enabled: true },
      { name: "Paragraph", icon: Text, enabled: true },
      { name: "Image", icon: Image, enabled: true },
      { name: "Video", icon: Film, enabled: true },
      { name: "Map", icon: MapPin, enabled: true },
    ],
  },
  {
    category: "Layout",
    components: [
      { name: "Columns", icon: Columns, enabled: true },
      { name: "Button", icon: MousePointerClick, enabled: true },
      { name: "DownloadButton", icon: Download, enabled: true },
      { name: "Countdown", icon: Timer, enabled: true },
      { name: "Divider", icon: Minus, enabled: true },
      { name: "Spacer", icon: StretchHorizontal, enabled: true },
      { name: "SocialIcons", icon: Share2, enabled: true },
      { name: "WhatsApp", icon: Zap, enabled: true },
    ],
  },
  {
    category: "Interativos",
    components: [
      { name: "Form", icon: Text, enabled: true },
      { name: "Accordion", icon: Layers, enabled: true },
      { name: "Tabs", icon: PanelTop, enabled: true },
      { name: "Voting", icon: Vote, enabled: true },
      { name: "NPS", icon: Smile, enabled: true },
      { name: "Chart", icon: BarChart, enabled: false },
    ],
  },
];

const blockList: {
    name: string;
    description: string;
    type: BlockType;
    icon: LucideIcon;
}[] = [
    {
        name: "Vitrine de Produto",
        description: "Imagem, título, descrição e botão. Ideal para um produto.",
        type: "product-showcase",
        icon: Building2,
    },
    {
        name: "Galeria Simples",
        description: "Layout de 3 colunas com imagens e legendas.",
        type: "simple-gallery",
        icon: GalleryThumbnails,
    },
    {
        name: "Seção de Notícias",
        description: "Grade para 3 artigos recentes com imagem, título e resumo.",
        type: "news-section",
        icon: Newspaper,
    }
]

interface AddComponentDialogProps {
  onAddComponent: (typeOrBlock: ComponentType | PageComponent[]) => void;
}

export function AddComponentDialog({ onAddComponent }: AddComponentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleComponentClick = (type: ComponentType) => {
    onAddComponent(type);
    setIsOpen(false);
  };
  
  const handleBlockClick = (type: BlockType) => {
    let componentsToAdd: PageComponent[] = [];
    const baseId = Date.now();
    
    switch(type) {
        case 'product-showcase': {
            const parentId = `cols-${baseId}`;
            componentsToAdd = [
                { id: parentId, type: 'Columns', props: { columnCount: 2, styles: { alignItems: 'center' } }, order: 0, parentId: null, column: 0 },
                { id: `img-${baseId}`, type: 'Image', props: { src: 'https://placehold.co/600x600.png' }, order: 0, parentId, column: 0 },
                { id: `title-${baseId}`, type: 'Title', props: { text: 'Nome do Produto' }, order: 0, parentId, column: 1 },
                { id: `para-${baseId}`, type: 'Paragraph', props: { text: 'Descreva seu produto aqui. Fale sobre os benefícios, ingredientes e o que o torna especial.' }, order: 1, parentId, column: 1 },
                { id: `btn-${baseId}`, type: 'Button', props: { text: 'Comprar Agora', href: '#', align: 'left' }, order: 2, parentId, column: 1 },
            ];
            break;
        }
        case 'simple-gallery': {
             const parentId = `cols-${baseId}`;
             componentsToAdd = [
                { id: parentId, type: 'Columns', props: { columnCount: 3, styles: { gap: '1rem' } }, order: 0, parentId: null, column: 0 },
             ];
             for(let i=0; i<3; i++) {
                 componentsToAdd.push(
                    { id: `img-${baseId}-${i}`, type: 'Image', props: { src: `https://placehold.co/400x300.png` }, order: 0, parentId, column: i },
                    { id: `para-${baseId}-${i}`, type: 'Paragraph', props: { text: `Legenda da imagem ${i+1}`, styles: { textAlign: 'center', fontSize: '0.9rem', marginTop: '8px' } }, order: 1, parentId, column: i },
                 );
             }
             break;
        }
        case 'news-section': {
             const parentId = `cols-${baseId}`;
             componentsToAdd = [
                { id: `title-${baseId}`, type: 'Title', props: { text: 'Últimas Notícias', styles: { textAlign: 'center', marginBottom: '2rem' } }, order: 0, parentId: null, column: 0 },
                { id: parentId, type: 'Columns', props: { columnCount: 3, styles: { gap: '1.5rem' } }, order: 1, parentId: null, column: 0 },
             ];
              for(let i=0; i<3; i++) {
                 componentsToAdd.push(
                    { id: `img-${baseId}-${i}`, type: 'Image', props: { src: `https://placehold.co/400x250.png` }, order: 0, parentId, column: i },
                    { id: `subtitle-${baseId}-${i}`, type: 'Subtitle', props: { text: `Título da Notícia ${i+1}`, styles: { fontSize: '1.2rem', marginTop: '1rem' } }, order: 1, parentId, column: i },
                    { id: `para-${baseId}-${i}`, type: 'Paragraph', props: { text: `Um breve resumo da notícia para atrair o leitor.` }, order: 2, parentId, column: i },
                    { id: `btn-${baseId}-${i}`, type: 'Button', props: { text: 'Leia Mais', href: '#', align: 'left' }, order: 3, parentId, column: i },
                 );
             }
             break;
        }
    }

    onAddComponent(componentsToAdd);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Componente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Conteúdo</DialogTitle>
        </DialogHeader>
        <TooltipProvider>
            <Tabs defaultValue={"componentes"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="componentes">
                    Componentes
                </TabsTrigger>
                 <TabsTrigger value="blocos">
                    Blocos Prontos
                </TabsTrigger>
            </TabsList>
            <TabsContent value="componentes">
                <Tabs defaultValue={componentList[0].category} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    {componentList.map((group) => (
                    <TabsTrigger key={group.category} value={group.category}>
                        {group.category}
                    </TabsTrigger>
                    ))}
                </TabsList>
                {componentList.map((group) => (
                    <TabsContent key={group.category} value={group.category}>
                    <div className="grid grid-cols-4 gap-4 p-4">
                        {group.components.map(({ name, icon: Icon, enabled }) =>
                        enabled ? (
                            <Button
                                key={name}
                                variant="outline"
                                className="h-24 flex-col gap-2"
                                onClick={() => handleComponentClick(name)}
                            >
                                <Icon className="h-6 w-6" />
                                {name}
                            </Button>
                        ) : (
                            <Tooltip key={name}>
                                <TooltipTrigger asChild>
                                    <div className="h-24 flex flex-col items-center justify-center gap-2 rounded-md border bg-muted/50 text-muted-foreground cursor-not-allowed">
                                        <Icon className="h-6 w-6" />
                                        {name}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Em breve</p>
                                </TooltipContent>
                            </Tooltip>
                        )
                        )}
                    </div>
                    </TabsContent>
                ))}
                </Tabs>
            </TabsContent>
             <TabsContent value="blocos">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                    {blockList.map((block) => {
                        const Icon = block.icon;
                        return (
                             <div key={block.type} className="border rounded-lg p-4 flex flex-col items-start gap-3 hover:bg-accent/50 hover:border-primary cursor-pointer" onClick={() => handleBlockClick(block.type)}>
                                 <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-muted">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-base">{block.name}</h3>
                                 </div>
                                 <p className="text-sm text-muted-foreground">{block.description}</p>
                             </div>
                        )
                    })}
                 </div>
            </TabsContent>
            </Tabs>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}
