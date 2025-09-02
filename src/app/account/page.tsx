
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Trash2, Home, RefreshCw, Plus, UserX, User, ShieldCheck, Save, Copy, Users, Activity, Settings, EyeOff, Search } from 'lucide-react';
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
import { getWorkspaceMembers, removeUserFromWorkspace, updateUserRole, inviteUserToWorkspace, getActivityLogsForWorkspace } from '@/lib/firestore';
import type { WorkspaceMember, WorkspaceMemberRole, ActivityLog } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';


function MemberManagement({ activeWorkspace, user, members, fetchMembers }: { activeWorkspace: any; user: any; members: WorkspaceMember[]; fetchMembers: () => void }) {
    const { toast } = useToast();
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<WorkspaceMemberRole>("editor");
    const [isInviting, setIsInviting] = useState(false);

    const currentUserRole = activeWorkspace ? members.find(m => m.userId === user?.uid)?.role : undefined;
    const isOwner = currentUserRole === 'owner';
    
    const handleInviteUser = async () => {
        if (!activeWorkspace || !inviteEmail) {
            toast({ variant: 'destructive', title: 'Erro', description: 'O e-mail do convidado é obrigatório.' });
            return;
        }
        setIsInviting(true);
        try {
            await inviteUserToWorkspace(activeWorkspace.id, inviteEmail, inviteRole, user.displayName || user.email);
            toast({ title: 'Usuário adicionado!', description: `${inviteEmail} foi adicionado ao seu workspace.` });
            setInviteEmail('');
            fetchMembers(); // Re-fetch to get the newly added member (if they exist as a user)
        } catch (error: any) {
            console.error("Failed to add user:", error);
            toast({ variant: "destructive", title: "Erro ao adicionar", description: error.message });
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveUser = async (memberToRemove: WorkspaceMember) => {
        if (!activeWorkspace) return;
        try {
            await removeUserFromWorkspace(activeWorkspace.id, memberToRemove.userId, user, memberToRemove);
            toast({ title: 'Usuário removido!', description: `${memberToRemove.email || 'O membro'} foi removido do workspace.` });
            fetchMembers(); // Refresh member list
        } catch (error: any) {
            console.error("Failed to remove user:", error);
            toast({ variant: "destructive", title: "Erro ao remover", description: error.message });
        }
    };

    const handleRoleChange = async (memberId: string, newRole: WorkspaceMemberRole) => {
        if (!activeWorkspace) return;
        try {
            const memberToUpdate = members.find(m => m.userId === memberId);
            if (!memberToUpdate) return;
            await updateUserRole(activeWorkspace.id, memberId, newRole, user, memberToUpdate);
            toast({ title: 'Função atualizada!', description: `A função do membro foi alterada.` });
            fetchMembers();
        } catch (error: any) {
            console.error("Failed to update role:", error);
            toast({ variant: "destructive", title: "Erro ao atualizar função", description: error.message });
        }
    };

    return (
        <div className="space-y-6">
            {isOwner && (
                <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                    <h4 className="font-semibold mb-2">Adicionar Novo Membro</h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input 
                            type="email" 
                            placeholder="E-mail do membro" 
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
                            Adicionar
                        </Button>
                    </div>
                </div>
            )}
            
            <div>
                <h4 className="font-semibold mb-4">Membros Atuais</h4>
                 <div className="space-y-3">
                    {members.map(member => {
                        const isCurrentUser = member.userId === user.uid;
                        const memberName = isCurrentUser ? (user.displayName || user.email) : (member.email || "Usuário");
                        const memberAvatar = isCurrentUser ? user.photoURL : `https://api.dicebear.com/8.x/thumbs/svg?seed=${member.userId}`;
                        const memberInitial = (memberName?.[0] || 'U').toUpperCase();

                        return (
                            <div key={member.id} className="flex items-center justify-between p-3 rounded-md border">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={memberAvatar || ''} alt={memberName || 'Avatar'} />
                                        <AvatarFallback>{memberInitial}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{memberName}</p>
                                        <p className="text-sm text-muted-foreground capitalize">{isCurrentUser ? `Você (${member.role})` : member.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isOwner && !isCurrentUser ? (
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
                                                    Tem certeza que deseja remover {memberName} do workspace? Esta ação não pode ser desfeita.
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
                                        member.role === 'owner' && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <ShieldCheck className="h-4 w-4" />
                                                <span>Dono</span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

function ActivityLogDisplay({ activeWorkspace }: { activeWorkspace: any; }) {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!activeWorkspace) return;
        setLoadingLogs(true);
        getActivityLogsForWorkspace(activeWorkspace.id)
            .then(setLogs)
            .catch(err => {
                console.error("Failed to fetch activity logs:", err);
                toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar os logs de atividade.' });
            })
            .finally(() => setLoadingLogs(false));
    }, [activeWorkspace, toast]);
    
    const renderLogDetails = (log: ActivityLog) => {
        const { action, details } = log;
        switch (action) {
            case 'PROJECT_CREATED': return `criou o projeto "${details.projectName}"`;
            case 'PROJECT_DELETED': return `excluiu o projeto "${details.projectName}"`;
            case 'PAGE_CREATED': return `criou a página "${details.pageName}"`;
            case 'PAGE_DELETED': return `excluiu a página "${details.pageName}"`;
            case 'PAGE_PUBLISHED': return `publicou a página "${details.pageName}"`;
            case 'MEMBER_INVITED': return `convidou ${details.invitedEmail} como ${details.role}`;
            case 'MEMBER_REMOVED': return `removeu ${details.removedMemberEmail} do workspace`;
            case 'MEMBER_JOINED': return `juntou-se ao workspace`;
            case 'MEMBER_ROLE_CHANGED': return `alterou a função de ${details.memberName} para ${details.newRole}`;
            case 'WORKSPACE_RENAMED': return `renomeou o workspace para "${details.newName}"`;
            default: return `realizou uma ação desconhecida.`;
        }
    };

    if (loadingLogs) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (logs.length === 0) {
        return <p className="text-center text-muted-foreground p-8">Nenhuma atividade registrada ainda.</p>;
    }

    return (
        <div className="space-y-4">
            {logs.map(log => (
                <div key={log.id} className="flex items-start gap-4 p-3 border-b">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={log.userAvatarUrl || ''} />
                        <AvatarFallback>{log.userName?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <p className="text-sm">
                            <span className="font-semibold">{log.userName}</span> {renderLogDetails(log)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {log.timestamp?.toDate ? format(log.timestamp.toDate(), "dd/MM/yyyy 'às' HH:mm") : '...'}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}


export default function AccountPage() {
  const { user, loading, logout, updateUserAvatar, isUpdatingAvatar, activeWorkspace, updateWorkspaceName, updateUserName } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [wantsCommunications, setWantsCommunications] = useState(true);

  // Profile management state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  // Workspace management state
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [isSavingWorkspaceName, setIsSavingWorkspaceName] = useState(false);
  
  useEffect(() => {
    if (user?.displayName) {
        const nameParts = user.displayName.split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
    }
  }, [user?.displayName]);

  const hasNameChanged = (user?.displayName || '') !== `${firstName} ${lastName}`.trim();

  const handleUpdateUserName = async () => {
    if (!hasNameChanged) return;
    setIsSavingName(true);
    try {
        await updateUserName(firstName, lastName);
        toast({ title: 'Nome atualizado!', description: 'Seu nome foi alterado com sucesso.' });
    } catch (error: any) {
        console.error("Failed to update name:", error);
        toast({ variant: "destructive", title: "Erro ao salvar nome", description: error.message });
    } finally {
        setIsSavingName(false);
    }
  };
  
  useEffect(() => {
    if (activeWorkspace) {
        setWorkspaceName(activeWorkspace.name);
    }
  }, [activeWorkspace]);


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
    if(activeWorkspace) {
        fetchMembers();
    }
  }, [activeWorkspace, fetchMembers]);

  const handleUpdateWorkspaceName = async () => {
    if (!activeWorkspace || !workspaceName.trim()) {
        toast({ variant: 'destructive', title: 'Erro', description: 'O nome do workspace não pode ser vazio.' });
        return;
    }
    setIsSavingWorkspaceName(true);
    try {
        await updateWorkspaceName(activeWorkspace.id, workspaceName);
        toast({ title: 'Workspace atualizado!', description: 'O nome do seu workspace foi alterado.' });
    } catch (error: any) {
        console.error("Failed to update workspace name:", error);
        toast({ variant: "destructive", title: "Erro ao renomear", description: error.message });
    } finally {
        setIsSavingWorkspaceName(false);
    }
  };

  const handleDeleteAccount = () => {
    // This is a placeholder. A real implementation would require a backend function
    // to delete all user data across all collections.
    setIsDeleting(true);
    toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A exclusão de contas será implementada em breve.",
    });
    setTimeout(() => setIsDeleting(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // This should ideally not be reached due to the AuthProvider redirect, but it's a good fallback.
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
          <Button variant="outline" size="sm" onClick={() => {
                const input = document.querySelector('.cmdk-input') as HTMLInputElement;
                input?.focus();
                document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'k', 'metaKey': true}));
            }}>
                <Search className="mr-2 h-4 w-4"/>
                Buscar...
                <kbd className="pointer-events-none ml-4 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
             </Button>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/')}>
                <Home className="mr-2 h-4 w-4" />
                Voltar aos Projetos
            </Button>
        </div>
      </header>
      <div className="space-y-6 max-w-4xl mx-auto py-10 px-4">
        <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile"><Settings className="mr-2 h-4 w-4" />Perfil e Workspace</TabsTrigger>
                <TabsTrigger value="activity"><Activity className="mr-2 h-4 w-4" />Atividades do Workspace</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
                <Card>
                <CardHeader>
                    <CardTitle>Perfil</CardTitle>
                    <CardDescription>Suas informações pessoais.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Avatar do usuário'} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" onClick={updateUserAvatar} disabled={isUpdatingAvatar}>
                            {isUpdatingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Gerar Novo Avatar
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Nome</Label>
                                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isSavingName} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Sobrenome</Label>
                                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isSavingName} />
                            </div>
                        </div>
                        <Button onClick={handleUpdateUserName} disabled={isSavingName || !hasNameChanged}>
                            {isSavingName ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Salvar Nome
                        </Button>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                    <Label htmlFor="email">Email (não pode ser alterado)</Label>
                    <Input id="email" value={user.email || ''} disabled />
                    </div>
                </CardContent>
                </Card>

                {activeWorkspace && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Workspace: {activeWorkspace.name}</CardTitle>
                            <CardDescription>Gerencie o nome e os membros do seu workspace.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Renomear Workspace</h4>
                                    <div className="flex items-center gap-2">
                                        <Input 
                                            id="workspace-name"
                                            value={workspaceName}
                                            onChange={(e) => setWorkspaceName(e.target.value)}
                                            disabled={isSavingWorkspaceName}
                                        />
                                        <Button onClick={handleUpdateWorkspaceName} disabled={isSavingWorkspaceName || workspaceName === activeWorkspace.name}>
                                        {isSavingWorkspaceName ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Salvar
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {isLoadingMembers ? (
                                <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
                            ) : (
                                <MemberManagement 
                                    activeWorkspace={activeWorkspace}
                                    user={user}
                                    members={members}
                                    fetchMembers={fetchMembers}
                                />
                            )}
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
            </TabsContent>
            <TabsContent value="activity">
                <Card>
                    <CardHeader>
                        <CardTitle>Log de Atividades</CardTitle>
                        <CardDescription>Veja as ações recentes realizadas neste workspace.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {activeWorkspace && <ActivityLogDisplay activeWorkspace={activeWorkspace} />}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
