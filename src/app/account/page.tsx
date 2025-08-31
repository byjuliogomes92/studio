
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Trash2, Home, RefreshCw, Plus, UserX, User, ShieldCheck } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getWorkspaceMembers, inviteUserToWorkspace, removeUserFromWorkspace, updateUserRole } from '@/lib/firestore';
import type { WorkspaceMember, WorkspaceMemberRole } from '@/lib/types';


export default function AccountPage() {
  const { user, loading, logout, updateUserAvatar, isUpdatingAvatar, activeWorkspace, workspaces, switchWorkspace } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [wantsCommunications, setWantsCommunications] = useState(true);

  // Workspace management state
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceMemberRole>("editor");
  const [isInviting, setIsInviting] = useState(false);

  const currentUserRole = members.find(m => m.userId === user?.uid)?.role;
  const isOwner = currentUserRole === 'owner';

  const fetchMembers = useCallback(async () => {
    if (!activeWorkspace) return;
    setIsLoadingMembers(true);
    try {
      const workspaceMembers = await getWorkspaceMembers(activeWorkspace.id);
      setMembers(workspaceMembers);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os membros do workspace." });
    } finally {
      setIsLoadingMembers(false);
    }
  }, [activeWorkspace, toast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);
  
  const handleInviteUser = async () => {
    if (!activeWorkspace || !inviteEmail) {
        toast({ variant: 'destructive', title: 'Erro', description: 'O e-mail do convidado é obrigatório.' });
        return;
    }
    setIsInviting(true);
    try {
        await inviteUserToWorkspace(activeWorkspace.id, inviteEmail, inviteRole);
        toast({ title: 'Usuário convidado!', description: `${inviteEmail} foi convidado para o workspace.` });
        setInviteEmail('');
        fetchMembers(); // Refresh member list
    } catch (error: any) {
        console.error("Failed to invite user:", error);
        toast({ variant: "destructive", title: "Erro ao convidar", description: error.message });
    } finally {
        setIsInviting(false);
    }
  };
  
  const handleRemoveUser = async (memberToRemove: WorkspaceMember) => {
    if (!activeWorkspace) return;
    try {
        await removeUserFromWorkspace(activeWorkspace.id, memberToRemove.userId);
        toast({ title: 'Usuário removido!', description: `${memberToRemove.email} foi removido do workspace.` });
        fetchMembers(); // Refresh member list
    } catch (error: any) {
        console.error("Failed to remove user:", error);
        toast({ variant: "destructive", title: "Erro ao remover", description: error.message });
    }
  };

  const handleRoleChange = async (memberId: string, newRole: WorkspaceMemberRole) => {
    if (!activeWorkspace) return;
    try {
      await updateUserRole(activeWorkspace.id, memberId, newRole);
      toast({ title: 'Função atualizada!', description: `A função do membro foi alterada.` });
      fetchMembers();
    } catch (error: any) {
        console.error("Failed to update role:", error);
        toast({ variant: "destructive", title: "Erro ao atualizar função", description: error.message });
    }
  }


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
  
  const userInitials = user.displayName?.split(' ').map(n => n[0]).join('') || user.email?.[0].toUpperCase() || 'U';


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
             <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Avatar do usuário'} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" value={user.displayName || 'Não definido'} disabled />
                    </div>
                </div>
                 <Button variant="outline" onClick={updateUserAvatar} disabled={isUpdatingAvatar}>
                    {isUpdatingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Gerar Novo Avatar
                </Button>
             </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email || ''} disabled />
            </div>
             <div className="space-y-2">
              <Label htmlFor="workspace">Workspace Ativo</Label>
               <Select onValueChange={switchWorkspace} value={activeWorkspace?.id}>
                  <SelectTrigger>
                      <SelectValue placeholder="Selecione um workspace..." />
                  </SelectTrigger>
                  <SelectContent>
                      {workspaces.map(ws => (
                          <SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
            </div>
          </CardContent>
        </Card>

        {activeWorkspace && (
             <Card>
                <CardHeader>
                    <CardTitle>Gerenciamento do Workspace</CardTitle>
                    <CardDescription>Convide e gerencie os membros do seu workspace "{activeWorkspace.name}".</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isOwner && (
                        <div className="p-4 border rounded-lg bg-muted/30">
                            <h4 className="font-semibold mb-2">Convidar Novo Membro</h4>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input 
                                    type="email" 
                                    placeholder="E-mail do convidado" 
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    className="flex-grow"
                                />
                                <Select value={inviteRole} onValueChange={value => setInviteRole(value as WorkspaceMemberRole)}>
                                    <SelectTrigger className="w-full sm:w-[120px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="editor">Editor</SelectItem>
                                        <SelectItem value="viewer">Visualizador</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleInviteUser} disabled={isInviting}>
                                    {isInviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                    Convidar
                                </Button>
                            </div>
                        </div>
                    )}
                    <div>
                        <h4 className="font-semibold mb-4">Membros Atuais</h4>
                         {isLoadingMembers ? (
                             <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
                         ) : (
                            <div className="space-y-3">
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-3 rounded-md border">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${member.userId}`} alt={member.email} />
                                                <AvatarFallback>{member.email[0].toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.email}</p>
                                                <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isOwner && member.userId !== user.uid ? (
                                                <>
                                                 <Select value={member.role} onValueChange={(value) => handleRoleChange(member.userId, value as WorkspaceMemberRole)}>
                                                      <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                                                      <SelectContent>
                                                          <SelectItem value="owner">Dono</SelectItem>
                                                          <SelectItem value="editor">Editor</SelectItem>
                                                          <SelectItem value="viewer">Visualizador</SelectItem>
                                                      </SelectContent>
                                                  </Select>
                                                  <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                      <Button variant="destructive" size="icon"><UserX className="h-4 w-4" /></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                      <AlertDialogHeader>
                                                        <AlertDialogTitle>Remover Membro?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tem certeza que deseja remover {member.email} do workspace? Esta ação não pode ser desfeita.
                                                        </AlertDialogDescription>
                                                      </AlertDialogHeader>
                                                      <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleRemoveUser(member)}>Remover</AlertDialogAction>
                                                      </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                  </AlertDialog>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    {member.role === 'owner' && <ShieldCheck className="h-4 w-4" />}
                                                    <span>{member.role === 'owner' ? 'Dono' : 'Você'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                         )}
                    </div>
                </CardContent>
            </Card>
        )}

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
