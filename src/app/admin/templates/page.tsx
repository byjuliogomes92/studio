
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, Plus, Edit, Trash2, Rocket, Handshake, CalendarClock, Smile, CheckCheck, PartyPopper, Server } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Template } from '@/lib/types';
import { getDefaultTemplates, deleteDefaultTemplate } from '@/lib/firestore';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const iconMap: { [key: string]: React.ElementType } = {
  rocket: Rocket,
  handshake: Handshake,
  'calendar-clock': CalendarClock,
  smile: Smile,
  'check-check': CheckCheck,
  'party-popper': PartyPopper,
  default: Server,
};

export default function AdminTemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();

    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        try {
            const allTemplates = await getDefaultTemplates();
            setTemplates(allTemplates);
        } catch (error) {
            console.error("Failed to fetch default templates:", error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os templates padrão.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleCreateTemplate = () => {
        // Navigate to the editor in a special "create default template" mode.
        router.push('/editor/new?isDefaultTemplate=true');
    };
    
    const handleEditTemplate = (templateId: string) => {
        router.push(`/editor/${templateId}?isTemplate=true&isDefault=true`);
    };
    
    const handleDeleteTemplate = async (templateId: string, templateName: string) => {
        if (!user) return;
        try {
            await deleteDefaultTemplate(templateId, user.uid);
            setTemplates(prev => prev.filter(t => t.id !== templateId));
            toast({ title: 'Template padrão excluído!', description: `O template "${templateName}" foi removido.` });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Erro ao excluir", description: error.message });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Templates Padrão da Plataforma</h1>
                    <p className="text-muted-foreground">Gerencie os templates que todos os usuários podem utilizar como base para suas páginas.</p>
                </div>
                <Button onClick={handleCreateTemplate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Novo Template Padrão
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}><CardContent className="p-4"><div className="w-full h-64 bg-muted animate-pulse rounded-md"></div></CardContent></Card>
                    ))
                ) : templates.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                        <p className="text-muted-foreground">Nenhum template padrão encontrado.</p>
                    </div>
                ) : (
                    templates.map(template => {
                        const Icon = iconMap[template.icon || 'default'] || Server;
                        return (
                            <Card key={template.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="w-full aspect-video bg-muted rounded-md mb-2 flex items-center justify-center">
                                        <Icon className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                    <CardTitle>{template.name}</CardTitle>
                                    <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-xs text-muted-foreground">
                                        Última atualização: {template.updatedAt?.toDate ? format(template.updatedAt.toDate(), 'dd/MM/yyyy') : '-'}
                                    </p>
                                </CardContent>
                                <CardFooter className="border-t pt-4 flex justify-end gap-2">
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Excluir Template Padrão?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta ação é permanente e removerá o template "{template.name}" para todos os usuários da plataforma.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteTemplate(template.id, template.name)}>Excluir</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <Button variant="outline" size="icon" onClick={() => handleEditTemplate(template.id)}><Edit className="h-4 w-4" /></Button>
                                </CardFooter>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    );
}
