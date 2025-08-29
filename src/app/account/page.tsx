
"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Trash2, Home } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/icons';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [wantsCommunications, setWantsCommunications] = useState(true); // Placeholder state

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // In a real app, you would need to re-authenticate the user first
      // for security reasons before calling user.delete().
      // This is a placeholder for the UI.
      await user?.delete();
      toast({ title: "Conta excluída", description: "Sua conta foi excluída permanentemente." });
      await logout();
    } catch (error: any) {
      console.error("Account deletion error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir conta",
        description: error.message || "Por favor, tente novamente. Pode ser necessário fazer login novamente.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Você precisa estar logado para ver esta página.</p>
      </div>
    );
  }

  return (
    <>
     <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Logo className="h-6 w-6 text-primary" />
            <h1>Minha Conta</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/')}>
                <Home className="mr-2 h-4 w-4" />
                Voltar aos Projetos
            </Button>
        </div>
      </header>
      <div className="space-y-6 max-w-4xl mx-auto py-10 px-4">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as informações e preferências da sua conta.</p>
        </div>
        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Suas informações pessoais. Para alterá-las, entre em contato com o suporte.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={user.displayName || 'Não definido'} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email || ''} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferências de Comunicação</CardTitle>
            <CardDescription>Escolha como você gostaria de interagir conosco.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
                <Label htmlFor="communications" className="flex flex-col space-y-1">
                  <span>Receber novidades e atualizações</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Receba e-mails sobre novas funcionalidades, dicas e promoções.
                  </span>
                </Label>
                <Switch
                  id="communications"
                  checked={wantsCommunications}
                  onCheckedChange={setWantsCommunications}
                  aria-label="Receber comunicações"
                />
              </div>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
            <CardDescription>Essas ações são permanentes e não podem ser desfeitas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Excluir sua conta</p>
                <p className="text-sm text-muted-foreground">
                  Isso excluirá permanentemente sua conta e todos os seus dados.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir Conta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Todos os seus projetos e páginas serão excluídos permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sim, excluir minha conta
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
