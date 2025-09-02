
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Home, Loader2, PlusCircle, MessageSquare, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/icons';
import { createSupportTicket, getTicketsForUser } from '@/lib/firestore';
import type { SupportTicket, TicketCategory } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

function TicketForm({ onTicketCreated }: { onTicketCreated: () => void }) {
    const { user, activeWorkspace } = useAuth();
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<TicketCategory>('duvida');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = async () => {
        if (!user || !activeWorkspace) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado em um workspace.' });
            return;
        }
        if (!title.trim() || !description.trim()) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, preencha o título e a descrição.' });
            return;
        }
        setIsSubmitting(true);
        try {
            await createSupportTicket({
                workspaceId: activeWorkspace.id,
                userId: user.uid,
                userEmail: user.email || 'N/A',
                userName: user.displayName || 'Usuário Anônimo',
                title,
                description,
                category,
            });
            toast({ title: 'Chamado aberto!', description: 'Nossa equipe responderá em breve.' });
            setIsModalOpen(false);
            onTicketCreated(); // Callback to refresh the list
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro ao abrir chamado', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Abrir Novo Chamado
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Abrir um Chamado de Suporte</DialogTitle>
                    <DialogDescription>
                        Descreva seu problema ou dúvida e nossa equipe entrará em contato.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="ticket-title">Título</Label>
                        <Input id="ticket-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Problema ao salvar formulário" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ticket-category">Categoria</Label>
                        <Select value={category} onValueChange={(value: TicketCategory) => setCategory(value)}>
                            <SelectTrigger id="ticket-category">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="duvida">Dúvida Geral</SelectItem>
                                <SelectItem value="bug">Relatar um Bug</SelectItem>
                                <SelectItem value="melhoria">Sugestão de Melhoria</SelectItem>
                                <SelectItem value="outro">Outro Assunto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ticket-description">Descrição</Label>
                        <Textarea id="ticket-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhe o máximo possível sobre o que está acontecendo..." rows={6} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar Chamado
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function SupportPage() {
    const { user, activeWorkspace, loading } = useAuth();
    const router = useRouter();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoadingTickets, setIsLoadingTickets] = useState(true);

    const fetchTickets = useCallback(async () => {
        if (!user || !activeWorkspace) return;
        setIsLoadingTickets(true);
        try {
            const userTickets = await getTicketsForUser(user.uid, activeWorkspace.id);
            setTickets(userTickets);
        } catch (error) {
            console.error("Failed to fetch tickets:", error);
        } finally {
            setIsLoadingTickets(false);
        }
    }, [user, activeWorkspace]);

    useEffect(() => {
        if (!loading && user && activeWorkspace) {
            fetchTickets();
        } else if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, activeWorkspace, fetchTickets, router]);

    const getStatusVariant = (status: SupportTicket['status']) => {
        switch (status) {
            case 'aberto': return 'destructive';
            case 'em_andamento': return 'default';
            case 'fechado': return 'secondary';
            default: return 'outline';
        }
    }

    if (loading || isLoadingTickets) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="flex flex-col min-h-screen">
             <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 font-semibold text-lg">
                    <Logo className="h-6 w-6 text-primary" />
                    <h1>Meus Chamados</h1>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => router.push('/account')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Minha Conta
                    </Button>
                </div>
              </header>

            <main className="flex-grow p-6 bg-muted/40">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Meus Chamados de Suporte</h1>
                            <p className="text-muted-foreground">Acompanhe o andamento dos seus chamados aqui.</p>
                        </div>
                        <TicketForm onTicketCreated={fetchTickets} />
                    </div>

                    <div className="space-y-4">
                        {tickets.length === 0 ? (
                            <div className="text-center py-16 border-dashed border-2 rounded-lg">
                                <MessageSquare size={48} className="mx-auto text-muted-foreground" />
                                <h3 className="mt-4 text-xl font-semibold">Nenhum chamado aberto</h3>
                                <p className="mt-2 text-muted-foreground">Clique no botão acima para abrir seu primeiro chamado.</p>
                            </div>
                        ) : (
                            tickets.map(ticket => (
                                <Card 
                                    key={ticket.id} 
                                    className="cursor-pointer hover:border-primary transition-colors"
                                    onClick={() => router.push(`/admin/support/${ticket.id}`)} // Reusing admin page for user view for simplicity
                                >
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg">{ticket.title}</CardTitle>
                                            <Badge variant={getStatusVariant(ticket.status)} className="capitalize">{ticket.status.replace('_', ' ')}</Badge>
                                        </div>
                                        <CardDescription>
                                            Aberto em: {ticket.createdAt ? format(ticket.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : '...'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="line-clamp-2 text-sm">{ticket.description}</p>
                                    </CardContent>
                                    <CardFooter>
                                         <Badge variant="outline" className="capitalize">{ticket.category}</Badge>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

