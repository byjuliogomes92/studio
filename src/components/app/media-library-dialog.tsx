
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getMediaForWorkspace, uploadMedia } from "@/lib/firestore";
import type { MediaAsset } from "@/lib/types";
import { Loader2, UploadCloud, ImageIcon } from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";

interface MediaLibraryDialogProps {
  children: React.ReactNode;
  onSelectImage: (url: string) => void;
}

export function MediaLibraryDialog({ children, onSelectImage }: MediaLibraryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  const { user, activeWorkspace } = useAuth();
  const { toast } = useToast();

  const fetchMedia = useCallback(async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      const assets = await getMediaForWorkspace(activeWorkspace.id);
      setMediaAssets(assets);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar a biblioteca." });
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace, toast]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    } else {
        // Reset selection when closing
        setSelectedAsset(null);
    }
  }, [isOpen, fetchMedia]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user || !activeWorkspace) return;
    const file = event.target.files[0];
     if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({ variant: 'destructive', title: 'Arquivo muito grande', description: 'O tamanho máximo do arquivo é 5MB.' });
      return;
    }
    
    setIsUploading(true);
    try {
        await uploadMedia(file, activeWorkspace.id, user.uid);
        fetchMedia();
    } catch (error) {
         toast({ variant: "destructive", title: "Erro no Upload" });
    } finally {
        setIsUploading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedAsset) {
      onSelectImage(selectedAsset.url);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecionar da Biblioteca de Mídia</DialogTitle>
          <DialogDescription>
            Escolha um arquivo existente ou faça um novo upload.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
            <div className="flex flex-col gap-4">
                <Button asChild variant="outline">
                     <label htmlFor="modal-file-upload" className="cursor-pointer w-full">
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UploadCloud className="mr-2 h-4 w-4" />}
                        Fazer Upload
                        <input id="modal-file-upload" type="file" className="sr-only" onChange={handleFileChange} disabled={isUploading || !activeWorkspace} />
                    </label>
                </Button>
                 {isUploading && <p className="text-sm text-center text-muted-foreground">Enviando...</p>}
            </div>

            <ScrollArea className="h-full border rounded-lg">
                 <div className="p-4">
                    {isLoading ? (
                         <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : mediaAssets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-16">
                            <ImageIcon className="h-12 w-12 mb-4" />
                            <p>Nenhum item na biblioteca.</p>
                        </div>
                    ) : (
                         <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-2">
                            {mediaAssets.map(asset => (
                                <div
                                    key={asset.id}
                                    className={cn(
                                        "relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all",
                                        selectedAsset?.id === asset.id ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent hover:border-muted-foreground'
                                    )}
                                    onClick={() => setSelectedAsset(asset)}
                                >
                                    <Image
                                        src={asset.url}
                                        alt={asset.fileName}
                                        fill
                                        sizes="(max-width: 768px) 33vw, 20vw"
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                 </div>
            </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedAsset}>
            Confirmar Seleção
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
