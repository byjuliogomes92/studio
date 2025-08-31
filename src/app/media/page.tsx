
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { uploadMedia, getMediaForWorkspace, deleteMedia } from '@/lib/firestore';
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
import { Home, Loader2, Plus, Trash2, UploadCloud, Copy, Image as ImageIcon } from 'lucide-react';
import { Logo } from '@/components/icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function MediaLibraryPage() {
  const router = useRouter();
  const { user, loading: authLoading, activeWorkspace } = useAuth();
  const { toast } = useToast();

  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
    // Basic validation
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
        fetchMedia(); // Refresh list
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
        {mediaAssets.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <ImageIcon size={48} className="mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Sua biblioteca está vazia</h2>
            <p className="mt-2 text-muted-foreground">Comece fazendo o upload de suas imagens, logos e outros assets.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaAssets.map((asset) => (
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
