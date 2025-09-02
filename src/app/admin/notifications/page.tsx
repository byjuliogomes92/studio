
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BellPlus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { addNotification } from '@/lib/firestore';

export default function NotificationsAdminPage() {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const handleCreateNotification = async () => {
        if (!title || !url) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, preencha todos os campos.' });
            return;
        }
        if (!user) {
             toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado.' });
            return;
        }

        setIsLoading(true);
        try {
            await addNotification({ title, url }, user);
            toast({
                title: 'Sucesso!',
                description: 'A notificação foi criada e será exibida para os usuários.',
            });
            setTitle('');
            setUrl('');
        } catch (error: any) {
            console.error("Failed to create notification:", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao criar notificação',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-xl">
            <h1 className="text-3xl font-bold mb-6">Criar Nova Notificação</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Nova Notificação</CardTitle>
                    <CardDescription>
                        Crie uma notificação que aparecerá para todos os usuários no ícone de sino.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título da Notificação</Label>
                        <Input
                            id="title"
                            type="text"
                            placeholder="Ex: Nova funcionalidade: Testes A/B!"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isLoading}
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
                            disabled={isLoading}
                        />
                    </div>
                    <Button onClick={handleCreateNotification} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BellPlus className="mr-2 h-4 w-4" />}
                        Criar Notificação
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
