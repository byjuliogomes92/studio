
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { uploadMedia, getMediaForWorkspace, deleteMedia, updateMedia, STORAGE_LIMIT_BYTES, bulkUpdateMediaTags } from '@/lib/firestore';
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
import { Home, Loader2, Plus, Trash2, UploadCloud, Copy, Image as ImageIcon, Search, Tag, X, Edit, Save, Bell, CheckCheck, User, LogOut, Palette, Library, Database, Check, Hand, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import { Logo } from '@/components/icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type SortOption = "createdAt-desc" | "createdAt-asc" | "name-asc" | "name-desc" | "size-desc" | "size-asc";
type ViewMode = "grid" | "list";


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

function BulkTagPopover({ onBulkTag }: { onBulkTag: (tags: string[]) => void }) {
    const [tagInput, setTagInput] = useState('');

    const handleAdd = () => {
        if (tagInput.trim()) {
            const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
            onBulkTag(tags);
            setTagInput('');
        }
    };
    
    return (
        <Popover>
            <PopoverTrigger asChild>
                 <Button variant="outline">
                    <Tag className="mr-2 h-4 w-4" />
                    Adicionar Tags
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <div className="space-y-2">
                    <Label htmlFor="bulk-tag-input">Tags para adicionar</Label>
                    <Input 
                        id="bulk-tag-input"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Ex: campanha, banner"
                    />
                    <p className="text-xs text-muted-foreground">Separe múltiplas tags com vírgula.</p>
                </div>
                 <Button onClick={handleAdd} size="sm" className="mt-2 w-full">Aplicar Tags</Button>
            </PopoverContent>
        </Popover>
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
  const [sortOption, setSortOption] = useState<SortOption>("createdAt-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");


  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Nova funcionalidade: Kits de Marca!', slug: 'kits-de-marca-consistencia-visual', read: false },
    { id: 2, title: 'Melhoria no alinhamento de formulários.', slug: 'melhoria-alinhamento-formularios', read: true },
    { id: 3, title: 'Bem-vindo ao CloudPage Studio!', slug: 'bem-vindo-cloudpage-studio', read: true },
  ]);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  
  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  useEffect(() => {
      if (!isSelectionMode) {
          setSelectedIds(new Set());
      }
  }, [isSelectionMode]);
  
  const handleFileUpload = async (files: FileList) => {
    if (!user || !activeWorkspace) return;
    
    const currentUsage = mediaAssets.reduce((total, asset) => total + asset.size, 0);
    let cumulativeNewSize = 0;

    for (const file of Array.from(files)) {
      if (currentUsage + cumulativeNewSize + file.size > STORAGE_LIMIT_BYTES) {
        toast({ variant: 'destructive', title: 'Limite de Armazenamento Excedido', description: `O upload de "${file.name}" faria seu workspace ultrapassar o limite de 100 MB.` });
        continue;
      }
      cumulativeNewSize += file.size;

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
            await uploadMedia(file, activeWorkspace.id, user, (progress) => {
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

  const handleDeleteMedia = async (assetsToDelete: MediaAsset[]) => {
      if (assetsToDelete.length === 0 || !user) return;
      try {
          const deletePromises = assetsToDelete.map(asset => deleteMedia(asset, user));
          await Promise.all(deletePromises);
          
          setMediaAssets(prev => prev.filter(m => !assetsToDelete.some(a => a.id === m.id)));
          setSelectedIds(new Set());
          setIsSelectionMode(false);
          toast({ title: `${assetsToDelete.length} arquivo(s) excluído(s)!` });
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
      if (!user) return;
      try {
          await updateMedia(assetId, data, user);
          setMediaAssets(prev => prev.map(asset => 
              asset.id === assetId ? { ...asset, ...data } : asset
          ));
          toast({ title: 'Mídia atualizada!' });
      } catch (error: any) {
          console.error("Failed to update media:", error);
          toast({ variant: "destructive", title: "Erro ao atualizar", description: error.message });
      }
  }

  const handleToggleSelection = (assetId: string) => {
      setSelectedIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(assetId)) {
              newSet.delete(assetId);
          } else {
              newSet.add(assetId);
          }
          return newSet;
      })
  }

  const handleBulkDelete = () => {
      const assetsToDelete = mediaAssets.filter(asset => selectedIds.has(asset.id));
      handleDeleteMedia(assetsToDelete);
  }

  const handleBulkTag = async (tagsToAdd: string[]) => {
      if (selectedIds.size === 0 || tagsToAdd.length === 0 || !user || !activeWorkspace) return;
      try {
          const assetIds = Array.from(selectedIds);
          await bulkUpdateMediaTags(assetIds, tagsToAdd, activeWorkspace.id);
          
          // Optimistically update UI
          setMediaAssets(prev => prev.map(asset => {
              if (selectedIds.has(asset.id)) {
                  const newTags = Array.from(new Set([...(asset.tags || []), ...tagsToAdd]));
                  return { ...asset, tags: newTags };
              }
              return asset;
          }));

          toast({ title: `${tagsToAdd.length} tag(s) adicionada(s) a ${selectedIds.size} arquivo(s).` });
      } catch (error: any) {
          console.error("Bulk tagging failed:", error);
          toast({ variant: "destructive", title: "Erro ao adicionar tags", description: error.message });
      }
  };
  
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

  const filteredAndSortedAssets = useMemo(() => {
      return mediaAssets
        .filter(asset => {
            const matchesSearch = asset.fileName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTag = activeTag ? (asset.tags || []).includes(activeTag) : true;
            return matchesSearch && matchesTag;
        })
        .sort((a, b) => {
            switch(sortOption) {
                case 'name-asc': return a.fileName.localeCompare(b.fileName);
                case 'name-desc': return b.fileName.localeCompare(a.fileName);
                case 'createdAt-asc': return (a.createdAt?.toDate() || 0) > (b.createdAt?.toDate() || 0) ? 1 : -1;
                case 'size-asc': return a.size - b.size;
                case 'size-desc': return b.size - a.size;
                case 'createdAt-desc':
                default:
                    return (a.createdAt?.toDate() || 0) < (b.createdAt?.toDate() || 0) ? 1 : -1;
            }
        });
  }, [mediaAssets, searchTerm, activeTag, sortOption]);

    const handleSelectAll = () => {
        if (selectedIds.size === filteredAndSortedAssets.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredAndSortedAssets.map(asset => asset.id)));
        }
    };

    const isAllSelected = selectedIds.size > 0 && selectedIds.size === filteredAndSortedAssets.length;

  const isUploading = uploadingFiles.size > 0;

  if (isLoading || authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  const userInitials = user?.displayName?.split(' ').map(n => n[0]).join('') || user?.email?.[0].toUpperCase() || 'U';

  const assetActions = (asset: MediaAsset) => (
      <div className="flex items-center justify-end">
          <Popover>
              <PopoverTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                      <Edit className="h-4 w-4" />
                  </Button>
              </PopoverTrigger>
              <FileNameEditor asset={asset} onNameUpdate={(assetId, newName) => handleMediaUpdate(assetId, { fileName: newName })} />
          </Popover>
          <Popover>
              <PopoverTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                      <Tag className="h-4 w-4" />
                  </Button>
              </PopoverTrigger>
              <TagEditor asset={asset} onTagsUpdate={(assetId, tags) => handleMediaUpdate(assetId, { tags })} />
          </Popover>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleCopyUrl(asset.url); }}>
              <Copy className="h-4 w-4" />
          </Button>
          <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => e.stopPropagation()}>
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
                      <AlertDialogAction onClick={() => handleDeleteMedia([asset])}>Excluir</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
      </div>
  );

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
        <UploadDropzone onUpload={handleFileUpload} disabled={isUploading || !activeWorkspace} />
        
        <div className="border rounded-lg bg-card p-3">
              <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      Uso do Armazenamento
                  </h3>
                  <div className="text-xs">
                      <span className="font-medium">{formatBytes(currentUsageBytes)}</span>
                      <span className="text-muted-foreground"> / {formatBytes(STORAGE_LIMIT_BYTES)}</span>
                  </div>
              </div>
              <Progress value={usagePercentage} className="w-full h-1.5" />
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
            <div className="flex items-center gap-2">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            Ordenar
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={() => setSortOption("createdAt-desc")}>Mais Recentes</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setSortOption("createdAt-asc")}>Mais Antigos</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setSortOption("name-asc")}>Nome (A-Z)</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setSortOption("name-desc")}>Nome (Z-A)</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setSortOption("size-desc")}>Mais Pesado</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setSortOption("size-asc")}>Mais Leve</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center rounded-md border bg-background p-1">
                    <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')} className="h-8 w-8"><LayoutGrid className="h-4 w-4"/></Button>
                    <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')} className="h-8 w-8"><List className="h-4 w-4"/></Button>
                </div>
                <Button variant={isSelectionMode ? "secondary" : "outline"} onClick={() => setIsSelectionMode(!isSelectionMode)}>
                    {isSelectionMode ? <X className="mr-2 h-4 w-4" /> : <Hand className="mr-2 h-4 w-4" />}
                    {isSelectionMode ? 'Cancelar' : 'Selecionar'}
                </Button>
            </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
                 <Badge key={tag} variant={activeTag === tag ? "default" : "secondary"} onClick={() => setActiveTag(tag === activeTag ? null : tag)} className="cursor-pointer">
                    {tag}
                </Badge>
            ))}
            {activeTag && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActiveTag(null)}>
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>

        {viewMode === 'grid' ? (
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
          {filteredAndSortedAssets.map((asset) => (
             <Dialog key={asset.id}>
                <div className="group relative">
                   <DialogTrigger asChild disabled={isSelectionMode}>
                        <Card 
                            className={cn(
                                "group/card relative overflow-hidden transition-all",
                                isSelectionMode ? "cursor-pointer" : "cursor-pointer"
                            )}
                            onClick={() => isSelectionMode && handleToggleSelection(asset.id)}
                        >
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
                                <div className={cn(
                                    "absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-between p-2",
                                    isSelectionMode && selectedIds.has(asset.id) && "opacity-100"
                                )}>
                                    {!isSelectionMode && (
                                        <div className="flex justify-end gap-1">
                                            {assetActions(asset)}
                                        </div>
                                    )}
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
                     {isSelectionMode && (
                        <div 
                            onClick={() => handleToggleSelection(asset.id)}
                            className="absolute top-2 left-2 z-10 w-6 h-6 bg-background/80 rounded-md flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-primary"
                        >
                            {selectedIds.has(asset.id) && <Check className="h-5 w-5 text-primary" />}
                        </div>
                    )}
                </div>
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
        ) : (
            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Nome do Arquivo</TableHead>
                            <TableHead>Tamanho</TableHead>
                            <TableHead>Data de Upload</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndSortedAssets.map(asset => (
                            <TableRow key={asset.id} className={cn(isSelectionMode && "cursor-pointer")} onClick={() => isSelectionMode && handleToggleSelection(asset.id)}>
                                <TableCell>
                                    {isSelectionMode ? (
                                        <div className="w-6 h-6 border-2 rounded-md flex items-center justify-center">
                                            {selectedIds.has(asset.id) && <Check className="h-5 w-5 text-primary"/>}
                                        </div>
                                    ) : (
                                         <Dialog>
                                            <DialogTrigger asChild>
                                                <Image src={asset.url} alt={asset.fileName} width={40} height={40} className="rounded-md object-cover aspect-square"/>
                                            </DialogTrigger>
                                             <DialogContent className="max-w-4xl h-auto p-2 bg-transparent border-none shadow-none">
                                                <DialogHeader className="sr-only">
                                                    <DialogTitle>{asset.fileName}</DialogTitle>
                                                    <DialogDescription>Visualização da imagem {asset.fileName}.</DialogDescription>
                                                </DialogHeader>
                                                <Image src={asset.url} alt={asset.fileName} width={1200} height={800} className="object-contain w-full h-auto max-h-[90vh] rounded-lg"/>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium truncate max-w-xs">{asset.fileName}</TableCell>
                                <TableCell>{formatBytes(asset.size)}</TableCell>
                                <TableCell>{asset.createdAt?.toDate ? format(asset.createdAt.toDate(), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                <TableCell>{assetActions(asset)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )}

        {(mediaAssets.length === 0 && !isUploading) && (
             <div className="text-center py-10">
                <p className="text-muted-foreground">Sua biblioteca está vazia. Use a área acima para começar.</p>
            </div>
        )}
      </main>
      
       {isSelectionMode && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div className="flex items-center gap-4 bg-background border rounded-lg shadow-lg p-3">
                    <p className="text-sm font-medium">{selectedIds.size} item(s) selecionado(s)</p>
                     <Button variant="outline" onClick={handleSelectAll}>
                        <CheckCheck className="mr-2 h-4 w-4" />
                        {isAllSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}
                    </Button>
                    {selectedIds.size > 0 && (
                        <>
                           <BulkTagPopover onBulkTag={handleBulkTag} />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Excluir
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir {selectedIds.size} itens?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleBulkDelete}>Excluir</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>
            </div>
        )}
    </>
  );
}
