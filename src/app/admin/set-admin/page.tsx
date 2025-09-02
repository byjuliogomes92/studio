
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SetAdminPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSetAdmin = async () => {
        if (!email) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, insira um e-mail.' });
            return;
        }
        setIsLoading(true);
        try {
            const functions = getFunctions();
            const setAdminClaim = httpsCallable(functions, 'setAdminClaim');
            const result = await setAdminClaim({ email });
            
            toast({
                title: 'Sucesso!',
                description: (result.data as any).message || 'Permissão de administrador concedida.',
            });
            setEmail('');
        } catch (error: any) {
            console.error("Failed to set admin claim:", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao definir permissão',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-xl">
            <h1 className="text-3xl font-bold mb-6">Tornar Usuário Administrador</h1>
            <Alert className="mb-6">
                <AlertTitle>Importante!</AlertTitle>
                <AlertDescription>
                    Esta é uma ferramenta de desenvolvimento. Use-a para conceder permissões de administrador à sua própria conta para acessar o painel. Após o uso, faça logout e login novamente para que as alterações entrem em vigor.
                </AlertDescription>
            </Alert>
            <Card>
                <CardHeader>
                    <CardTitle>Conceder Permissão de Admin</CardTitle>
                    <CardDescription>
                        Digite o e-mail do usuário que você deseja tornar um administrador da plataforma.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail do Usuário</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="usuario@exemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <Button onClick={handleSetAdmin} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Tornar Administrador
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
