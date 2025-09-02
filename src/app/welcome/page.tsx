
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, User as UserIcon, Briefcase, RefreshCw } from "lucide-react";
import { Logo } from "@/components/icons";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { UserProfileType } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { completeGoogleSignup } from "@/lib/firestore";


const profileOptions: { type: UserProfileType, icon: React.ElementType, title: string, description: string }[] = [
    { type: 'owner', icon: Building2, title: "Dono(a) ou gestor(a) de agência", description: "Crie um workspace para sua equipe e clientes." },
    { type: 'employee', icon: Briefcase, title: "Trabalho em uma empresa/agência", description: "Junte-se a um workspace existente." },
    { type: 'freelancer', icon: UserIcon, title: "Profissional independente", description: "Use a plataforma para seus próprios projetos." },
];

export default function WelcomePage() {
  const { user, loading: authLoading, updateUserAvatar, isUpdatingAvatar, reloadWorkspaces } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileType, setProfileType] = useState<UserProfileType>('owner');
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        // Not logged in, shouldn't be here
        router.push('/login');
        return;
    }
    
    // Pre-fill name from Google account
    if (user.displayName) {
        const nameParts = user.displayName.split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!firstName || !lastName) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, preencha seu nome e sobrenome.' });
        return;
    }
    if (profileType === 'owner' && !companyName.trim()) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, insira o nome da sua empresa.' });
        return;
    }

    setIsLoading(true);
    try {
        await completeGoogleSignup({
            user,
            firstName,
            lastName,
            profileType,
            companyName
        });
        
        toast({ title: "Cadastro completo!", description: "Bem-vindo(a) à plataforma!" });
        
        // Force a reload of workspaces and then redirect
        await reloadWorkspaces();
        router.push("/");

    } catch (error: any) {
        console.error("Failed to complete signup:", error);
        toast({
            variant: "destructive",
            title: "Falha ao completar cadastro",
            description: error.message || "Por favor, tente novamente.",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  if (authLoading || !user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }
  
  const userInitials = user.displayName?.split(' ').map(n => n[0]).join('') || user.email?.[0].toUpperCase() || 'U';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
            <Logo className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-3xl font-bold">Quase lá! Complete seu cadastro.</h1>
            <p className="text-balance text-muted-foreground mt-2">
                Precisamos de mais algumas informações para personalizar sua experiência.
            </p>
        </div>
        
        <Card>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Avatar do usuário'} />
                                <AvatarFallback>{userInitials}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <p className="font-semibold">{user.email}</p>
                                <Button variant="outline" type="button" onClick={updateUserAvatar} disabled={isUpdatingAvatar}>
                                    {isUpdatingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                    Gerar Novo Avatar
                                </Button>
                            </div>
                        </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first-name">Nome</Label>
                                <Input id="first-name" placeholder="Seu nome" required disabled={isLoading} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="last-name">Sobrenome</Label>
                                <Input id="last-name" placeholder="Seu sobrenome" required disabled={isLoading} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <Label>Qual perfil você se identifica?</Label>
                        <RadioGroup value={profileType} onValueChange={(value: UserProfileType) => setProfileType(value)} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {profileOptions.map(({ type, icon: Icon, title }) => (
                                <Label
                                key={type}
                                htmlFor={`profile-${type}`}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all text-center",
                                    "hover:bg-accent/50 hover:border-primary/50",
                                    profileType === type && "border-primary bg-primary/5"
                                )}
                            >
                                <RadioGroupItem value={type} id={`profile-${type}`} className="sr-only" />
                                <Icon className={cn("h-8 w-8 text-muted-foreground", profileType === type && "text-primary")} />
                                <h4 className="font-semibold text-sm">{title}</h4>
                            </Label>
                            ))}
                        </RadioGroup>

                        {profileType === 'owner' && (
                            <div className="grid gap-2 pt-2 animate-in fade-in-50">
                                <Label htmlFor="company-name">Nome da empresa/agência</Label>
                                <Input 
                                    id="company-name" 
                                    placeholder="Ex: Agência Criativa" 
                                    required 
                                    disabled={isLoading} 
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)} 
                                />
                            </div>
                        )}
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Completar Cadastro"}
                    </Button>
                </form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
