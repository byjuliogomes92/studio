
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight } from 'lucide-react';
import { getAllTicketsForAdmin } from '@/lib/firestore';
import type { SupportTicket } from '@/lib/types';
import { format } from 'date-fns';

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            const allTickets = await getAllTicketsForAdmin();
            setTickets(allTickets);
        } catch (error) {
            console.error("Failed to fetch tickets:", error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os chamados de suporte.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const getStatusVariant = (status: SupportTicket['status']) => {
        switch (status) {
            case 'aberto': return 'destructive';
            case 'em_andamento': return 'default';
            case 'fechado': return 'secondary';
            default: return 'outline';
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Painel de Suporte</h1>
                <p className="text-muted-foreground">Visualize e gerencie todos os chamados de suporte abertos pelos usuários.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Todos os Chamados</CardTitle>
                    <CardDescription>
                        Clique em um chamado para ver os detalhes e responder.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : tickets.length === 0 ? (
                        <p className="text-muted-foreground text-center">Nenhum chamado de suporte encontrado.</p>
                    ) : (
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Usuário</TableHead>
                                        <TableHead>Última Atualização</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tickets.map(ticket => (
                                        <TableRow 
                                            key={ticket.id} 
                                            className="cursor-pointer"
                                            onClick={() => router.push(`/admin/support/${ticket.id}`)}
                                        >
                                            <TableCell>
                                                <Badge variant={getStatusVariant(ticket.status)} className="capitalize">{ticket.status.replace('_', ' ')}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{ticket.title}</TableCell>
                                            <TableCell>{ticket.userName} ({ticket.userEmail})</TableCell>
                                            <TableCell>{ticket.updatedAt?.toDate ? format(ticket.updatedAt.toDate(), 'dd/MM/yyyy HH:mm') : '...'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon">
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
