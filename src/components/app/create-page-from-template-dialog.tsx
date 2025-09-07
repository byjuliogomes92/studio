

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
import { getTemplates, getTemplate, addPage, getProjectsForUser, updateUserProgress, getBrandsForUser, getDefaultTemplates, getDefaultTemplate } from '@/lib/firestore';
import { cn } from '@/lib/utils';
import { FileText, Globe, Loader2, Server, Palette } from 'lucide-react';
import { produce } from 'immer';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface CreatePageFromTemplateDialogProps {
  trigger: React.ReactNode;
  templateId?: string; // Pre-selected template from templates page
  isDefaultTemplate?: boolean;
  projectId?: string; // Pre-selected project from project page
  onPageCreated?: () => void;
}

const platforms = [
    { id: 'sfmc', name: 'Salesforce Marketing Cloud', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg', enabled: true },
    { id: 'hubspot', name: 'Hubspot', logo: 'https://cronic.com.br/wp-content/uploads/2021/11/hubspot.png', enabled: false },
    { id: 'rdstation', name: 'RD Station', logo: 'https://gleybionycamargo.com.br/wp-content/uploads/2022/10/logo-rd-branca.png', enabled: false },
    { id: 'braze', name: 'Braze', logo: 'https://cdn.prod.website-files.com/616f0a7a027baab453433911/680fe9f825f815d39843558e_Braze_Logo_Light%20(1).svg', enabled: false },
    { id: 'klaviyo', name: 'Klaviyo', logo: 'https://cdn.prod.website-files.com/616f0a7a027baab453433911/657263261463fe4fc816b96e_klaviyo-logo-horizontal-white.svg', enabled: false },
    { id: 'web', name: 'Web', Icon: Globe, enabled: false },
];

const getInitialPage = (name: string, projectId: string, workspaceId: string, brand: Brand | null, platform: string): Omit<CloudPage, 'id' | 'createdAt' | 'updatedAt'> => {
    
    const brandName = brand ? brand.name : 'Sem Marca';
    const brandId = brand ? brand.id : '';
    const themeColor = brand ? brand.colors.light.primary : '#000000';
    const themeColorHover = brand ? brand.colors.light.primaryHover : '#333333';
    const fontFamily = brand ? brand.typography.fontFamilyBody : 'Roboto';
    const faviconUrl = brand ? brand.logos.favicon : '';
    const loaderImageUrl = brand ? brand.logos.iconLight : '';
    const logoUrl = brand ? brand.logos.horizontalLight : '';

    const hasBrand = !!brand;

    return {
      name: name,
      projectId,
      workspaceId,
      brandId: brandId,
      brandName: brandName,
      platform,
      tags: [],
      meta: {
        title: `${name}`,
        faviconUrl: faviconUrl,
        loaderImageUrl: loaderImageUrl,
        redirectUrl: 'https://www.google.com',
        dataExtensionKey: 'CHANGE-ME',
        metaDescription: `Página de campanha para ${name}.`,
        metaKeywords: `campanha, ${name.toLowerCase()}`,
        tracking: {
          ga4: { enabled: false, id: '' },
          meta: { enabled: false, id: '' },
          linkedin: { enabled: false, id: '' }
        }
      },
      styles: {
        backgroundColor: '#FFFFFF',
        backgroundImage: '',
        themeColor: themeColor,
        themeColorHover: themeColorHover,
        fontFamily: fontFamily,
        customCss: '',
      },
      cookieBanner: {
        enabled: true,
        position: 'bottom',
        layout: 'bar',
        title: 'Gerencie seu consentimento de cookies',
        description: 'Utilizamos cookies para garantir que você tenha a melhor experiência em nosso site. Ao continuar, você concorda com o uso de cookies.',
        acceptButtonText: 'Aceitar Todos',
        declineButtonText: 'Recusar Todos',
        preferencesButtonText: 'Preferências',
        privacyPolicyLink: '',
        categories: [],
        styles: {
          backgroundColor: '',
          textColor: '',
          buttonBackgroundColor: '',
          buttonTextColor: ''
        }
      },
      components: hasBrand ? [
        { id: '1', type: 'Header', props: { logoUrl: logoUrl }, order: 0, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
        { 
          id: '4', 
          type: 'Footer', 
          props: { 
            footerText1: `© ${new Date().getFullYear()} ${brandName}. Todos os direitos reservados.`,
            footerText2: `...`,
            footerText3: `...`,
          }, 
          order: 1,
          parentId: null,
          column: 0,
          abTestEnabled: false,
          abTestVariants: []
        },
      ] : [],
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
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(projectId);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [defaultTemplates, setDefaultTemplates] = useState<Template[]>([]);
  const [userBrands, setUserBrands] = useState<Brand[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(templateId || null);
  const [selectedTemplateIsDefault, setSelectedTemplateIsDefault] = useState<boolean>(!!isDefaultTemplate);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('sfmc');
  
  const { user, activeWorkspace } = useAuth();
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
    if (isOpen && user && activeWorkspace) {
        if (!templateId) {
            getTemplates(activeWorkspace.id).then(setUserTemplates);
            getDefaultTemplates().then(setDefaultTemplates);
        }
        if (!projectId) {
            getProjectsForUser(activeWorkspace.id).then(({projects}) => setUserProjects(projects));
        }
        getBrandsForUser(activeWorkspace.id).then(setUserBrands);
    }
  }, [isOpen, user, templateId, projectId, activeWorkspace]);

  const resetState = () => {
    setIsOpen(false);
    setStep(templateId ? 2 : 1);
    setNewPageName("");
    setSelectedBrandId(null);
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
    if (!user || !activeWorkspace) {
        toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado e em um workspace." });
        return;
    }
    if (!selectedProjectId) {
         toast({ variant: "destructive", title: "Erro", description: "Por favor, selecione um projeto." });
        return;
    }
     if (!selectedBrandId && selectedTemplate !== 'blank') {
        toast({ variant: "destructive", title: "Erro", description: "Por favor, selecione uma marca para este template." });
        return;
    }
    if (newPageName.trim() === '') {
        toast({ variant: 'destructive', title: 'Erro', description: 'O nome da página não pode ser vazio.' });
        return;
    }
    setIsCreating(true);

    try {
        let newPageData: Omit<CloudPage, 'id' | 'createdAt' | 'updatedAt'>;
        const selectedBrand = userBrands.find(b => b.id === selectedBrandId) || null;

        if (selectedTemplate === 'blank') {
            newPageData = getInitialPage(newPageName, selectedProjectId, activeWorkspace.id, selectedBrand, selectedPlatform);
        } else {
            let template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> | null = null;
            if (selectedTemplateIsDefault) {
                template = await getDefaultTemplate(selectedTemplate!);
            } else {
                template = await getTemplate(selectedTemplate!);
            }
            
            if (!template) throw new Error("Template não encontrado.");
            if (!selectedBrand) throw new Error("Marca selecionada não encontrada para este template.");
            
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
                workspaceId: activeWorkspace.id,
                brandId: selectedBrand.id,
                brandName: selectedBrand.name,
                platform: selectedPlatform,
                projectId: selectedProjectId,
                tags: [],
                styles: selectedBrand ? {
                    ...template.styles,
                    themeColor: selectedBrand.colors.light.primary,
                    themeColorHover: selectedBrand.colors.light.primaryHover,
                    fontFamily: selectedBrand.typography.fontFamilyBody,
                } : template.styles,
                components: newComponents,
                cookieBanner: template.cookieBanner,
                meta: {
                    ...template.meta,
                    title: `${selectedBrand.name} - ${newPageName}`,
                    faviconUrl: selectedBrand.logos.favicon,
                    loaderImageUrl: selectedBrand.logos.iconLight,
                    redirectUrl: 'https://www.google.com',
                    dataExtensionKey: 'CHANGE-ME',
                    tracking: {
                      ga4: { enabled: false, id: '' },
                      meta: { enabled: false, id: '' },
                      linkedin: { enabled: false, id: '' }
                    },
                }
            };

            // Ensure cookieBanner has all required properties to avoid Firestore errors
            if (!newPageData.cookieBanner) {
                newPageData.cookieBanner = {
                    enabled: false,
                    position: 'bottom',
                    layout: 'bar',
                    title: '',
                    description: '',
                    acceptButtonText: 'Aceitar',
                    declineButtonText: 'Recusar',
                    preferencesButtonText: 'Preferências',
                    privacyPolicyLink: '',
                    categories: [],
                    styles: {
                        backgroundColor: '',
                        textColor: '',
                        buttonBackgroundColor: '',
                        buttonTextColor: ''
                    }
                };
            } else {
                newPageData.cookieBanner.styles = newPageData.cookieBanner.styles || { backgroundColor: '', textColor: '', buttonBackgroundColor: '', buttonTextColor: '' };
                newPageData.cookieBanner.categories = newPageData.cookieBanner.categories || [];
            }
        }
        
        const newPageId = await addPage(newPageData, user.uid);
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
    return [...defaultTemplates, ...userTemplates];
  }, [userTemplates, defaultTemplates]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetState(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Página</DialogTitle>
          <DialogDescription>
            {step === 1 ? "Escolha um template para começar." : "Agora, dê um nome e escolha a marca, projeto e plataforma para sua nova página."}
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
            <TooltipProvider>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                             <Select onValueChange={(value) => setSelectedBrandId(value === 'none' ? null : value)} value={selectedBrandId || 'none'}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um Kit de Marca..." />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="none">Nenhuma</SelectItem>
                                {userBrands.map(brand => (
                                    <SelectItem key={brand.id} value={brand.id}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: brand.colors.light.primary }}></div>
                                            {brand.name}
                                        </div>
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Plataforma</Label>
                        <RadioGroup value={selectedPlatform} onValueChange={setSelectedPlatform} className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {platforms.map(platform => {
                                const content = (
                                    <Label 
                                        key={platform.id}
                                        htmlFor={`platform-${platform.id}`}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 border-2 rounded-lg p-3 transition-all h-28",
                                            platform.enabled ? "cursor-pointer hover:border-primary" : "cursor-not-allowed",
                                            selectedPlatform === platform.id && "border-primary"
                                        )}
                                    >
                                        <RadioGroupItem value={platform.id} id={`platform-${platform.id}`} className="sr-only" disabled={!platform.enabled} />
                                         <div className={cn(
                                            "flex items-center justify-center h-10 w-full transition-opacity",
                                            selectedPlatform !== platform.id && "opacity-40",
                                            !platform.enabled && "opacity-20"
                                        )}>
                                            {platform.Icon ? (
                                                <platform.Icon className="h-10 w-10" />
                                            ) : (
                                                <img 
                                                  src={platform.logo} 
                                                  alt={platform.name} 
                                                  className="h-10 object-contain"
                                                />
                                            )}
                                        </div>
                                        <span className="text-xs text-center">{platform.name}</span>
                                    </Label>
                                );

                                if (platform.enabled) {
                                    return content;
                                }

                                return (
                                    <Tooltip key={platform.id}>
                                        <TooltipTrigger asChild>
                                            <div className="cursor-not-allowed w-full">{content}</div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Em breve</p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </RadioGroup>
                     </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => templateId ? resetState() : setStep(1) }>Voltar</Button>
                    <Button onClick={handleConfirmCreatePage} disabled={isCreating}>
                        {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Página e Abrir Editor"}
                    </Button>
                </DialogFooter>
            </TooltipProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}

    

    


