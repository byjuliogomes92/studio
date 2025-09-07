
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getCommunityAssets, copyCommunityAssetToWorkspace } from "@/lib/firestore";
import type { CommunityAsset, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Loader2, Users, Search, Copy, Heart, Library, LayoutTemplate, Star } from "lucide-react";
import { Logo, LogoIcon } from "@/components/icons";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


function CommunityAssetCard({ asset }: { asset: CommunityAsset }) {
    const { user, activeWorkspace, projects } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isCopying, setIsCopying] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [newPageName, setNewPageName] = useState(asset.name);

    const handleCopy = async () => {
        if (!user || !activeWorkspace || !selectedProjectId) {
            toast({ variant: "destructive", title: "Erro", description: "Selecione um projeto para copiar o template." });
            return;
        }
        setIsCopying(true);
        try {
            const newPageId = await copyCommunityAssetToWorkspace(asset.id, newPageName, selectedProjectId, activeWorkspace.id, user.uid);
            toast({ title: "Template Copiado!", description: `"${newPageName}" foi adicionado ao seu projeto.` });
            setIsDialogOpen(false);
            router.push(`/editor/${newPageId}`);
        } catch (error: any) {
            console.error("Failed to copy community asset:", error);
            toast({ variant: "destructive", title: "Erro ao Copiar", description: error.message });
        } finally {
            setIsCopying(false);
        }
    };
    
    return (
        <Card className="flex flex-col overflow-hidden group">
            <CardHeader className="p-0">
                <div className="aspect-video bg-muted relative">
                    <Image src={asset.previewImageUrl || "https://picsum.photos/400/225"} alt={`Preview of ${asset.name}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                     <div className="absolute inset-0 bg-black/20"></div>
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Heart className="h-4 w-4"/>
                        <span>{asset.likes || 0}</span>
                    </div>
                </div>
                <CardDescription className="mt-1 text-sm line-clamp-2">{asset.description}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 border-t flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={asset.authorAvatarUrl} alt={asset.authorName} />
                        <AvatarFallback>{asset.authorName?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">{asset.authorName}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(asset.createdAt.toDate(), { addSuffix: true, locale: ptBR })}
                        </p>
                    </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Copiar para seu Workspace</DialogTitle>
                            <DialogDescription>
                                Dê um nome para a nova página e escolha em qual projeto ela será salva.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-page-name">Nome da Nova Página</Label>
                                <Input id="new-page-name" value={newPageName} onChange={(e) => setNewPageName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="target-project">Projeto de Destino</Label>
                                <Select onValueChange={setSelectedProjectId}>
                                    <SelectTrigger id="target-project">
                                        <SelectValue placeholder="Selecione um projeto..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map((p: Project) => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleCopy} disabled={isCopying || !selectedProjectId}>
                                {isCopying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Copiar e Abrir
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    );
}


export default function CommunityPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [assets, setAssets] = useState<CommunityAsset[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchAssets = async () => {
            setIsLoading(true);
            try {
                // For now, fetching without filters
                const communityAssets = await getCommunityAssets({});
                setAssets(communityAssets);
            } catch (error) {
                console.error("Failed to fetch community assets:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssets();
    }, [user, authLoading, router]);

    return (
        <div className="min-h-screen bg-muted/40">
            <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 font-semibold text-lg">
                        <LogoIcon className="h-6 w-6 text-primary" />
                        <h1>Comunidade</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => router.push('/')}>
                        <Home className="mr-2 h-4 w-4" />
                        Voltar aos Projetos
                    </Button>
                </div>
            </header>

            <main className="p-6 space-y-8">
                <div className="relative rounded-xl overflow-hidden h-64 flex items-center justify-center text-center p-6 bg-gray-900">
                    <Image
                        src="https://picsum.photos/1200/400"
                        alt="Banner da Comunidade"
                        fill
                        className="object-cover opacity-30"
                        data-ai-hint="abstract geometric"
                    />
                    <div className="relative z-10 text-white">
                        <h1 className="text-4xl font-bold tracking-tight">Explore a Criatividade da Comunidade</h1>
                        <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
                            Descubra templates e blocos prontos, criados por outros usuários como você. Copie com um clique e acelere seu trabalho.
                        </p>
                    </div>
                </div>
                
                <Tabs defaultValue="templates" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="templates"><LayoutTemplate className="w-4 h-4 mr-2"/>Templates</TabsTrigger>
                        <TabsTrigger value="blocks" disabled><Library className="w-4 h-4 mr-2"/>Blocos</TabsTrigger>
                        <TabsTrigger value="themes" disabled><Users className="w-4 h-4 mr-2"/>Temas</TabsTrigger>
                        <TabsTrigger value="most-voted" disabled><Star className="w-4 h-4 mr-2"/>Mais Votados</TabsTrigger>
                    </TabsList>

                    <TabsContent value="templates" className="mt-6">
                        <div className="flex justify-center mb-8">
                            <div className="relative w-full max-w-lg">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="Buscar templates de e-commerce, páginas de evento..." className="pl-10 h-12 text-base" />
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center p-16">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            </div>
                        ) : assets.length === 0 ? (
                            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                <Library size={48} className="mx-auto text-muted-foreground" />
                                <h2 className="mt-4 text-xl font-semibold">A Comunidade está Vazia por Enquanto</h2>
                                <p className="mt-2 text-muted-foreground">Seja o primeiro a compartilhar um template! (Funcionalidade em breve)</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {assets.map(asset => (
                                    <CommunityAssetCard key={asset.id} asset={asset} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                     <TabsContent value="blocks" className="mt-6">
                         <div className="text-center py-16 border-2 border-dashed rounded-lg">
                             <h2 className="text-xl font-semibold">Em breve!</h2>
                             <p className="text-muted-foreground mt-2">Logo você poderá explorar e usar blocos reutilizáveis.</p>
                         </div>
                     </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
