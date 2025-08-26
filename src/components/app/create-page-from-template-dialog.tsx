
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Brand, Template, Project, CloudPage } from '@/lib/types';
import { getTemplates, getTemplate, addPage, getProjectsForUser, updateUserProgress } from '@/lib/firestore';
import { defaultTemplates } from '@/lib/default-templates';
import { cn } from '@/lib/utils';
import { FileText, Loader2, Server } from 'lucide-react';
import { produce } from 'immer';
import { Badge } from '@/components/ui/badge';

interface CreatePageFromTemplateDialogProps {
  trigger: React.ReactNode;
  templateId?: string; // Pre-selected template from templates page
  isDefaultTemplate?: boolean;
  projectId?: string; // Pre-selected project from project page
  onPageCreated?: () => void;
}

const getInitialPage = (name: string, projectId: string, userId: string, brand: Brand): Omit<CloudPage, 'id' | 'createdAt' | 'updatedAt'> => {
    const isAvon = brand === 'Avon';
  
    const naturaTheme = {
      backgroundColor: '#FFFFFF',
      backgroundImage: 'https://images.rede.natura.net/html/crm/campanha/20250819/44760-bg.png',
      themeColor: '#F4AB01',
      themeColorHover: '#e9a000',
      fontFamily: 'Roboto',
      customCss: '',
    };
  
    const avonTheme = {
      backgroundColor: '#E4004B',
      backgroundImage: 'https://images.rede.natura.net/html/crm/campanha/20250819/44760-bg.png',
      themeColor: '#000000',
      themeColorHover: '#333333',
      fontFamily: 'Roboto',
      customCss: '',
    }
    
    return {
      name: name,
      projectId,
      userId,
      brand,
      tags: ["Brasil"],
      meta: {
        title: `${brand} - ${name}`,
        faviconUrl: '', // Will be set by useEffect in CloudPageForge
        loaderImageUrl: '', // Will be set by useEffect in CloudPageForge
        redirectUrl: isAvon ? 'https://cloud.hello.avon.com/cadastroavonagradecimento' : 'https://www.natura.com.br/',
        dataExtensionKey: 'CHANGE-ME',
        metaDescription: `Página de campanha para ${brand}.`,
        metaKeywords: `${brand.toLowerCase()}, campanha, beleza`,
        tracking: {
          ga4: { enabled: false, id: '' },
          meta: { enabled: false, id: '' },
          linkedin: { enabled: false, id: '' }
        }
      },
      styles: isAvon ? avonTheme : naturaTheme,
      cookieBanner: {
        enabled: true,
        text: 'Utilizamos cookies para garantir que você tenha a melhor experiência em nosso site. Ao continuar, você concorda com o uso de cookies.',
        buttonText: 'Aceitar',
      },
      components: [
        { id: '1', type: 'Header', props: { logoUrl: '' } }, // Will be set by useEffect
        { id: '2', type: 'Banner', props: { imageUrl: 'https://images.rede.natura.net/html/crm/campanha/20250819/44760-banner-topo.png' } },
        { id: 'c1', type: 'Title', props: { text: 'Título da Sua Campanha Aqui', styles: { textAlign: 'center' } } },
        { id: 'c2', type: 'Paragraph', props: { text: 'Este é um ótimo lugar para descrever sua campanha. Fale sobre os benefícios, os produtos em destaque e o que os clientes podem esperar.' } },
        { id: 'c-button', type: 'Button', props: { text: 'Clique Aqui', href: '#', align: 'center' } },
        { 
          id: '3', 
          type: 'Form', 
          props: {
            fields: { name: true, email: true, phone: true, cpf: true, city: false, birthdate: false, optin: true },
            placeholders: { name: 'Nome', email: 'Email', phone: 'Telefone - Ex:(11) 9 9999-9999', cpf: 'CPF', birthdate: 'Data de Nascimento' },
            consentText: `Quero receber novidades e promoções da ${brand} e de outras empresas do Grupo Natura &Co...`,
            buttonText: 'Finalizar',
            buttonAlign: 'center',
            thankYouMessage: `<h2>Obrigado, {{NOME}}!</h2><p>Recebemos suas informações com sucesso.</p>`,
            cities: 'São Paulo\nRio de Janeiro\nBelo Horizonte\nSalvador\nFortaleza\nCuritiba\nManaus\nRecife\nPorto Alegre\nBrasília',
          } 
        },
        { 
          id: '4', 
          type: 'Footer', 
          props: { 
            footerText1: ``, // Will be set by useEffect
            footerText2: `...`,
            footerText3: `...`,
          } 
        },
      ],
    }
};

export function CreatePageFromTemplateDialog({ 
    trigger, 
    templateId, 
    isDefaultTemplate, 
    projectId, 
    onPageCreated 
}: CreatePageFromTemplateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [newPageName, setNewPageName] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<Brand>("Natura");
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(projectId);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(templateId || null);
  const [selectedTemplateIsDefault, setSelectedTemplateIsDefault] = useState<boolean>(!!isDefaultTemplate);
  const [isCreating, setIsCreating] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Determine initial step
    if (templateId) {
      setStep(2); // Template is pre-selected, go to step 2
    } else {
      setStep(1); // No template, start from template selection
    }
  }, [templateId]);
  
  useEffect(() => {
    if (isOpen && user) {
        if (!templateId) {
            getTemplates(user.uid).then(setUserTemplates);
        }
        if (!projectId) {
            getProjectsForUser(user.uid).then(({projects}) => setUserProjects(projects));
        }
    }
  }, [isOpen, user, templateId, projectId]);

  const resetState = () => {
    setIsOpen(false);
    setStep(templateId ? 2 : 1);
    setNewPageName("");
    setSelectedBrand("Natura");
    setSelectedProjectId(projectId);
    setSelectedTemplate(templateId || null);
    setSelectedTemplateIsDefault(!!isDefaultTemplate);
  };

  const handleNextStep = () => {
    if (!templateId) { // From project page flow
        if (!selectedTemplate) {
             toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione um template.' });
             return;
        }
    }
    setStep(2);
  };

  const handleConfirmCreatePage = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado." });
        return;
    }
    if (!selectedProjectId) {
         toast({ variant: "destructive", title: "Erro", description: "Por favor, selecione um projeto." });
        return;
    }
    if (newPageName.trim() === '') {
        toast({ variant: 'destructive', title: 'Erro', description: 'O nome da página não pode ser vazio.' });
        return;
    }
    setIsCreating(true);

    try {
        let newPageData: Omit<CloudPage, 'id' | 'createdAt' | 'updatedAt'>;

        if (selectedTemplate === 'blank') {
            newPageData = getInitialPage(newPageName, selectedProjectId, user.uid, selectedBrand);
        } else {
            let template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'> | null = null;
            if (selectedTemplateIsDefault) {
                template = defaultTemplates.find(t => t.name === selectedTemplate) || null;
            } else {
                template = await getTemplate(selectedTemplate!);
            }
            
            if (!template) throw new Error("Template não encontrado.");
            
            const newComponents = produce(template.components, draft => {
                const idMap: { [oldId: string]: string } = {};
                const generateNewId = () => `comp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                const traverseAndMap = (components: any[]) => {
                    components.forEach(component => {
                        const oldId = component.id;
                        idMap[oldId] = generateNewId();
                        if (component.children) traverseAndMap(component.children);
                    });
                };
                traverseAndMap(draft);
                const traverseAndReplace = (components: any[]) => {
                    components.forEach(component => {
                        component.id = idMap[component.id];
                        if (component.parentId) component.parentId = idMap[component.parentId];
                        if (component.children) traverseAndReplace(component.children);
                    });
                }
                traverseAndReplace(draft);
            });

            newPageData = {
                name: newPageName,
                brand: selectedBrand,
                projectId: selectedProjectId,
                userId: user.uid,
                tags: [],
                styles: template.styles,
                components: newComponents,
                cookieBanner: template.cookieBanner,
                meta: {
                    ...template.meta,
                    title: `${selectedBrand} - ${newPageName}`,
                    redirectUrl: selectedBrand === 'Avon' ? 'https://cloud.hello.avon.com/cadastroavonagradecimento' : 'https://www.natura.com.br/',
                    dataExtensionKey: 'CHANGE-ME',
                }
            };
        }
        
        const newPageId = await addPage(newPageData);
        toast({ title: "Página criada!", description: `A página "${newPageName}" foi criada com sucesso.` });
        
        // Check onboarding progress
        const updatedProgress = await updateUserProgress(user.uid, 'createdFirstPage');
         if (updatedProgress.objectives.createdFirstPage) {
            toast({
              title: "🎉 Objetivo Concluído!",
              description: "Você criou sua primeira página."
            });
         }
        
        resetState();
        onPageCreated?.(); // Callback to refresh list on project page
        router.push(`/editor/${newPageId}?projectId=${selectedProjectId}`);

    } catch(error) {
        console.error("Failed to create page from template:", error);
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível criar a página." });
    } finally {
        setIsCreating(false);
    }
  };
  
  const combinedTemplates = useMemo(() => {
    const defaults = defaultTemplates.map(t => ({...t, id: t.name, isDefault: true}));
    return [...defaults, ...userTemplates];
  }, [userTemplates]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetState(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Página</DialogTitle>
          <DialogDescription>
            {step === 1 ? "Escolha um template para começar." : "Agora, dê um nome e escolha a marca e o projeto para sua nova página."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
           <>
              <ScrollArea className="h-96">
                <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                        className={cn("border-2 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary", selectedTemplate === 'blank' ? 'border-primary' : 'border-dashed')}
                        onClick={() => { setSelectedTemplate('blank'); setSelectedTemplateIsDefault(false); }}
                    >
                        <FileText className="h-12 w-12 mb-2" />
                        <h3 className="font-semibold">Página em Branco</h3>
                        <p className="text-sm text-muted-foreground">Comece do zero.</p>
                    </div>
                    {combinedTemplates.map(template => (
                        <div 
                            key={template.id}
                            className={cn("border-2 rounded-lg p-4 cursor-pointer hover:border-primary", selectedTemplate === template.id ? 'border-primary' : '')}
                            onClick={() => { setSelectedTemplate(template.id); setSelectedTemplateIsDefault(!!template.isDefault); }}
                        >
                            <div className="w-full aspect-video bg-muted rounded-md mb-2 flex items-center justify-center">
                                <Server className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold truncate">{template.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{template.description}</p>
                            {template.isDefault && <Badge variant="secondary" className="mt-2">Padrão</Badge>}
                        </div>
                    ))}
                </div>
              </ScrollArea>
              <DialogFooter>
                  <Button variant="outline" onClick={resetState}>Cancelar</Button>
                  <Button onClick={handleNextStep} disabled={!selectedTemplate}>Próximo</Button>
              </DialogFooter>
            </>
        )}

        {step === 2 && (
            <>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="page-name">Nome da Página</Label>
                        <Input 
                            id="page-name" 
                            value={newPageName} 
                            onChange={(e) => setNewPageName(e.target.value)} 
                            placeholder="Ex: Campanha Dia das Mães"
                        />
                    </div>
                    {!projectId && (
                         <div className="space-y-2">
                             <Label htmlFor="project-id">Salvar no Projeto</Label>
                             <Select onValueChange={setSelectedProjectId} value={selectedProjectId}>
                                <SelectTrigger>
                                <SelectValue placeholder="Selecione um projeto..." />
                                </SelectTrigger>
                                <SelectContent>
                                {userProjects.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                         </div>
                    )}
                    <div className="space-y-2">
                        <Label>Marca</Label>
                        <RadioGroup defaultValue="Natura" value={selectedBrand} onValueChange={(value: Brand) => setSelectedBrand(value)} className="flex gap-4">
                            <Label htmlFor="brand-natura" className="flex items-center gap-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-accent has-[:checked]:bg-accent has-[:checked]:border-primary">
                                <RadioGroupItem value="Natura" id="brand-natura" />
                                Natura
                            </Label>
                            <Label htmlFor="brand-avon" className="flex items-center gap-2 border rounded-md p-3 flex-1 cursor-pointer hover:bg-accent has-[:checked]:bg-accent has-[:checked]:border-primary">
                                <RadioGroupItem value="Avon" id="brand-avon" />
                                Avon
                            </Label>
                        </RadioGroup>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => templateId ? resetState() : setStep(1) }>Voltar</Button>
                    <Button onClick={handleConfirmCreatePage} disabled={isCreating}>
                        {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Página e Abrir Editor"}
                    </Button>
                </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
