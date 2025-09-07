
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getBrandsForUser, addBrand, updateBrand, deleteBrand } from "@/lib/firestore";
import type { Brand, FtpConfig, BitlyConfig } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Loader2, Palette, Plus, Trash2, Edit, Server, Eye, EyeOff, Link2, Sun, Moon, Type, Square, Circle, Hand, Image as ImageIcon, Text, Search, HelpCircle, Library, Upload } from "lucide-react";
import { Logo, LogoIcon } from "@/components/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { MediaLibraryDialog } from "@/components/app/media-library-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const googleFonts = ["Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", "Source Sans Pro", "Raleway", "Poppins", "Nunito", "Merriweather"];

const initialBrandState: Omit<Brand, "id" | "createdAt"> = {
  workspaceId: '',
  name: "",
  description: "",
  logos: {
    horizontalLight: "",
    horizontalDark: "",
    iconLight: "",
    iconDark: "",
    favicon: ""
  },
  typography: {
    fontFamilyHeadings: "Poppins",
    fontFamilyBody: "Roboto"
  },
  colors: {
    theme: "light",
    light: {
      background: "#FFFFFF",
      foreground: "#020817",
      primary: "#3b82f6",
      primaryHover: "#2563eb",
      primaryForeground: "#FFFFFF"
    },
    dark: {
      background: "#020817",
      foreground: "#FFFFFF",
      primary: "#3b82f6",
      primaryHover: "#60a5fa",
      primaryForeground: "#FFFFFF"
    }
  },
  components: {
    button: { borderRadius: "0.5rem" },
    input: {
      borderRadius: "0.5rem",
      backgroundColor: "#FFFFFF",
      borderColor: "#e5e7eb",
      textColor: "#020817"
    }
  },
  integrations: {
    ftp: { host: "", user: "", encryptedPassword: "" },
    bitly: { encryptedAccessToken: "" },
  },
};

function FontUploadInput({ label, fontName, fontUrl, onNameChange, onUrlSelect }: { label: string; fontName?: string; fontUrl?: string; onNameChange: (name: string) => void; onUrlSelect: (url: string) => void; }) {
    return (
        <div className="space-y-4 p-4 border rounded-md bg-muted/40">
            <h5 className="font-medium">{label}</h5>
            <div className="space-y-2">
                <Label>Nome da Fonte (CSS)</Label>
                <Input value={fontName || ''} onChange={(e) => onNameChange(e.target.value)} placeholder="Ex: MinhaFonteRegular" />
            </div>
             <div className="space-y-2">
                <Label>URL do Arquivo (.woff, .woff2)</Label>
                <div className="flex items-center gap-2">
                    <Input value={fontUrl || ''} onChange={(e) => onUrlSelect(e.target.value)} />
                    <MediaLibraryDialog onSelectImage={onUrlSelect}>
                        <Button variant="outline" size="icon">
                            <Upload className="h-4 w-4" />
                        </Button>
                    </MediaLibraryDialog>
                </div>
            </div>
        </div>
    );
}

function ImageUrlInput({ label, value, onSelect, tooltip }: { label: string; value: string; onSelect: (url: string) => void, tooltip: string }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1.5">
                <Label>{label}</Label>
                <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>{tooltip}</p></TooltipContent>
                </Tooltip>
            </div>
            <div className="flex items-center gap-2">
                <Input value={value} onChange={(e) => onSelect(e.target.value)} />
                <MediaLibraryDialog onSelectImage={onSelect}>
                    <Button variant="outline" size="icon">
                        <Library className="h-4 w-4" />
                    </Button>
                </MediaLibraryDialog>
            </div>
        </div>
    );
}

function ColorInput({ label, value, onChange, tooltip }: { label: string, value: string, onChange: (value: string) => void, tooltip: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5">
                <Label className="text-xs">{label}</Label>
                 <Tooltip>
                    <TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground"/></TooltipTrigger>
                    <TooltipContent><p>{tooltip}</p></TooltipContent>
                </Tooltip>
            </div>
            <div className="relative flex items-center">
                <Input 
                    type="text" 
                    value={value} 
                    onChange={e => onChange(e.target.value)} 
                    className="pl-10"
                />
                <div className="absolute left-1.5 h-7 w-7 rounded-md border" style={{ backgroundColor: value }}>
                     <Input 
                        type="color" 
                        value={value} 
                        onChange={e => onChange(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
}

export default function BrandsPage() {
  const router = useRouter();
  const { user, loading: authLoading, activeWorkspace } = useAuth();
  const { toast } = useToast();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState<Partial<Brand> | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showBitlyToken, setShowBitlyToken] = useState(false);
  const [ftpPassword, setFtpPassword] = useState("");
  const [bitlyToken, setBitlyToken] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!activeWorkspace) {
        setIsLoading(false);
        return;
    };

    const fetchBrands = async () => {
      setIsLoading(true);
      try {
        const userBrands = await getBrandsForUser(activeWorkspace.id);
        setBrands(userBrands);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar suas marcas." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, [user, authLoading, router, toast, activeWorkspace]);

  const openModal = (brand: Partial<Brand> | null = null) => {
    setFtpPassword("");
    setBitlyToken("");
    setCurrentBrand(brand ? { ...brand } : { ...initialBrandState });
    setIsModalOpen(true);
  };

  const handleSaveBrand = async () => {
    if (!user || !currentBrand || !currentBrand.name || !activeWorkspace) {
      toast({ variant: "destructive", title: "Erro", description: "O nome da marca e o workspace são obrigatórios." });
      return;
    }
    setIsSaving(true);
    try {
        const brandData = { ...currentBrand };
        
        // Ensure workspaceId is set for new brands
        if (!brandData.id) {
            brandData.workspaceId = activeWorkspace.id;
        }

        // Handle secrets
        if (ftpPassword) {
            if (!brandData.integrations) brandData.integrations = {};
            if (!brandData.integrations.ftp) brandData.integrations.ftp = {} as FtpConfig;
            (brandData.integrations.ftp as FtpConfig).password = ftpPassword;
        }
        if (bitlyToken) {
            if (!brandData.integrations) brandData.integrations = {};
            if (!brandData.integrations.bitly) brandData.integrations.bitly = {} as BitlyConfig;
            (brandData.integrations.bitly as BitlyConfig).accessToken = bitlyToken;
        }

        if (brandData.id) {
            // Update existing brand
            await updateBrand(brandData.id, brandData as Brand, user);
            setBrands(brands.map((b) => (b.id === brandData.id ? { ...b, ...brandData } as Brand : b)));
            toast({ title: "Marca atualizada!", description: `A marca "${brandData.name}" foi atualizada.` });
        } else {
            // Create new brand
            const newBrand = await addBrand(brandData as Omit<Brand, "id" | "createdAt">, user);
            setBrands([newBrand, ...brands]);
            toast({ title: "Marca criada!", description: `A marca "${brandData.name}" foi criada com sucesso.` });
        }
        setIsModalOpen(false);
    } catch (error) {
        console.error("Failed to save brand:", error);
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar a marca." });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteBrand = async (brandId: string) => {
    if (!user) return;
      try {
          await deleteBrand(brandId, user);
          setBrands(brands.filter(b => b.id !== brandId));
          toast({ title: "Marca excluída!"});
      } catch (error) {
          console.error("Failed to delete brand:", error);
          toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir a marca." });
      }
  }
  
  const handleBrandFieldChange = (fieldPath: string, value: any) => {
    setCurrentBrand(prev => {
      if (!prev) return null;
      const newBrand = { ...prev };
      let currentLevel: any = newBrand;
      const pathParts = fieldPath.split('.');
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!currentLevel[pathParts[i]]) {
          currentLevel[pathParts[i]] = {};
        }
        currentLevel = currentLevel[pathParts[i]];
      }
      currentLevel[pathParts[pathParts.length - 1]] = value;
      return newBrand;
    });
  };


  if (isLoading || authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <LogoIcon className="h-6 w-6 text-primary" />
            <h1>Kits de Marca</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => {
                const input = document.querySelector('.cmdk-input') as HTMLInputElement;
                input?.focus();
                document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'k', 'metaKey': true}));
            }}>
                <Search className="mr-2 h-4 w-4"/>
                Buscar...
                <kbd className="pointer-events-none ml-4 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
             </Button>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/')}>
                <Home className="mr-2 h-4 w-4" />
                Voltar aos Projetos
            </Button>
            <Button onClick={() => openModal()} disabled={!activeWorkspace}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Nova Marca
            </Button>
        </div>
      </header>

      <main className="p-6">
        {brands.length === 0 ? (
          <div className="text-center py-16">
            <Palette size={48} className="mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Nenhum Kit de Marca encontrado</h2>
            <p className="mt-2 text-muted-foreground">Crie seu primeiro kit para reutilizar logos, cores, fontes e integrações em suas páginas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <Card key={brand.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full border-2" style={{ backgroundColor: brand.colors.light.primary, borderColor: brand.colors.light.primaryHover }}></div>
                     {brand.name}
                  </CardTitle>
                  <CardDescription>{brand.description || 'Kit de identidade visual para a marca.'}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div className="flex justify-center items-center h-24 bg-muted rounded-md p-2">
                        <Image src={brand.logos.horizontalLight || 'https://placehold.co/150x50/FFFFFF/CCCCCC?text=Logo'} alt={`Logo de ${brand.name}`} width={150} height={50} className="max-h-full max-w-full object-contain" />
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-end gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente a marca "{brand.name}". As páginas existentes que usam esta marca não serão alteradas, mas perderão a capacidade de receber atualizações automáticas do kit.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteBrand(brand.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="outline" size="icon" onClick={() => openModal(brand)}><Edit className="h-4 w-4" /></Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{currentBrand?.id ? 'Editar Marca' : 'Criar Nova Marca'}</DialogTitle>
            <DialogDescription>
              Defina os elementos visuais e integrações da sua marca.
            </DialogDescription>
          </DialogHeader>
          {currentBrand && (
            <TooltipProvider>
            <Tabs defaultValue="visual" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="visual"><Palette className="mr-2 h-4 w-4" />Identidade Visual</TabsTrigger>
                <TabsTrigger value="typography"><Type className="mr-2 h-4 w-4" />Tipografia</TabsTrigger>
                <TabsTrigger value="components"><Hand className="mr-2 h-4 w-4" />Componentes</TabsTrigger>
                <TabsTrigger value="integrations"><Server className="mr-2 h-4 w-4" />Integrações</TabsTrigger>
              </TabsList>

              <TabsContent value="visual" className="py-4 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="brand-name">Nome da Marca</Label>
                    <Input id="brand-name" value={currentBrand.name || ''} onChange={(e) => handleBrandFieldChange('name', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="brand-description">Descrição da Marca (Contexto para IA)</Label>
                    <Textarea 
                      id="brand-description"
                      value={currentBrand.description || ''} 
                      onChange={(e) => handleBrandFieldChange('description', e.target.value)}
                      placeholder="Descreva o tom de voz, público-alvo, produtos principais e objetivos da marca. Quanto mais detalhes, melhor a IA irá gerar conteúdo."
                      rows={4}
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Logos</h4>
                        <ImageUrlInput
                            label="Logo Horizontal (Fundo Claro)"
                            value={currentBrand.logos?.horizontalLight || ''}
                            onSelect={(url) => handleBrandFieldChange('logos.horizontalLight', url)}
                            tooltip="Versão principal do logo para ser usada em fundos claros."
                        />
                        <ImageUrlInput
                            label="Logo Horizontal (Fundo Escuro)"
                            value={currentBrand.logos?.horizontalDark || ''}
                            onSelect={(url) => handleBrandFieldChange('logos.horizontalDark', url)}
                            tooltip="Versão do logo para ser usada em fundos escuros."
                        />
                         <ImageUrlInput
                            label="Ícone (Fundo Claro)"
                            value={currentBrand.logos?.iconLight || ''}
                            onSelect={(url) => handleBrandFieldChange('logos.iconLight', url)}
                            tooltip="Versão quadrada ou redonda do logo para avatares e espaços pequenos."
                        />
                        <ImageUrlInput
                            label="Ícone (Fundo Escuro)"
                            value={currentBrand.logos?.iconDark || ''}
                            onSelect={(url) => handleBrandFieldChange('logos.iconDark', url)}
                            tooltip="Versão do ícone para ser usada em fundos escuros."
                        />
                        <ImageUrlInput
                            label="Favicon"
                            value={currentBrand.logos?.favicon || ''}
                            onSelect={(url) => handleBrandFieldChange('logos.favicon', url)}
                            tooltip="Ícone que aparece na aba do navegador (geralmente .png ou .ico)."
                        />
                    </div>
                     <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Esquema de Cores</h4>
                         <div className="space-y-2">
                            <Label>Modo de Tema</Label>
                             <Select value={currentBrand.colors?.theme || 'light'} onValueChange={(value) => handleBrandFieldChange('colors.theme', value)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light"><div className="flex items-center gap-2"><Sun className="h-4 w-4"/> Apenas Claro</div></SelectItem>
                                    <SelectItem value="dark"><div className="flex items-center gap-2"><Moon className="h-4 w-4"/> Apenas Escuro</div></SelectItem>
                                    <SelectItem value="both"><div className="flex items-center gap-2"><Sun className="h-4 w-4"/><Moon className="h-4 w-4"/> Ambos</div></SelectItem>
                                </SelectContent>
                             </Select>
                        </div>
                        
                        {(currentBrand.colors?.theme === 'light' || currentBrand.colors?.theme === 'both') && (
                            <div className="p-4 border rounded-md space-y-3">
                                <h5 className="font-medium flex items-center gap-2"><Sun className="h-4 w-4"/> Tema Claro</h5>
                                <div className="grid grid-cols-2 gap-2">
                                  <ColorInput label="Primária" value={currentBrand.colors?.light?.primary || '#000000'} onChange={value => handleBrandFieldChange('colors.light.primary', value)} tooltip="Cor principal para botões e links." />
                                  <ColorInput label="Primária (Hover)" value={currentBrand.colors?.light?.primaryHover || '#000000'} onChange={value => handleBrandFieldChange('colors.light.primaryHover', value)} tooltip="Cor dos botões ao passar o mouse."/>
                                  <ColorInput label="Fundo" value={currentBrand.colors?.light?.background || '#FFFFFF'} onChange={value => handleBrandFieldChange('colors.light.background', value)} tooltip="Cor de fundo geral da página."/>
                                  <ColorInput label="Texto" value={currentBrand.colors?.light?.foreground || '#000000'} onChange={value => handleBrandFieldChange('colors.light.foreground', value)} tooltip="Cor principal do texto."/>
                                </div>
                            </div>
                        )}

                        {(currentBrand.colors?.theme === 'dark' || currentBrand.colors?.theme === 'both') && (
                            <div className="p-4 border rounded-md space-y-3">
                                <h5 className="font-medium flex items-center gap-2"><Moon className="h-4 w-4"/> Tema Escuro</h5>
                                <div className="grid grid-cols-2 gap-2">
                                  <ColorInput label="Primária" value={currentBrand.colors?.dark?.primary || '#FFFFFF'} onChange={value => handleBrandFieldChange('colors.dark.primary', value)} tooltip="Cor principal para botões e links."/>
                                  <ColorInput label="Primária (Hover)" value={currentBrand.colors?.dark?.primaryHover || '#FFFFFF'} onChange={value => handleBrandFieldChange('colors.dark.primaryHover', value)} tooltip="Cor dos botões ao passar o mouse."/>
                                  <ColorInput label="Fundo" value={currentBrand.colors?.dark?.background || '#000000'} onChange={value => handleBrandFieldChange('colors.dark.background', value)} tooltip="Cor de fundo geral da página."/>
                                  <ColorInput label="Texto" value={currentBrand.colors?.dark?.foreground || '#FFFFFF'} onChange={value => handleBrandFieldChange('colors.dark.foreground', value)} tooltip="Cor principal do texto."/>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
              </TabsContent>
              <TabsContent value="typography" className="py-4 space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-4">Fontes do Google</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="font-headings">Fonte para Títulos</Label>
                        <Select value={currentBrand.typography?.fontFamilyHeadings} onValueChange={(value) => handleBrandFieldChange('typography.fontFamilyHeadings', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {googleFonts.map(font => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="font-body">Fonte para Corpo do Texto</Label>
                        <Select value={currentBrand.typography?.fontFamilyBody} onValueChange={(value) => handleBrandFieldChange('typography.fontFamilyBody', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {googleFonts.map(font => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                  </div>
                </div>

                <div>
                   <h4 className="font-semibold text-lg mt-6 mb-4">Fontes Customizadas</h4>
                   <p className="text-sm text-muted-foreground mb-4">Faça o upload dos seus próprios arquivos de fonte (.woff ou .woff2). Isso substituirá a seleção de Fontes do Google.</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FontUploadInput
                          label="Fonte para Títulos"
                          fontName={currentBrand.typography?.customFontNameHeadings}
                          fontUrl={currentBrand.typography?.customFontUrlHeadings}
                          onNameChange={(name) => handleBrandFieldChange('typography.customFontNameHeadings', name)}
                          onUrlSelect={(url) => handleBrandFieldChange('typography.customFontUrlHeadings', url)}
                      />
                       <FontUploadInput
                          label="Fonte para Corpo do Texto"
                          fontName={currentBrand.typography?.customFontNameBody}
                          fontUrl={currentBrand.typography?.customFontUrlBody}
                          onNameChange={(name) => handleBrandFieldChange('typography.customFontNameBody', name)}
                          onUrlSelect={(url) => handleBrandFieldChange('typography.customFontUrlBody', url)}
                      />
                   </div>
                </div>
              </TabsContent>
               <TabsContent value="components" className="py-4 space-y-6">
                 <div className="space-y-4 p-4 border rounded-md">
                    <h4 className="font-semibold text-lg">Botões</h4>
                     <div className="space-y-2">
                        <Label>Cantos do Botão</Label>
                        <ToggleGroup type="single" value={currentBrand.components?.button?.borderRadius} onValueChange={(value) => value && handleBrandFieldChange('components.button.borderRadius', value)} className="w-full">
                            <ToggleGroupItem value="0.25rem" aria-label="Reto"><Square className="h-5 w-5"/></ToggleGroupItem>
                            <ToggleGroupItem value="0.5rem" aria-label="Curvado"><div className="w-5 h-5 border-2 border-current rounded-md"></div></ToggleGroupItem>
                            <ToggleGroupItem value="9999px" aria-label="Redondo"><Circle className="h-5 w-5"/></ToggleGroupItem>
                        </ToggleGroup>
                     </div>
                 </div>
                  <div className="space-y-4 p-4 border rounded-md">
                    <h4 className="font-semibold text-lg">Campos de Formulário</h4>
                     <div className="space-y-2">
                        <Label>Cantos do Input</Label>
                        <ToggleGroup type="single" value={currentBrand.components?.input?.borderRadius} onValueChange={(value) => value && handleBrandFieldChange('components.input.borderRadius', value)} className="w-full">
                            <ToggleGroupItem value="0.25rem" aria-label="Reto"><Square className="h-5 w-5"/></ToggleGroupItem>
                            <ToggleGroupItem value="0.5rem" aria-label="Curvado"><div className="w-5 h-5 border-2 border-current rounded-md"></div></ToggleGroupItem>
                            <ToggleGroupItem value="9999px" aria-label="Redondo"><Circle className="h-5 w-5"/></ToggleGroupItem>
                        </ToggleGroup>
                     </div>
                 </div>
              </TabsContent>
              <TabsContent value="integrations" className="py-4 space-y-6">
                <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                    <h4 className="font-semibold text-lg mb-2">Credenciais de FTP</h4>
                    <div className="space-y-2">
                        <Label htmlFor="ftp-host">Host</Label>
                        <Input id="ftp-host" value={currentBrand.integrations?.ftp?.host || ''} onChange={(e) => handleBrandFieldChange('integrations.ftp.host', e.target.value)} placeholder="Ex: ftp.s10.marketingcloudapps.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ftp-user">Usuário</Label>
                        <Input id="ftp-user" value={currentBrand.integrations?.ftp?.user || ''} onChange={(e) => handleBrandFieldChange('integrations.ftp.user', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ftp-password">Senha</Label>
                        <div className="relative">
                        <Input id="ftp-password" type={showPassword ? 'text' : 'password'} value={ftpPassword} onChange={(e) => setFtpPassword(e.target.value)} placeholder={currentBrand.id ? 'Deixe em branco para não alterar' : ''} />
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                    <h4 className="font-semibold text-lg mb-2 flex items-center gap-2"><Link2 className="h-5 w-5" />Integração com Bitly</h4>
                     <div className="space-y-2">
                        <Label htmlFor="bitly-token">Generic Access Token</Label>
                        <div className="relative">
                        <Input id="bitly-token" type={showBitlyToken ? 'text' : 'password'} value={bitlyToken} onChange={(e) => setBitlyToken(e.target.value)} placeholder={currentBrand.id ? 'Deixe em branco para não alterar' : ''} />
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowBitlyToken(!showBitlyToken)}>
                            {showBitlyToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        </div>
                    </div>
                </div>
              </TabsContent>
            </Tabs>
            </TooltipProvider>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveBrand} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
