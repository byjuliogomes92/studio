
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BellPlus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { addNotification, getNotifications, updateNotification, deleteNotification } from '@/lib/firestore';
import type { AppNotification } from '@/lib/types';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';

function NotificationForm({
  onSave,
  existingNotification,
  isSaving,
}: {
  onSave: (title: string, url: string) => Promise<void>;
  existingNotification?: AppNotification | null;
  isSaving: boolean;
}) {
  const [title, setTitle] = useState(existingNotification?.title || '');
  const [url, setUrl] = useState(existingNotification?.url || '');
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title || !url) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, preencha todos os campos.' });
      return;
    }
    await onSave(title, url);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título da Notificação</Label>
        <Input
          id="title"
          type="text"
          placeholder="Ex: Nova funcionalidade: Testes A/B!"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSaving}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="url">URL do Artigo do Blog</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://seu-blog.com/artigo"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isSaving}
        />
      </div>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BellPlus className="mr-2 h-4 w-4" />}
        {existingNotification ? 'Salvar Alterações' : 'Criar Notificação'}
      </Button>
    </div>
  );
}

export default function NotificationsAdminPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedNotifications = await getNotifications();
      setNotifications(fetchedNotifications);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar as notificações.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleCreateNotification = async (title: string, url: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado.' });
      return;
    }
    setIsSaving(true);
    try {
      await addNotification({ title, url });
      toast({
        title: 'Sucesso!',
        description: 'A notificação foi criada e será exibida para os usuários.',
      });
      fetchNotifications();
    } catch (error: any) {
      console.error("Failed to create notification:", error);
      toast({ variant: 'destructive', title: 'Erro ao criar notificação', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateNotification = async (title: string, url: string) => {
    if (!selectedNotification) return;
    setIsSaving(true);
    try {
        await updateNotification(selectedNotification.id, { title, url });
        toast({ title: "Sucesso!", description: "Notificação atualizada."});
        setIsEditModalOpen(false);
        setSelectedNotification(null);
        fetchNotifications();
    } catch (error: any) {
        toast({ variant: "destructive", title: "Erro ao atualizar", description: error.message });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleDeleteNotification = async (notificationId: string) => {
    try {
        await deleteNotification(notificationId);
        toast({ title: "Sucesso!", description: "Notificação excluída." });
        fetchNotifications();
    } catch (error: any) {
        toast({ variant: "destructive", title: "Erro ao excluir", description: error.message });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gerenciar Notificações</h1>
        <p className="text-muted-foreground">Crie, edite ou exclua notificações que aparecerão para todos os usuários.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Criar Nova Notificação</CardTitle>
          <CardDescription>
            A nova notificação aparecerá no topo da lista para os usuários.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <NotificationForm onSave={handleCreateNotification} isSaving={isSaving} />
        </CardContent>
      </Card>

      <Separator />

       <Card>
            <CardHeader>
                <CardTitle>Notificações Ativas</CardTitle>
                <CardDescription>Lista de todas as notificações agendadas ou ativas.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : notifications.length === 0 ? (
                    <p className="text-muted-foreground text-center">Nenhuma notificação encontrada.</p>
                ) : (
                    <div className="space-y-4">
                        {notifications.map(notification => (
                            <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <p className="font-semibold">{notification.title}</p>
                                    <a href={notification.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline truncate">{notification.url}</a>
                                    <p className="text-xs text-muted-foreground">
                                        Criado em: {notification.createdAt?.toDate ? format(notification.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : '...'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button variant="outline" size="icon" onClick={() => { setSelectedNotification(notification); setIsEditModalOpen(true); }}><Edit className="h-4 w-4" /></Button>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                <AlertDialogDescription>Esta ação não pode ser desfeita e excluirá permanentemente a notificação.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteNotification(notification.id)}>Excluir</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
       </Card>

       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Notificação</DialogTitle>
                    <DialogDescription>Altere os detalhes da notificação selecionada.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                     {selectedNotification && (
                        <NotificationForm
                            onSave={handleUpdateNotification}
                            existingNotification={selectedNotification}
                            isSaving={isSaving}
                        />
                    )}
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                </DialogFooter>
            </DialogContent>
       </Dialog>
    </div>
  );
}
