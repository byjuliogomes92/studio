
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Loader2, ArrowLeft, Building2, User as UserIcon, Briefcase } from "lucide-react";
import { Logo } from "@/components/icons";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { UserProfileType } from "@/lib/types";


function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="24px"
        height="24px"
        {...props}
      >
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        />
        <path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.37,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        />
      </svg>
    );
}

const profileOptions: { type: UserProfileType, icon: React.ElementType, title: string, description: string }[] = [
    { type: 'owner', icon: Building2, title: "Dono(a) ou gestor(a) de agência", description: "Crie um workspace para sua equipe e clientes." },
    { type: 'employee', icon: Briefcase, title: "Trabalho em uma agência", description: "Junte-se a um workspace existente." },
    { type: 'freelancer', icon: UserIcon, title: "Profissional independente", description: "Use a plataforma para seus próprios projetos." },
];

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profileType, setProfileType] = useState<UserProfileType>('owner');
  const [companyName, setCompanyName] = useState("");

  const { signup, loginWithGoogle } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await signup(email, password, firstName, lastName, profileType, companyName);
      router.push("/");
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha no cadastro",
        description: error.message || "Por favor, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Note: Google login will not have the profile type selection.
    // It will default to the 'freelancer' flow in the useAuth hook.
    setIsLoading(true);
    try {
        await loginWithGoogle();
        router.push("/");
    } catch (error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Falha no cadastro com Google",
            description: error.message || "Não foi possível autenticar com o Google. Tente novamente.",
        });
    } finally {
        setIsLoading(false);
    }
  }


  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
       <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[450px] gap-6">
            <div className="grid gap-2 text-center">
            <Logo className="mx-auto h-auto text-primary mb-4" />
                <h1 className="text-3xl font-bold">Crie sua Conta</h1>
                <p className="text-balance text-muted-foreground">
                    É rápido e fácil. Comece a construir suas páginas agora mesmo.
                </p>
            </div>
            <div className="grid gap-6">
                <form onSubmit={handleSignup} className="space-y-6">
                    <div className="space-y-4">
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
                        <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                        </div>
                        <div className="grid gap-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <Label>Qual perfil você se identifica?</Label>
                        <RadioGroup value={profileType} onValueChange={(value: UserProfileType) => setProfileType(value)} className="grid grid-cols-1 gap-3">
                            {profileOptions.map(({ type, icon: Icon, title, description }) => (
                                <Label
                                key={type}
                                htmlFor={`profile-${type}`}
                                className={cn(
                                    "flex items-center gap-4 rounded-lg border-2 p-4 cursor-pointer transition-all",
                                    "hover:bg-accent/50 hover:border-primary/50",
                                    profileType === type && "border-primary bg-primary/5"
                                )}
                            >
                                <RadioGroupItem value={type} id={`profile-${type}`} className="sr-only" />
                                <Icon className={cn("h-8 w-8 text-muted-foreground", profileType === type && "text-primary")} />
                                <div>
                                    <h4 className="font-semibold">{title}</h4>
                                    <p className="text-sm text-muted-foreground">{description}</p>
                                </div>
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
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Quero me Cadastrar"}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                        OU
                        </span>
                    </div>
                </div>
                
                <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <GoogleIcon className="mr-2 h-5 w-5" />
                            Cadastre-se com Google
                        </>
                    )}
                </Button>

            </div>
            <div className="mt-4 text-center text-sm">
                Já possui uma conta?{" "}
                <Link href="/login" className="underline">
                Fazer Login
                </Link>
            </div>
             <div className="mt-6 text-center text-sm">
            <Link href="https://cloudpagestudio.vercel.app" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://picsum.photos/1920/1080"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          data-ai-hint="abstract technology"
        />
      </div>
    </div>
  );
}
