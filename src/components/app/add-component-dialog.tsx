

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
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
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type BlockType = 'product-showcase' | 'simple-gallery' | 'news-section' | 'hero-background-image' | 'hero-split-right' | 'hero-split-left' | 'hero-lead-capture';

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
    category: string;
    blocks: {
        name: string;
        description: string;
        type: BlockType;
        icon: LucideIcon;
    }[]
}[] = [
    {
        category: 'Heros',
        blocks: [
            { name: "Hero com Imagem de Fundo", description: "Título, subtítulo e botões sobre uma imagem de fundo.", type: 'hero-background-image', icon: LayoutTemplate },
            { name: "Hero Dividido (Img Direita)", description: "Texto e CTA à esquerda, imagem à direita.", type: 'hero-split-right', icon: LayoutTemplate },
            { name: "Hero Dividido (Img Esquerda)", description: "Imagem à esquerda, texto e CTA à direita.", type: 'hero-split-left', icon: LayoutTemplate },
            { name: "Hero com Captura de Lead", description: "Layout dividido com campo de formulário para conversão rápida.", type: 'hero-lead-capture', icon: LayoutTemplate },
        ]
    },
    {
        category: 'Conteúdo',
        blocks: [
             { name: "Vitrine de Produto", description: "Estrutura para exibir 1, 2 ou 3 produtos com imagem e preços.", type: "product-showcase", icon: Building2 },
             { name: "Galeria Simples", description: "Layout de 3 colunas com imagens e legendas.", type: "simple-gallery", icon: GalleryThumbnails },
             { name: "Seção de Notícias", description: "Grade para 3 artigos recentes com imagem, título e resumo.", type: "news-section", icon: Newspaper },
        ]
    }
]

function ProductShowcaseConfigDialog({ onConfirm }: { onConfirm: (columnCount: number) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [columnCount, setColumnCount] = useState<string>("2");

    const handleConfirm = () => {
        onConfirm(Number(columnCount));
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="border rounded-lg p-4 flex flex-col items-start gap-3 hover:bg-accent/50 hover:border-primary cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-muted">
                            <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-base">Vitrine de Produto</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Estrutura para exibir 1, 2 ou 3 produtos com imagem e preços.</p>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configurar Vitrine de Produtos</DialogTitle>
                    <DialogDescription>
                        Escolha quantos produtos você quer exibir por linha.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label>Número de produtos por linha</Label>
                    <RadioGroup
                        value={columnCount}
                        onValueChange={setColumnCount}
                        className="mt-2 grid grid-cols-3 gap-4"
                    >
                        {[1, 2, 3].map(count => (
                             <Label
                                key={count}
                                htmlFor={`products-${count}`}
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                                <RadioGroupItem value={String(count)} id={`products-${count}`} className="sr-only" />
                                <span className="text-2xl font-bold">{count}</span>
                                <span className="text-sm text-muted-foreground">Produto{count > 1 ? 's' : ''}</span>
                            </Label>
                        ))}
                    </RadioGroup>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button onClick={handleConfirm}>Adicionar Bloco</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface AddComponentDialogProps {
  onAddComponent: (typeOrBlock: ComponentType | PageComponent[]) => void;
}

export function AddComponentDialog({ onAddComponent }: AddComponentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleComponentClick = (type: ComponentType) => {
    onAddComponent(type);
    setIsOpen(false);
  };
  
  const handleBlockClick = (type: BlockType, columnCount: number = 3) => {
    let componentsToAdd: PageComponent[] = [];
    const baseId = Date.now();
    
    switch(type) {
        case 'hero-background-image':
            componentsToAdd = [
                {
                    id: `hero-bg-${baseId}`,
                    type: 'Columns',
                    props: {
                        columnCount: 1,
                        styles: {
                            isHero: true, // Custom prop for specific styling
                            backgroundImageUrl: 'https://picsum.photos/1200/800',
                            paddingTop: '8rem',
                            paddingBottom: '8rem',
                            paddingLeft: '2rem',
                            paddingRight: '2rem',
                            textAlign: 'center',
                            color: '#FFFFFF'
                        }
                    },
                    order: 0, parentId: null, column: 0
                },
                { id: `title-${baseId}`, type: 'Title', props: { text: 'Título Impactante Sobre a Imagem', styles: { fontSize: '3rem', color: '#FFFFFF' } }, order: 0, parentId: `hero-bg-${baseId}`, column: 0 },
                { id: `para-${baseId}`, type: 'Paragraph', props: { text: 'Subtítulo que descreve a proposta de valor de forma clara e concisa.', styles: { fontSize: '1.2rem', maxWidth: '600px', margin: '1rem auto', color: 'rgba(255, 255, 255, 0.9)' } }, order: 1, parentId: `hero-bg-${baseId}`, column: 0 },
                { id: `btn-${baseId}`, type: 'Button', props: { text: 'Chamada para Ação', href: '#' }, order: 2, parentId: `hero-bg-${baseId}`, column: 0 },
            ];
            break;
        case 'hero-split-right':
        case 'hero-split-left': {
            const isImageRight = type === 'hero-split-right';
            const textColumn = isImageRight ? 0 : 1;
            const imageColumn = isImageRight ? 1 : 0;
            const parentId = `hero-split-${baseId}`;
            componentsToAdd = [
                 { id: parentId, type: 'Columns', props: { columnCount: 2, styles: { isHero: true, alignItems: 'center', gap: '3rem', paddingTop: '4rem', paddingBottom: '4rem' } }, order: 0, parentId: null, column: 0 },
                 { id: `title-${baseId}`, type: 'Title', props: { text: 'Resolva um Problema Real', styles: { fontSize: '2.5rem' } }, order: 0, parentId, column: textColumn },
                 { id: `para-${baseId}`, type: 'Paragraph', props: { text: 'Descreva como seu produto ou serviço é a solução que o cliente precisa, destacando os principais benefícios.' }, order: 1, parentId, column: textColumn },
                 { id: `btn-${baseId}`, type: 'Button', props: { text: 'Saiba Mais', href: '#', align: 'left' }, order: 2, parentId, column: textColumn },
                 { id: `img-${baseId}`, type: 'Image', props: { src: 'https://picsum.photos/600/500' }, order: 0, parentId, column: imageColumn },
            ];
            break;
        }
        case 'hero-lead-capture': {
             const parentId = `hero-lead-${baseId}`;
             componentsToAdd = [
                 { id: parentId, type: 'Columns', props: { columnCount: 2, styles: { isHero: true, alignItems: 'center', gap: '3rem', paddingTop: '4rem', paddingBottom: '4rem' } }, order: 0, parentId: null, column: 0 },
                 { id: `title-${baseId}`, type: 'Title', props: { text: 'Receba a Oferta Exclusiva', styles: { fontSize: '2.5rem' } }, order: 0, parentId, column: 0 },
                 { id: `para-${baseId}`, type: 'Paragraph', props: { text: 'Deixe seu e-mail e seja o primeiro a saber sobre nossas novidades e promoções imperdíveis.' }, order: 1, parentId, column: 0 },
                 { id: `form-${baseId}`, type: 'Form', props: { fields: { email: {enabled: true, conditional: null, prefillFromUrl: false } }, placeholders: { email: 'seu@email.com' }, buttonText: 'Enviar', submission: { message: 'Obrigado!' } }, order: 2, parentId, column: 0 },
                 { id: `img-${baseId}`, type: 'Image', props: { src: 'https://picsum.photos/600/500' }, order: 0, parentId, column: 1 },
             ];
             break;
        }
        case 'product-showcase': {
            const parentId = `cols-${baseId}`;
             componentsToAdd = [
                { id: `title-${baseId}`, type: 'Title', props: { text: 'Nossos Produtos', styles: { textAlign: 'center', marginBottom: '2rem' } }, order: 0, parentId: null, column: 0 },
                { id: parentId, type: 'Columns', props: { columnCount, styles: { gap: '1.5rem', alignItems: 'stretch' } }, order: 1, parentId: null, column: 0 },
             ];
              for(let i=0; i<columnCount; i++) {
                 componentsToAdd.push(
                    { id: `img-${baseId}-${i}`, type: 'Image', props: { src: `https://picsum.photos/400/400` }, order: 0, parentId, column: i },
                    { id: `subtitle-${baseId}-${i}`, type: 'Subtitle', props: { text: `Nome do Produto ${i+1}`, styles: { fontSize: '1.2rem', marginTop: '1rem' } }, order: 1, parentId, column: i },
                    { id: `para-${baseId}-${i}`, type: 'Paragraph', props: { text: `Breve descrição do produto.` }, order: 2, parentId, column: i },
                    { id: `price-old-${baseId}-${i}`, type: 'Paragraph', props: { text: `R$ 99,90`, styles: { textDecoration: 'line-through', color: '#9CA3AF' } }, order: 3, parentId, column: i },
                    { id: `price-new-${baseId}-${i}`, type: 'Paragraph', props: { text: `R$ 79,90`, styles: { fontWeight: 'bold', fontSize: '1.25rem' } }, order: 4, parentId, column: i },
                    { id: `btn-${baseId}-${i}`, type: 'Button', props: { text: 'Comprar', href: '#', align: 'left' }, order: 5, parentId, column: i },
                 );
             }
            break;
        }
        case 'simple-gallery': {
             const parentId = `cols-${baseId}`;
             componentsToAdd = [
                { id: parentId, type: 'Columns', props: { columnCount: 3, styles: { gap: '1rem' } }, order: 0, parentId: null, column: 0 },
             ];
             for(let i=0; i<3; i++) {
                 componentsToAdd.push(
                    { id: `img-${baseId}-${i}`, type: 'Image', props: { src: `https://picsum.photos/400/300` }, order: 0, parentId, column: i },
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
                    { id: `img-${baseId}-${i}`, type: 'Image', props: { src: `https://picsum.photos/400/250` }, order: 0, parentId, column: i },
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
            <Tabs defaultValue={"blocos"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="blocos">
                    Blocos Prontos
                </TabsTrigger>
                 <TabsTrigger value="componentes">
                    Componentes Individuais
                </TabsTrigger>
            </TabsList>
            <TabsContent value="blocos">
                <Tabs defaultValue={blockList[0].category} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        {blockList.map((group) => (
                            <TabsTrigger key={group.category} value={group.category}>{group.category}</TabsTrigger>
                        ))}
                    </TabsList>
                    {blockList.map((group) => (
                        <TabsContent key={group.category} value={group.category}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                {group.blocks.map(block => {
                                    if (block.type === 'product-showcase') {
                                        return <ProductShowcaseConfigDialog key={block.type} onConfirm={(count) => handleBlockClick(block.type, count)} />
                                    }
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
                    ))}
                </Tabs>
            </TabsContent>
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
            </Tabs>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}
