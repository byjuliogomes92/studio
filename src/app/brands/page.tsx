
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getBrandsForUser, addBrand, updateBrand, deleteBrand } from "@/lib/firestore";
import type { Brand, FtpConfig } from "@/lib/types";
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
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Loader2, Palette, Plus, Trash2, Edit, Server, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const googleFonts = ["Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", "Source Sans Pro", "Raleway", "Poppins", "Nunito", "Merriweather"];

const initialBrandState: Omit<Brand, "id" | "workspaceId" | "createdAt"> = {
  name: "",
  logoUrl: "",
  faviconUrl: "",
  loaderImageUrl: "",
  themeColor: "#000000",
  themeColorHover: "#333333",
  fontFamily: "Roboto",
  ftpConfig: { host: "", user: "", encryptedPassword: "" }
};

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
  const [ftpPassword, setFtpPassword] = useState("");

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
      if (currentBrand.id) {
        // Update existing brand
        const { id, ...dataToUpdate } = currentBrand;
        // If the user entered a new password, include it for encryption. Otherwise, don't send it.
        if (ftpPassword) {
            (dataToUpdate.ftpConfig as FtpConfig).password = ftpPassword;
        }

        await updateBrand(id, dataToUpdate);
        setBrands(brands.map((b) => (b.id === id ? { ...b, ...dataToUpdate } : b)));
        toast({ title: "Marca atualizada!", description: `A marca "${currentBrand.name}" foi atualizada.` });
      } else {
        // Create new brand
        const newBrandData: Omit<Brand, "id" | "createdAt"> = {
            workspaceId: activeWorkspace.id,
            name: currentBrand.name,
            logoUrl: currentBrand.logoUrl || '',
            faviconUrl: currentBrand.faviconUrl || '',
            loaderImageUrl: currentBrand.loaderImageUrl || '',
            themeColor: currentBrand.themeColor || '#000000',
            themeColorHover: currentBrand.themeColorHover || '#333333',
            fontFamily: currentBrand.fontFamily || 'Roboto',
            ftpConfig: {
              host: currentBrand.ftpConfig?.host || '',
              user: currentBrand.ftpConfig?.user || '',
              password: ftpPassword,
            }
        };
        const newBrand = await addBrand(newBrandData);
        setBrands([newBrand, ...brands]);
        toast({ title: "Marca criada!", description: `A marca "${currentBrand.name}" foi criada com sucesso.` });
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
      try {
          await deleteBrand(brandId);
          setBrands(brands.filter(b => b.id !== brandId));
          toast({ title: "Marca excluída!"});
      } catch (error) {
          console.error("Failed to delete brand:", error);
          toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir a marca." });
      }
  }

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
            <Logo className="h-6 w-6 text-primary" />
            <h1>Kits de Marca</h1>
          </div>
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
                     <div className="w-8 h-8 rounded-full border-2" style={{ backgroundColor: brand.themeColor, borderColor: brand.themeColorHover }}></div>
                     {brand.name}
                  </CardTitle>
                  <CardDescription>Kit de identidade visual para a marca.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div className="flex justify-center items-center h-24 bg-muted rounded-md p-2">
                        <img src={brand.logoUrl || 'https://placehold.co/150x50/FFFFFF/CCCCCC?text=Logo'} alt={`Logo de ${brand.name}`} className="max-h-full max-w-full object-contain" />
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentBrand?.id ? 'Editar Marca' : 'Criar Nova Marca'}</DialogTitle>
            <DialogDescription>
              Defina os elementos visuais e integrações da sua marca.
            </DialogDescription>
          </DialogHeader>
          {currentBrand && (
            <Tabs defaultValue="visual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="visual"><Palette className="mr-2 h-4 w-4" />Identidade Visual</TabsTrigger>
                <TabsTrigger value="integrations"><Server className="mr-2 h-4 w-4" />Integrações</TabsTrigger>
              </TabsList>
              <TabsContent value="visual" className="py-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                        <Label htmlFor="brand-name">Nome da Marca</Label>
                        <Input id="brand-name" value={currentBrand.name || ''} onChange={(e) => setCurrentBrand({ ...currentBrand, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="font-family">Fonte Principal</Label>
                        <Select value={currentBrand.fontFamily} onValueChange={(value) => setCurrentBrand({ ...currentBrand, fontFamily: value })}>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="theme-color">Cor Principal</Label>
                                <Input id="theme-color" type="color" value={currentBrand.themeColor} onChange={(e) => setCurrentBrand({ ...currentBrand, themeColor: e.target.value })} className="p-1 h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="theme-color-hover">Cor Principal (Hover)</Label>
                                <Input id="theme-color-hover" type="color" value={currentBrand.themeColorHover} onChange={(e) => setCurrentBrand({ ...currentBrand, themeColorHover: e.target.value })} className="p-1 h-10"/>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                        <Label htmlFor="logo-url">URL do Logo</Label>
                        <Input id="logo-url" value={currentBrand.logoUrl} onChange={(e) => setCurrentBrand({ ...currentBrand, logoUrl: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="favicon-url">URL do Favicon</Label>
                        <Input id="favicon-url" value={currentBrand.faviconUrl} onChange={(e) => setCurrentBrand({ ...currentBrand, faviconUrl: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="loader-url">URL da Imagem de Carregamento</Label>
                        <Input id="loader-url" value={currentBrand.loaderImageUrl} onChange={(e) => setCurrentBrand({ ...currentBrand, loaderImageUrl: e.target.value })} />
                        </div>
                    </div>
                 </div>
              </TabsContent>
              <TabsContent value="integrations" className="py-4">
                <h4 className="font-semibold text-lg mb-4">Credenciais de FTP</h4>
                <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                  <div className="space-y-2">
                    <Label htmlFor="ftp-host">Host</Label>
                    <Input id="ftp-host" value={currentBrand.ftpConfig?.host || ''} onChange={(e) => setCurrentBrand({ ...currentBrand, ftpConfig: { ...currentBrand.ftpConfig, host: e.target.value } as FtpConfig })} placeholder="Ex: ftp.s10.marketingcloudapps.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ftp-user">Usuário</Label>
                    <Input id="ftp-user" value={currentBrand.ftpConfig?.user || ''} onChange={(e) => setCurrentBrand({ ...currentBrand, ftpConfig: { ...currentBrand.ftpConfig, user: e.target.value } as FtpConfig })} />
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
              </TabsContent>
            </Tabs>
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
