
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getTicketById, addTicketComment, getTicketComments, updateTicketStatus } from '@/lib/firestore';
import type { SupportTicket, TicketComment, TicketStatus } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function TicketDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const ticketId = params.ticketId as string;
    
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [comments, setComments] = useState<TicketComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const isAdmin = user?.email?.endsWith('@cloudpagestudio.app'); // Simple admin check
    const commentsEndRef = useRef<HTMLDivElement>(null);


    const fetchTicketAndComments = useCallback(async () => {
        if (!ticketId) return;
        try {
            const fetchedTicket = await getTicketById(ticketId);
            const fetchedComments = await getTicketComments(ticketId);
            setTicket(fetchedTicket);
            setComments(fetchedComments);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar o chamado.' });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [ticketId, toast]);

    useEffect(() => {
        if (!authLoading) {
            fetchTicketAndComments();
        }
    }, [authLoading, fetchTicketAndComments]);

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);


    const handleAddComment = async () => {
        if (!newComment.trim() || !user || !ticket) return;
        setIsSubmitting(true);
        try {
            await addTicketComment({
                ticketId: ticket.id,
                userId: user.uid,
                userName: user.displayName || 'Usuário',
                userAvatarUrl: user.photoURL || '',
                comment: newComment,
            }, isAdmin ? 'admin' : 'user');
            setNewComment('');
            fetchTicketAndComments(); // Refetch to get the new comment
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro ao enviar', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleStatusChange = async (newStatus: TicketStatus) => {
        if (!ticket || !user) return;
        setIsUpdatingStatus(true);
        try {
            await updateTicketStatus(ticket.id, newStatus, user.uid);
            setTicket(prev => prev ? { ...prev, status: newStatus } : null);
            toast({ title: 'Status do chamado atualizado!' });
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Erro ao atualizar status', description: error.message });
        } finally {
            setIsUpdatingStatus(false);
        }
    }
    
    const getStatusIcon = (status: TicketStatus) => {
        switch(status) {
            case 'aberto': return <XCircle className="h-5 w-5 text-red-500" />;
            case 'em_andamento': return <Clock className="h-5 w-5 text-blue-500" />;
            case 'fechado': return <CheckCircle className="h-5 w-5 text-green-500" />;
            default: return null;
        }
    };

    const getStatusVariant = (status: TicketStatus): "destructive" | "default" | "secondary" | "outline" => {
        switch (status) {
            case 'aberto': return 'destructive';
            case 'em_andamento': return 'default';
            case 'fechado': return 'secondary';
            default: return 'outline';
        }
    };


    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!ticket) {
        return <div className="text-center">Chamado não encontrado.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
             <Button variant="outline" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Button>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">{ticket.title}</CardTitle>
                            <CardDescription>
                                Aberto por {ticket.userName} ({ticket.userEmail}) em {ticket.createdAt ? format(ticket.createdAt.toDate(), 'dd/MM/yyyy') : '...'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap">{ticket.description}</p>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Histórico de Comentários</h3>
                        {comments.map((comment, index) => (
                            <div key={comment.id} className={cn("flex items-start gap-4", comment.userId === user?.uid ? "justify-end" : "")}>
                                {comment.userId !== user?.uid && (
                                     <Avatar className="h-10 w-10">
                                        <AvatarImage src={comment.userAvatarUrl} />
                                        <AvatarFallback>{comment.userName?.[0] || '?'}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("max-w-md rounded-lg p-3", comment.userId === user?.uid ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                    <p className="text-sm font-bold mb-1">{comment.userName}</p>
                                    <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
                                     <p className={cn("text-xs mt-2", comment.userId === user?.uid ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                        {formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true, locale: ptBR })}
                                    </p>
                                </div>
                                {comment.userId === user?.uid && (
                                     <Avatar className="h-10 w-10">
                                        <AvatarImage src={comment.userAvatarUrl} />
                                        <AvatarFallback>{comment.userName?.[0] || '?'}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        <div ref={commentsEndRef} />
                    </div>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalhes do Chamado</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                             <div className="flex justify-between items-center">
                                <Label>Status</Label>
                                <div className="flex items-center gap-2">
                                     {getStatusIcon(ticket.status)}
                                    {isAdmin ? (
                                         <Select value={ticket.status} onValueChange={(value: TicketStatus) => handleStatusChange(value)} disabled={isUpdatingStatus}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="aberto">Aberto</SelectItem>
                                                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                                                <SelectItem value="fechado">Fechado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                         <Badge variant={getStatusVariant(ticket.status)} className="capitalize">{ticket.status.replace('_', ' ')}</Badge>
                                    )}
                                </div>
                            </div>
                             <div className="flex justify-between items-center">
                                <Label>Categoria</Label>
                                <Badge variant="outline" className="capitalize">{ticket.category}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Adicionar Comentário</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Textarea 
                                value={newComment} 
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Digite sua resposta ou observação aqui..."
                                rows={5}
                                disabled={isSubmitting}
                            />
                             <Button onClick={handleAddComment} disabled={isSubmitting || !newComment.trim()} className="w-full">
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Enviar
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
