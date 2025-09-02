
"use client"

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarGroupLabel, useSidebar } from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { BarChart, Bell, Home, Settings, Users, LogOut, Loader2, ShieldQuestion, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';


function AdminSidebar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { state: sidebarState } = useSidebar();

    const userInitials = user?.displayName?.split(' ').map(n => n[0]).join('') || user?.email?.[0].toUpperCase() || 'A';
    
    const navItems = [
      { type: 'label', label: 'Visão Geral' },
      { path: '/admin', icon: BarChart, label: 'Dashboard' },
      { type: 'label', label: 'Gerenciamento' },
      { path: '/admin/users', icon: Users, label: 'Usuários' },
      { path: '/admin/support', icon: MessageSquare, label: 'Suporte' },
      { path: '/admin/notifications', icon: Bell, label: 'Notificações' },
      { path: '/admin/settings', icon: Settings, label: 'Configurações' },
      { type: 'label', label: 'Ferramentas' },
      { path: '/admin/set-admin', icon: ShieldQuestion, label: 'Tornar Admin' }
    ];

    return (
        <Sidebar>
            <SidebarHeader>
                <div className={cn("flex items-center gap-2", sidebarState === 'collapsed' && 'justify-center')}>
                    <Logo className="size-7 text-primary" />
                    <h1 className={cn("text-lg font-semibold", sidebarState === 'collapsed' && 'sr-only')}>Admin</h1>
                </div>
                 <SidebarTrigger />
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {navItems.map((item, index) => {
                       if (item.type === 'label') {
                           return <SidebarGroupLabel key={`label-${index}`}>{sidebarState === 'expanded' ? item.label : '—'}</SidebarGroupLabel>;
                       }
                       return (
                           <SidebarMenuItem key={item.path}>
                                <SidebarMenuButton 
                                    onClick={() => router.push(item.path!)} 
                                    tooltip={item.label}
                                    isActive={pathname === item.path || (pathname.startsWith(item.path!) && item.path !== '/admin')}
                                >
                                    <item.icon />
                                    <span>{item.label}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                       )
                    })}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => router.push('/')} tooltip="Voltar ao App">
                            <Home />
                            <span>Voltar ao App</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <div className={cn("flex items-center gap-3 p-2", sidebarState === 'collapsed' && "justify-center")}>
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'Avatar'} />
                                <AvatarFallback>{userInitials}</AvatarFallback>
                            </Avatar>
                            <div className={cn("flex flex-col truncate", sidebarState === 'collapsed' && "hidden")}>
                                <span className="text-sm font-semibold truncate">{user?.displayName}</span>
                                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                     <button className={cn("ml-auto text-muted-foreground hover:text-foreground", sidebarState === 'collapsed' && "hidden")}>
                                        <LogOut className="h-5 w-5"/>
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Você será desconectado da sua conta de administrador.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={logout} className="bg-destructive hover:bg-destructive/90">Sair</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/'); 
      return;
    }
    
    // The set-admin page is a special case that doesn't require the user to be an admin already.
    if (pathname === '/admin/set-admin') {
      setIsAdmin(true);
      setIsVerifying(false);
      return;
    }

    user.getIdTokenResult(true).then((idTokenResult) => {
      if (idTokenResult.claims.admin) {
        setIsAdmin(true);
      } else {
        router.replace('/'); 
      }
      setIsVerifying(false);
    });

  }, [user, authLoading, router, pathname]);


  if (isVerifying || !isAdmin) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
             <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p>Verificando permissões...</p>
             </div>
        </div>
    );
  }

  return (
    <SidebarProvider>
        <div className="flex">
            <AdminSidebar />
            <main className="flex-1 p-6 bg-muted/40">
                {children}
            </main>
        </div>
    </SidebarProvider>
  )
}
