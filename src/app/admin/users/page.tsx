
"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2, User, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface PlatformUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    disabled: boolean;
    creationTime: string;
    lastSignInTime: string;
    isAdmin: boolean;
}

export default function UsersPage() {
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const functions = getFunctions();
                const getAllUsers = httpsCallable(functions, 'getAllUsers');
                const result = await getAllUsers();
                setUsers(result.data as PlatformUser[]);
            } catch (error: any) {
                console.error("Failed to fetch users:", error);
                toast({
                    variant: 'destructive',
                    title: 'Erro ao buscar usuários',
                    description: error.message,
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [toast]);

    return (
        <div className="max-w-7xl">
            <h1 className="text-3xl font-bold mb-6">Gerenciamento de Usuários</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Usuários Cadastrados</CardTitle>
                    <CardDescription>
                        Lista de todos os usuários registrados na plataforma.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Usuário</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Criado em</TableHead>
                                    <TableHead>Último Login</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => {
                                     const userInitials = user.displayName?.split(' ').map(n => n[0]).join('') || user.email?.[0].toUpperCase() || 'U';
                                    return (
                                        <TableRow key={user.uid}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={user.photoURL} alt={user.displayName} />
                                                        <AvatarFallback>{userInitials}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{user.displayName}</p>
                                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.isAdmin ? (
                                                    <Badge>
                                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                                        Admin
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        <User className="mr-2 h-4 w-4" />
                                                        Usuário
                                                    </Badge>
                                                )}
                                                {user.disabled && <Badge variant="destructive" className="ml-2">Desativado</Badge>}
                                            </TableCell>
                                            <TableCell>{format(new Date(user.creationTime), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>{format(new Date(user.lastSignInTime), 'dd/MM/yyyy, HH:mm')}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

