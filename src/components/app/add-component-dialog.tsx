
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
  View,
  Mail,
  HelpCircle,
  UploadCloud,
  ImageIcon,
  PlusCircle,
  CalendarClock,
  Layers3,
  Calendar,
} from "lucide-react";
import type { ComponentType, PageComponent } from "@/lib/types";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type BlockType = 
    | 'product-showcase' 
    | 'simple-gallery' 
    | 'news-section' 
    | 'hero-background-image' 
    | 'hero-split-right' 
    | 'hero-split-left' 
    | 'hero-lead-capture' 
    | 'logo-carousel'
    | 'header-simple'
    | 'header-cta'
    | 'header-centered'
    | 'header-minimal'
    | 'footer-simple'
    | 'footer-columns'
    | 'footer-newsletter'
    | 'faq-section';

const componentList: {
  category: string;
  components: { name: ComponentType; icon: LucideIcon; enabled: boolean }[];
}[] = [
  {
    category: "Estrutura",
    components: [
      { name: "Div", icon: Layers3, enabled: true },
      { name: "Columns", icon: Columns, enabled: true },
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
      { name: "Button", icon: MousePointerClick, enabled: true },
      { name: "DownloadButton", icon: Download, enabled: true },
      { name: "Carousel", icon: View, enabled: true },
      { name: "Countdown", icon: Timer, enabled: true },
      { name: "Divider", icon: Minus, enabled: true },
      { name: "Spacer", icon: StretchHorizontal, enabled: true },
      { name: "SocialIcons", icon: Share2, enabled: true },
      { name: "WhatsApp", icon: Zap, enabled: true },
      { name: "FloatingImage", icon: ImageIcon, enabled: true },
      { name: "FloatingButton", icon: PlusCircle, enabled: true },
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
      { name: "FTPUpload", icon: UploadCloud, enabled: true },
      { name: "DataExtensionUpload", icon: UploadCloud, enabled: true },
      { name: "Calendly", icon: CalendarClock, enabled: true },
      { name: "AddToCalendar", icon: Calendar, enabled: true },
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
        category: 'Cabeçalhos',
        blocks: [
            { name: "Simples (Logo + Menu)", description: "Layout clássico com logo à esquerda e menu de navegação à direita.", type: 'header-simple', icon: AlignStartVertical },
            { name: "Com CTA (Logo + Menu + Botão)", description: "Adiciona um botão de call-to-action ao lado do menu de navegação.", type: 'header-cta', icon: AlignStartVertical },
            { name: "Centralizado", description: "Um layout moderno com o logo no centro e o menu de navegação logo abaixo.", type: 'header-centered', icon: AlignStartVertical },
            { name: "Minimalista (Logo + Botão)", description: "Ideal para landing pages, com apenas o logo e um botão de ação.", type: 'header-minimal', icon: AlignStartVertical },
        ]
    },
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
             { name: "Galeria Simples", description: "Layout em colunas com imagens e legendas.", type: "simple-gallery", icon: GalleryThumbnails },
             { name: "Notícias Recentes", description: "Grade para 3 artigos com imagem, título e resumo.", type: "news-section", icon: Newspaper },
             { name: "Carrossel de Logos", description: "Exiba os logos de clientes ou parceiros em um carrossel infinito.", type: "logo-carousel", icon: View },
             { name: "Seção de FAQ", description: "Um layout com título e um acordeão para perguntas e respostas.", type: "faq-section", icon: HelpCircle },
        ]
    },
    {
        category: 'Rodapés',
        blocks: [
            { name: "Rodapé Simples", description: "Logo, texto de copyright e ícones de redes sociais centralizados.", type: "footer-simple", icon: AlignEndVertical },
            { name: "Rodapé Informativo", description: "Layout com 4 colunas para logo, links, redes sociais e contato.", type: "footer-columns", icon: AlignEndVertical },
            { name: "Rodapé com Newsletter", description: "Capture e-mails para sua newsletter diretamente no rodapé.", type: "footer-newsletter", icon: Mail },
        ]
    }
];

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

function GalleryConfigDialog({ onConfirm }: { onConfirm: (columnCount: number) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [columnCount, setColumnCount] = useState<string>("3");

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
                            <GalleryThumbnails className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-base">Galeria Simples</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Layout em colunas com imagens e legendas.</p>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configurar Galeria de Imagens</DialogTitle>
                    <DialogDescription>
                        Escolha quantas imagens você quer exibir na galeria.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label>Número de imagens</Label>
                    <RadioGroup
                        value={columnCount}
                        onValueChange={setColumnCount}
                        className="mt-2 grid grid-cols-5 gap-4"
                    >
                        {[2, 3, 4, 5, 6].map(count => (
                             <Label
                                key={count}
                                htmlFor={`gallery-${count}`}
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                                <RadioGroupItem value={String(count)} id={`gallery-${count}`} className="sr-only" />
                                <span className="text-2xl font-bold">{count}</span>
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
        case 'header-simple':
            componentsToAdd = [{ id: `header-${baseId}`, type: 'Header', props: { layout: 'logo-left-menu-right', links: [{id: '1', text: 'Home', url: '#'}, {id: '2', text: 'Sobre', url: '#'}] }, order: 0, parentId: null, column: 0 }];
            break;
        case 'header-cta':
            componentsToAdd = [{ id: `header-${baseId}`, type: 'Header', props: { layout: 'logo-left-menu-button-right', links: [{id: '1', text: 'Recursos', url: '#'}, {id: '2', text: 'Preços', url: '#'}], buttonText: 'Comece Agora', buttonUrl: '#' }, order: 0, parentId: null, column: 0 }];
            break;
        case 'header-centered':
            componentsToAdd = [{ id: `header-${baseId}`, type: 'Header', props: { layout: 'logo-center-menu-below', links: [{id: '1', text: 'Portfólio', url: '#'}, {id: '2', text: 'Blog', url: '#'}, {id: '3', text: 'Contato', url: '#'}] }, order: 0, parentId: null, column: 0 }];
            break;
        case 'header-minimal':
            componentsToAdd = [{ id: `header-${baseId}`, type: 'Header', props: { layout: 'logo-left-button-right', buttonText: 'Fale Conosco', buttonUrl: '#' }, order: 0, parentId: null, column: 0 }];
            break;
        case 'hero-background-image':
            componentsToAdd = [
                {
                    id: `div-hero-bg-${baseId}`,
                    type: 'Columns',
                    props: {
                        columnCount: 1,
                        styles: {
                            isFullWidth: true,
                            backgroundType: 'image',
                            backgroundImageUrl: 'https://picsum.photos/1200/800',
                            paddingTop: '8rem',
                            paddingBottom: '8rem',
                            paddingLeft: '2rem',
                            paddingRight: '2rem',
                        }
                    },
                    order: 0, parentId: null, column: 0
                },
                { id: `title-${baseId}`, type: 'Title', props: { text: 'Título Impactante Sobre a Imagem', styles: { fontSize: '3rem', color: '#FFFFFF', textAlign: 'center' } }, order: 0, parentId: `div-hero-bg-${baseId}`, column: 0 },
                { id: `para-${baseId}`, type: 'Paragraph', props: { text: 'Subtítulo que descreve a proposta de valor de forma clara e concisa.', styles: { fontSize: '1.2rem', maxWidth: '600px', margin: '1rem auto', color: '#FFFFFF', textAlign: 'center' } }, order: 1, parentId: `div-hero-bg-${baseId}`, column: 0 },
                { id: `btn-${baseId}`, type: 'Button', props: { text: 'Chamada para Ação', href: '#' }, order: 2, parentId: `div-hero-bg-${baseId}`, column: 0 },
            ];
            break;
        case 'hero-split-right':
        case 'hero-split-left': {
            const isImageRight = type === 'hero-split-right';
            const textColumn = isImageRight ? 0 : 1;
            const imageColumn = isImageRight ? 1 : 0;
            const parentId = `hero-split-${baseId}`;
            componentsToAdd = [
                 { id: parentId, type: 'Columns', props: { columnCount: 2, styles: { alignItems: 'center', gap: '3rem', paddingTop: '4rem', paddingBottom: '4rem', paddingLeft: '2rem', paddingRight: '2rem' } }, order: 0, parentId: null, column: 0 },
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
                 { id: parentId, type: 'Columns', props: { columnCount: 2, styles: { alignItems: 'center', gap: '3rem', paddingTop: '4rem', paddingBottom: '4rem', paddingLeft: '2rem', paddingRight: '2rem' } }, order: 0, parentId: null, column: 0 },
                 { id: `title-${baseId}`, type: 'Title', props: { text: 'Receba a Oferta Exclusiva', styles: { fontSize: '2.5rem' } }, order: 0, parentId, column: 0 },
                 { id: `para-${baseId}`, type: 'Paragraph', props: { text: 'Deixe seu e-mail e seja o primeiro a saber sobre nossas novidades e promoções imperdíveis.' }, order: 1, parentId, column: 0 },
                 { id: `form-${baseId}`, type: 'Form', props: { fields: { email: {enabled: true, conditional: null, prefillFromUrl: false } }, placeholders: { email: 'seu@email.com' }, buttonText: 'Enviar', submission: { message: 'Obrigado!' }, formAlign: 'left', buttonAlign: 'left' }, order: 2, parentId, column: 0 },
                 { id: `img-${baseId}`, type: 'Image', props: { src: 'https://picsum.photos/600/500' }, order: 0, parentId, column: 1 },
             ];
             break;
        }
        case 'product-showcase': {
            const sectionContainerId = `products-cols-${baseId}`;
             componentsToAdd = [
                { id: `title-${baseId}`, type: 'Title', props: { text: 'Nossos Produtos', styles: { textAlign: 'center', marginBottom: '2rem' } }, order: 0, parentId: null, column: 0 },
                { id: sectionContainerId, type: 'Columns', props: { columnCount, styles: { gap: '1.5rem', alignItems: 'stretch' } }, order: 1, parentId: null, column: 0 },
             ];
              for(let i=0; i<columnCount; i++) {
                 componentsToAdd.push(
                    { id: `img-${baseId}-${i}`, type: 'Image', props: { src: `https://picsum.photos/400/400` }, order: 0, parentId: sectionContainerId, column: i },
                    { id: `subtitle-${baseId}-${i}`, type: 'Subtitle', props: { text: `Nome do Produto ${i+1}`, styles: { fontSize: '1.2rem', marginTop: '1rem' } }, order: 1, parentId: sectionContainerId, column: i },
                    { id: `para-${baseId}-${i}`, type: 'Paragraph', props: { text: `Breve descrição do produto.` }, order: 2, parentId: sectionContainerId, column: i },
                    { id: `price-old-${baseId}-${i}`, type: 'Paragraph', props: { text: `R$ 99,90`, styles: { textDecoration: 'line-through', color: '#9CA3AF' } }, order: 3, parentId: sectionContainerId, column: i },
                    { id: `price-new-${baseId}-${i}`, type: 'Paragraph', props: { text: `R$ 79,90`, styles: { fontWeight: 'bold', fontSize: '1.25rem' } }, order: 4, parentId: sectionContainerId, column: i },
                    { id: `btn-${baseId}-${i}`, type: 'Button', props: { text: 'Comprar', href: '#', align: 'left' }, order: 5, parentId: sectionContainerId, column: i },
                 );
             }
            break;
        }
        case 'simple-gallery': {
             const parentId = `cols-${baseId}`;
             componentsToAdd = [
                { id: parentId, type: 'Columns', props: { columnCount, styles: { gap: '1rem' } }, order: 0, parentId: null, column: 0 },
             ];
             for(let i=0; i<columnCount; i++) {
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
        case 'logo-carousel': {
            componentsToAdd = [
                { id: `title-${baseId}`, type: 'Title', props: { text: 'Nossos Clientes', styles: { textAlign: 'center', marginBottom: '2rem' } }, order: 0, parentId: null, column: 0 },
                {
                    id: `carousel-${baseId}`,
                    type: 'Carousel',
                    props: {
                        carouselType: 'logo',
                        images: [
                            { id: '1', url: 'https://logo.clearbit.com/google.com', alt: 'Google' },
                            { id: '2', url: 'https://logo.clearbit.com/spotify.com', alt: 'Spotify' },
                            { id: '3', url: 'https://logo.clearbit.com/netflix.com', alt: 'Netflix' },
                            { id: '4', url: 'https://logo.clearbit.com/airbnb.com', alt: 'Airbnb' },
                            { id: '5', url: 'https://logo.clearbit.com/microsoft.com', alt: 'Microsoft' },
                            { id: '6', url: 'https://logo.clearbit.com/amazon.com', alt: 'Amazon' },
                        ],
                        showArrows: false,
                        showDots: false,
                        options: {
                            loop: true,
                            align: 'start',
                            duration: 50,
                            slidesPerView: 5,
                            autoplay: {
                                delay: 0,
                                stopOnInteraction: false,
                                stopOnMouseEnter: true,
                            },
                        },
                    },
                    order: 1,
                    parentId: null,
                    column: 0,
                }
            ]
            break;
        }
        case 'footer-simple':
            componentsToAdd = [
                {
                    id: `cols-footer-${baseId}`,
                    type: 'Columns',
                    props: { columnCount: 1, styles: { paddingTop: '2rem', paddingBottom: '2rem', textAlign: 'center' } },
                    order: 0, parentId: null, column: 0
                },
                { id: `img-footer-${baseId}`, type: 'Image', props: { src: 'https://placehold.co/150x50.png', alt: 'Logo da Empresa' }, order: 0, parentId: `cols-footer-${baseId}`, column: 0 },
                { id: `para-footer-${baseId}`, type: 'Paragraph', props: { text: `© ${new Date().getFullYear()} Sua Empresa. Todos os direitos reservados.`, styles: { fontSize: '0.9rem', marginTop: '1rem' } }, order: 1, parentId: `cols-footer-${baseId}`, column: 0 },
                { id: `social-footer-${baseId}`, type: 'SocialIcons', props: { links: { facebook: '#', instagram: '#', twitter: '#' } }, order: 2, parentId: `cols-footer-${baseId}`, column: 0 },
            ];
            break;
        case 'footer-columns': {
            const parentId = `cols-footer-${baseId}`;
            componentsToAdd = [
                { id: parentId, type: 'Columns', props: { columnCount: 4, styles: { paddingTop: '3rem', paddingBottom: '3rem', gap: '2rem' } }, order: 0, parentId: null, column: 0 },
                // Coluna 1
                { id: `img-footer-${baseId}`, type: 'Image', props: { src: 'https://placehold.co/150x50.png', alt: 'Logo' }, order: 0, parentId, column: 0 },
                { id: `para-footer-${baseId}`, type: 'Paragraph', props: { text: 'Sua missão em poucas palavras. Conectando pessoas e criando valor.', styles: { fontSize: '0.9rem', marginTop: '1rem' } }, order: 1, parentId, column: 0 },
                // Coluna 2
                { id: `sub1-footer-${baseId}`, type: 'Subtitle', props: { text: 'Empresa', styles: { fontSize: '1.1rem' } }, order: 0, parentId, column: 1 },
                { id: `btn1-footer-${baseId}`, type: 'Button', props: { text: 'Sobre Nós', href: '#', align: 'left', variant: 'link' }, order: 1, parentId, column: 1 },
                { id: `btn2-footer-${baseId}`, type: 'Button', props: { text: 'Carreiras', href: '#', align: 'left', variant: 'link' }, order: 2, parentId, column: 1 },
                // Coluna 3
                { id: `sub2-footer-${baseId}`, type: 'Subtitle', props: { text: 'Recursos', styles: { fontSize: '1.1rem' } }, order: 0, parentId, column: 2 },
                { id: `btn3-footer-${baseId}`, type: 'Button', props: { text: 'Blog', href: '#', align: 'left', variant: 'link' }, order: 1, parentId, column: 2 },
                { id: `btn4-footer-${baseId}`, type: 'Button', props: { text: 'Suporte', href: '#', align: 'left', variant: 'link' }, order: 2, parentId, column: 2 },
                // Coluna 4
                { id: `sub3-footer-${baseId}`, type: 'Subtitle', props: { text: 'Siga-nos', styles: { fontSize: '1.1rem' } }, order: 0, parentId, column: 3 },
                { id: `social-footer-${baseId}`, type: 'SocialIcons', props: { links: { facebook: '#', instagram: '#', twitter: '#' }, styles: { align: 'left' } }, order: 1, parentId, column: 3 },
                // Copyright
                { id: `divider-footer-${baseId}`, type: 'Divider', props: { margin: 20 }, order: 1, parentId: null, column: 0 },
                { id: `copy-footer-${baseId}`, type: 'Paragraph', props: { text: `© ${new Date().getFullYear()} Sua Empresa.`, styles: { textAlign: 'center', fontSize: '0.8rem' } }, order: 2, parentId: null, column: 0 },
            ];
            break;
        }
        case 'footer-newsletter': {
             componentsToAdd = [
                {
                    id: `cols-footer-${baseId}`,
                    type: 'Columns',
                    props: { columnCount: 1, styles: { paddingTop: '3rem', paddingBottom: '3rem', textAlign: 'center', backgroundColor: '#f9fafb' } },
                    order: 0, parentId: null, column: 0
                },
                { id: `title-footer-${baseId}`, type: 'Title', props: { text: 'Inscreva-se na nossa Newsletter' }, order: 0, parentId: `cols-footer-${baseId}`, column: 0 },
                { id: `para-footer-${baseId}`, type: 'Paragraph', props: { text: 'Fique por dentro das últimas novidades e ofertas especiais.' }, order: 1, parentId: `cols-footer-${baseId}`, column: 0 },
                { id: `form-footer-${baseId}`, type: 'Form', props: { fields: { email: { enabled: true } }, buttonText: 'Inscrever', formAlign: 'center', buttonAlign: 'center' }, order: 2, parentId: `cols-footer-${baseId}`, column: 0 },
                { id: `copy-footer-${baseId}`, type: 'Paragraph', props: { text: `© ${new Date().getFullYear()} Sua Empresa.`, styles: { textAlign: 'center', fontSize: '0.8rem', marginTop: '2rem' } }, order: 3, parentId: `cols-footer-${baseId}`, column: 0 },
             ];
             break;
        }
        case 'faq-section': {
            componentsToAdd = [
                { id: `title-${baseId}`, type: 'Title', props: { text: 'Perguntas Frequentes', styles: { textAlign: 'center', marginBottom: '2rem' } }, order: 0, parentId: null, column: 0 },
                {
                    id: `accordion-${baseId}`,
                    type: 'Accordion',
                    props: {
                        items: [
                            { id: 'faq1', title: 'Qual é a política de devolução?', content: 'Nossa política de devolução permite que você devolva qualquer item dentro de 30 dias após a compra para um reembolso total.' },
                            { id: 'faq2', title: 'Como acompanho meu pedido?', content: 'Você pode acompanhar seu pedido usando o link de rastreamento enviado para o seu e-mail após a confirmação da compra.' },
                            { id: 'faq3', title: 'Vocês oferecem frete internacional?', content: 'Sim, oferecemos frete para a maioria dos países. Os custos e prazos de entrega variam de acordo com o destino.' },
                            { id: 'faq4', title: 'Como posso entrar em contato com o suporte?', content: 'Você pode entrar em contato com nosso suporte ao cliente através do e-mail suporte@exemplo.com ou pelo telefone (XX) XXXX-XXXX.' },
                        ]
                    },
                    order: 1,
                    parentId: null,
                    column: 0
                },
                { id: `spacer-${baseId}`, type: 'Spacer', props: { height: 40 }, order: 2, parentId: null, column: 0 }
            ];
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
            <Tabs defaultValue="blocos" className="w-full">
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
                    <TabsList className="grid w-full grid-cols-4">
                        {blockList.map((group) => (
                            <TabsTrigger key={group.category} value={group.category}>{group.category}</TabsTrigger>
                        ))}
                    </TabsList>
                    {blockList.map((group) => (
                        <TabsContent key={group.category} value={group.category}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 max-h-[50vh] overflow-y-auto">
                                {group.blocks.map(block => {
                                    if (block.type === 'product-showcase') {
                                        return <ProductShowcaseConfigDialog key={block.type} onConfirm={(count) => handleBlockClick(block.type, count)} />
                                    }
                                    if (block.type === 'simple-gallery') {
                                        return <GalleryConfigDialog key={block.type} onConfirm={(count) => handleBlockClick(block.type, count)} />
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
