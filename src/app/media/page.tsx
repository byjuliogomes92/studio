
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { uploadMedia, getMediaForWorkspace, deleteMedia, updateMedia, STORAGE_LIMIT_BYTES } from '@/lib/firestore';
import type { MediaAsset } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Home, Loader2, Plus, Trash2, UploadCloud, Copy, Image as ImageIcon, Search, Tag, X, Edit, Save, Bell, CheckCheck, User, LogOut, Palette, Library, Database } from 'lucide-react';
import { Logo } from '@/components/icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

function formatBytes(bytes: number, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function TagEditor({ asset, onTagsUpdate }: { asset: MediaAsset; onTagsUpdate: (assetId: string, tags: string[]) => void; }) {
    const [tagInput, setTagInput] = useState('');
    const tags = asset.tags || [];

    const handleAddTag = () => {
        if (tagInput && !tags.includes(tagInput)) {
            const newTags = [...tags, tagInput.trim()];
            onTagsUpdate(asset.id, newTags);
        }
        setTagInput('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        onTagsUpdate(asset.id, newTags);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };
    
    return (
        <PopoverContent onClick={(e) => e.stopPropagation()} className="w-80">
            <div className="space-y-4">
                <p className="font-medium">Editar Tags</p>
                <div className="flex flex-wrap gap-1">
                    {tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                            {tag}
                            <button onClick={() => handleRemoveTag(tag)} className="ml-1.5 rounded-full hover:bg-destructive/20 p-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nova tag..."
                    />
                    <Button onClick={handleAddTag} size="sm">Adicionar</Button>
                </div>
            </div>
        </PopoverContent>
    )
}

function FileNameEditor({ asset, onNameUpdate }: { asset: MediaAsset; onNameUpdate: (assetId: string, newName: string) => void; }) {
    const [fileName, setFileName] = useState(asset.fileName);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!fileName.trim() || fileName.trim() === asset.fileName) return;
        setIsSaving(true);
        await onNameUpdate(asset.id, fileName.trim());
        setIsSaving(false);
    }
    
    return (
        <PopoverContent onClick={(e) => e.stopPropagation()} className="w-80">
            <div className="space-y-4">
                <p className="font-medium">Editar Nome do Arquivo</p>
                <div className="space-y-2">
                  <Label htmlFor={`filename-${asset.id}`} className="sr-only">Nome do Arquivo</Label>
                  <Input
                    id={`filename-${asset.id}`}
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                  />
                </div>
                <Button onClick={handleSave} size="sm" disabled={isSaving || fileName.trim() === asset.fileName}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar
                </Button>
            </div>
        </PopoverContent>
    )
}

function UploadDropzone({ onUpload, disabled }: { onUpload: (files: FileList) => void, disabled: boolean }) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onUpload(e.dataTransfer.files);
        }
    };
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload(e.target.files);
        }
    }

    const handleClick = () => {
        fileInputRef.current?.click();
    }

    return (
        <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
            className={cn(
                "w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
                isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/30 hover:border-primary",
                disabled && "cursor-not-allowed opacity-50"
            )}
        >
            <input 
                ref={fileInputRef}
                type="file" 
                className="sr-only" 
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                disabled={disabled}
            />
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-semibold">Arraste e solte seus arquivos aqui</p>
            <p className="text-sm text-muted-foreground">ou clique para selecionar (Max 5MB por arquivo)</p>
        </div>
    );
}

export default function MediaLibraryPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading, activeWorkspace } = useAuth();
  const { toast } = useToast();

  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, { progress: number; file: File; tempUrl: string }>>(new Map());
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Nova funcionalidade: Kits de Marca!', slug: 'kits-de-marca-consistencia-visual', read: false },
    { id: 2, title: 'Melhoria no alinhamento de formulários.', slug: 'melhoria-alinhamento-formularios', read: true },
    { id: 3, title: 'Bem-vindo ao CloudPage Studio!', slug: 'bem-vindo-cloudpage-studio', read: true },
  ]);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  
  const handleNotificationClick = (notificationId: number, slug: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    window.open(`https://blog.cloudpagestudio.app/${slug}`, '_blank');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const fetchMedia = useCallback(async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      const assets = await getMediaForWorkspace(activeWorkspace.id);
      setMediaAssets(assets);
    } catch (error) {
      console.error("Failed to fetch media assets:", error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar a biblioteca de mídia.' });
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace, toast]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (activeWorkspace) {
      fetchMedia();
    } else {
        setIsLoading(false);
    }
  }, [user, authLoading, router, activeWorkspace, fetchMedia]);
  
  const handleFileUpload = async (files: FileList) => {
    if (!user || !activeWorkspace) return;

    for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({ variant: 'destructive', title: 'Arquivo muito grande', description: `O arquivo "${file.name}" excede o limite de 5MB.` });
            continue;
        }
        if (!file.type.startsWith('image/')) {
            toast({ variant: 'destructive', title: 'Tipo de arquivo inválido', description: `O arquivo "${file.name}" não é uma imagem.` });
            continue;
        }

        const tempId = `uploading-${file.name}-${Date.now()}`;
        const tempUrl = URL.createObjectURL(file);

        setUploadingFiles(prev => {
            const newMap = new Map(prev);
            newMap.set(tempId, { progress: 0, file, tempUrl });
            return newMap;
        });

        try {
            await uploadMedia(file, activeWorkspace.id, user.uid, (progress) => {
                setUploadingFiles(prev => {
                    const newMap = new Map(prev);
                    const existing = newMap.get(tempId);
                    if (existing) {
                        newMap.set(tempId, { ...existing, progress });
                    }
                    return newMap;
                });
            });
        } catch (error: any) {
            console.error("Upload failed:", error);
            toast({ variant: "destructive", title: "Erro no Upload", description: `Falha no upload de "${file.name}": ${error.message}` });
        } finally {
            setUploadingFiles(prev => {
                const newMap = new Map(prev);
                newMap.delete(tempId);
                return newMap;
            });
            fetchMedia(); // Refresh list after each upload completes or fails
        }
    }
  };

  const handleDeleteMedia = async (asset: MediaAsset) => {
    try {
        await deleteMedia(asset);
        setMediaAssets(prev => prev.filter(m => m.id !== asset.id));
        toast({ title: 'Arquivo excluído!' });
    } catch (error: any) {
        console.error("Delete failed:", error);
        toast({ variant: "destructive", title: "Erro ao excluir", description: error.message });
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'URL copiada!' });
  }

  const handleMediaUpdate = async (assetId: string, data: Partial<Pick<MediaAsset, 'fileName' | 'tags'>>) => {
      try {
          await updateMedia(assetId, data);
          setMediaAssets(prev => prev.map(asset => 
              asset.id === assetId ? { ...asset, ...data } : asset
          ));
          toast({ title: 'Mídia atualizada!' });
      } catch (error: any) {
          console.error("Failed to update media:", error);
          toast({ variant: "destructive", title: "Erro ao atualizar", description: error.message });
      }
  }
  
  const currentUsageBytes = useMemo(() => {
    return mediaAssets.reduce((total, asset) => total + asset.size, 0);
  }, [mediaAssets]);
  
  const usagePercentage = (currentUsageBytes / STORAGE_LIMIT_BYTES) * 100;

  const allTags = useMemo(() => {
      const tagsSet = new Set<string>();
      mediaAssets.forEach(asset => {
          (asset.tags || []).forEach(tag => tagsSet.add(tag));
      });
      return Array.from(tagsSet).sort();
  }, [mediaAssets]);

  const filteredAssets = useMemo(() => {
    return mediaAssets.filter(asset => {
        const matchesSearch = asset.fileName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = activeTag ? (asset.tags || []).includes(activeTag) : true;
        return matchesSearch && matchesTag;
    });
  }, [mediaAssets, searchTerm, activeTag]);

  const isUploading = uploadingFiles.size > 0;

  if (isLoading || authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  const userInitials = user?.displayName?.split(' ').map(n => n[0]).join('') || user?.email?.[0].toUpperCase() || 'U';

  return (
    <>
      <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Logo className="h-6 w-6 text-primary" />
            <h1>Biblioteca de Mídia</h1>
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
        <div className="flex items-center gap-2 md:gap-4">
           <Button variant="ghost" onClick={() => router.push('/brands')}>
            <Palette className="mr-2 h-4 w-4" />
            Marcas
          </Button>
          <Button variant="ghost" onClick={() => router.push('/templates')}>
            <Library className="mr-2 h-4 w-4" />
            Templates
          </Button>
           <Button variant="outline" onClick={() => router.push('/')}>
                <Home className="mr-2 h-4 w-4" />
                Voltar aos Projetos
            </Button>
          <Separator orientation="vertical" className="h-6 mx-2 hidden md:block" />
          <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label={`Notificações: ${unreadCount} não lidas`}>
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    )}
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                    Notificações
                    {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs font-normal text-primary hover:underline">
                        <CheckCheck className="mr-1 h-3 w-3 inline-block" />
                        Marcar todas como lidas
                        </button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map(notification => (
                    <DropdownMenuItem 
                    key={notification.id} 
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => handleNotificationClick(notification.id, notification.slug)}
                    className="flex items-center gap-3 cursor-pointer"
                    >
                    {!notification.read && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>}
                    <span className={cn("flex-grow", notification.read && "pl-5")}>{notification.title}</span>
                    </DropdownMenuItem>
                ))}
                </DropdownMenuContent>
            </DropdownMenu>
         </div>
          {user && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" aria-label="Menu do usuário">
                         <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Avatar do usuário'} />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/account')}>
                        <User className="mr-2 h-4 w-4" />
                        Gerenciar Conta
                    </DropdownMenuItem>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                <LogOut className="mr-2 h-4 w-4" />
                                Sair
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                Você será desconectado da sua conta.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={logout} className="bg-destructive hover:bg-destructive/90">Sair</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
     
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UploadDropzone onUpload={handleFileUpload} disabled={isUploading || !activeWorkspace} />
          <Card className="flex flex-col justify-center">
            <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                    <Database className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold">Uso do Armazenamento</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    Cada workspace tem um limite de armazenamento. Organize seus arquivos para otimizar o uso.
                </p>
                <Progress value={usagePercentage} className="w-full mb-2" />
                <div className="flex justify-between text-sm">
                    <span>Usado: {formatBytes(currentUsageBytes)}</span>
                    <span className="text-muted-foreground">Limite: {formatBytes(STORAGE_LIMIT_BYTES)}</span>
                </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Buscar por nome do arquivo..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium">Filtrar por tag:</span>
                <Badge variant={!activeTag ? "default" : "secondary"} onClick={() => setActiveTag(null)} className="cursor-pointer">Todos</Badge>
                {allTags.map(tag => (
                     <Badge key={tag} variant={activeTag === tag ? "default" : "secondary"} onClick={() => setActiveTag(tag)} className="cursor-pointer">
                        {tag}
                    </Badge>
                ))}
            </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {Array.from(uploadingFiles.entries()).map(([tempId, { progress, tempUrl, file }]) => (
              <Card key={tempId} className="group relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square w-full bg-muted flex items-center justify-center">
                    <Image
                      src={tempUrl}
                      alt={file.name}
                      width={200}
                      height={200}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/70 flex flex-col justify-between p-2 text-white">
                      <div className="space-y-1 text-center">
                          <Loader2 className="h-6 w-6 mx-auto animate-spin" />
                          <p className="text-xs font-medium">Enviando...</p>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-1.5">
                          <div className="bg-white h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                      <p className="text-xs font-bold truncate text-center">{file.name}</p>
                  </div>
                </CardContent>
              </Card>
          ))}
          {filteredAssets.map((asset) => (
             <Dialog key={asset.id}>
                <DialogTrigger asChild>
                    <Card className="group relative overflow-hidden cursor-pointer">
                        <CardContent className="p-0">
                        <div className="aspect-square w-full bg-muted flex items-center justify-center">
                            <Image
                            src={asset.url}
                            alt={asset.fileName}
                            width={200}
                            height={200}
                            className="object-cover w-full h-full"
                            />
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex justify-end gap-1">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <FileNameEditor asset={asset} onNameUpdate={(assetId, newName) => handleMediaUpdate(assetId, { fileName: newName })} />
                                </Popover>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                            <Tag className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <TagEditor asset={asset} onTagsUpdate={(assetId, tags) => handleMediaUpdate(assetId, { tags })} />
                                </Popover>
                                <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleCopyUrl(asset.url); }}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Excluir Arquivo?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Tem certeza que deseja excluir "{asset.fileName}"? Esta ação não pode ser desfeita.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteMedia(asset)}>Excluir</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            <div className="text-white text-xs p-1 bg-black/50 rounded-md">
                                <p className="font-bold truncate">{asset.fileName}</p>
                                <p>{formatBytes(asset.size)}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {(asset.tags || []).map(tag => <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">{tag}</Badge>)}
                                </div>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-auto p-2 bg-transparent border-none shadow-none">
                     <DialogHeader className="sr-only">
                        <DialogTitle>{asset.fileName}</DialogTitle>
                        <DialogDescription>Visualização da imagem {asset.fileName}.</DialogDescription>
                    </DialogHeader>
                    <Image
                        src={asset.url}
                        alt={asset.fileName}
                        width={1200}
                        height={800}
                        className="object-contain w-full h-auto max-h-[90vh] rounded-lg"
                    />
                </DialogContent>
            </Dialog>
          ))}
        </div>
        {mediaAssets.length === 0 && !isUploading && (
             <div className="text-center py-10">
                <p className="text-muted-foreground">Sua biblioteca está vazia. Use a área acima para começar.</p>
            </div>
        )}
      </main>
    </>
  );
}
