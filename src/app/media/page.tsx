"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { uploadMedia, getMediaForWorkspace, deleteMedia, updateMedia } from '@/lib/firestore';
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
import { Input } from '@/components/ui/input';
import { Home, Loader2, Plus, Trash2, UploadCloud, Copy, Image as ImageIcon, Search, Tag, X, Edit, Save } from 'lucide-react';
import { Logo } from '@/components/icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
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

export default function MediaLibraryPage() {
  const router = useRouter();
  const { user, loading: authLoading, activeWorkspace } = useAuth();
  const { toast } = useToast();

  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

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
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user || !activeWorkspace) {
        return;
    }
    const file = event.target.files[0];
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({ variant: 'destructive', title: 'Arquivo muito grande', description: 'O tamanho máximo do arquivo é 5MB.' });
      return;
    }
     if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Tipo de arquivo inválido', description: 'Apenas imagens são permitidas.' });
        return;
    }
    
    setIsUploading(true);
    try {
        await uploadMedia(file, activeWorkspace.id, user.uid);
        toast({ title: 'Upload concluído!', description: `O arquivo "${file.name}" foi salvo.` });
        fetchMedia();
    } catch (error: any) {
        console.error("Upload failed:", error);
        toast({ variant: "destructive", title: "Erro no Upload", description: error.message });
    } finally {
        setIsUploading(false);
    }
  }

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
            <h1>Biblioteca de Mídia</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/')}>
                <Home className="mr-2 h-4 w-4" />
                Voltar aos Projetos
            </Button>
            <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Fazer Upload
                    <input id="file-upload" type="file" className="sr-only" onChange={handleFileUpload} disabled={isUploading || !activeWorkspace} accept="image/*" />
                </label>
            </Button>
        </div>
      </header>
       {isUploading && (
          <div className="fixed top-16 left-0 w-full h-1 bg-muted">
            <div className="h-full bg-primary animate-pulse" />
          </div>
        )}

      <main className="p-6">
        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
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
        
        {filteredAssets.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <ImageIcon size={48} className="mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">{mediaAssets.length === 0 ? "Sua biblioteca está vazia" : "Nenhum arquivo encontrado"}</h2>
            <p className="mt-2 text-muted-foreground">
              {mediaAssets.length === 0 ? "Comece fazendo o upload de suas imagens, logos e outros assets." : "Tente limpar seus filtros de busca."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} className="group relative overflow-hidden">
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
                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleCopyUrl(asset.url)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="icon" variant="destructive" className="h-8 w-8">
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
            ))}
          </div>
        )}
      </main>
    </>
  );
}
