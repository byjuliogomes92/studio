

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Brand, Template, Project, CloudPage, PageComponent } from "@/lib/types";
import {
  getTemplates,
  getTemplate,
  addPage,
  getProjectsForUser,
  updateUserProgress,
  getBrandsForUser,
  getDefaultTemplates,
  getDefaultTemplate,
} from "@/lib/firestore";
import { cn } from "@/lib/utils";
import { FileText, Globe, Loader2, Server, Palette } from "lucide-react";
import { produce } from "immer";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface CreatePageFromTemplateDialogProps {
  trigger: React.ReactNode;
  templateId?: string; // Pre-selected template from templates page
  isDefaultTemplate?: boolean;
  projectId?: string; // Pre-selected project from project page
  onPageCreated?: () => void;
}

const platforms = [
  {
    id: "sfmc",
    name: "Salesforce Marketing Cloud",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg",
    enabled: true,
  },
  {
    id: "hubspot",
    name: "Hubspot",
    logo: "https://cronic.com.br/wp-content/uploads/2021/11/hubspot.png",
    enabled: false,
  },
  {
    id: "rdstation",
    name: "RD Station",
    logo: "https://gleybionycamargo.com.br/wp-content/uploads/2022/10/logo-rd-branca.png",
    enabled: false,
  },
  {
    id: "braze",
    name: "Braze",
    logo: "https://cdn.prod.website-files.com/616f0a7a027baab453433911/680fe9f825f815d39843558e_Braze_Logo_Light%20(1).svg",
    enabled: false,
  },
  {
    id: "klaviyo",
    name: "Klaviyo",
    logo: "https://cdn.prod.website-files.com/616f0a7a027baab453433911/657263261463fe4fc816b96e_klaviyo-logo-horizontal-white.svg",
    enabled: false,
  }, { id: "web", name: "Web", Icon: Globe, enabled: false },
];

const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }

  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (value !== undefined) {
          sanitized[key] = sanitizeForFirestore(value);
        }
      }
    }
    return sanitized;
  }

  return obj;
};

const getInitialPage = (
  name: string,
  projectId: string,
  workspaceId: string,
  platform: string
): Omit<CloudPage, "id" | "createdAt" | "updatedAt"> => {
  const basePage: Omit<CloudPage, "id" | "createdAt" | "updatedAt"> = {
    name: name,
    projectId,
    workspaceId,
    brandId: "",
    brandName: "Sem Marca",
    platform,
    tags: [],
    meta: {
      title: name,
      faviconUrl: "https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeus_logo_icon.svg?alt=media&token=3fcd759a-3975-4285-9c59-98b824674514",
      metaDescription: `Landing page ${name} criada com Morfeus.`,
      loaderType: "image",
      loaderImageUrl: "https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeus_logo_icon.svg?alt=media&token=3fcd759a-3975-4285-9c59-98b824674514",
      redirectUrl: "",
      dataExtensionKey: "CHANGE-ME",
    },
    styles: {
      backgroundColor: "#FFFFFF",
      fontFamily: "Roboto, sans-serif",
      themeColor: '#FE9347',
      themeColorHover: '#E65E00',
    },
    cookieBanner: { enabled: false },
    components: [
      { id: "header-initial", type: "Header", parentId: null, column: 0, order: 0, props: { isSticky: true, backgroundColor: 'rgba(255,255,255,0.7)', styles: { backdropFilter: 'blur(10px)', borderBottom: '1px solid #e5e7eb' }, layout: "logo-left-menu-button-right", logoHeight: 32, links: [{ id: "1", text: "Recursos", url: "#" }, { id: "2", text: "Preços", url: "#" }], buttonText: "Começar Agora", buttonUrl: "#" } },
      { id: "div-hero", type: 'Div', parentId: null, column: 0, order: 1, props: { styles: { paddingTop: "8rem", paddingBottom: "8rem", animationType: 'fadeInUp' }, layout: { flexDirection: "column", verticalAlign: "center", horizontalAlign: "center", gap: "1.5rem" } } },
      { id: "title-hero", type: 'Title', parentId: 'div-hero', column: 0, order: 0, props: { text: "Construa Jornadas Incríveis com Morfeus", styles: { fontSize: "3.75rem", textAlign: 'center', fontWeight: "900", letterSpacing: "-0.05em", color: "#111827" } } },
      { id: "para-hero", type: 'Paragraph', parentId: 'div-hero', column: 0, order: 1, props: { text: "Plataforma completa para automação de marketing, campanhas inteligentes e resultados reais.", styles: { textAlign: 'center', maxWidth: "42rem", fontSize: "1.25rem", color: "#4b5563" } } },
      { id: "div-buttons", type: 'Div', parentId: 'div-hero', column: 0, order: 2, props: { layout: { flexDirection: 'row', gap: '1rem', horizontalAlign: 'center' } } },
      { id: "btn-hero-1", type: 'Button', parentId: 'div-buttons', column: 0, order: 0, props: { text: "Criar Conta Gratuitamente", variant: 'default', styles: { padding: '0.875rem 1.5rem', fontWeight: "500" } } },
      { id: "btn-hero-2", type: 'Button', parentId: 'div-buttons', column: 0, order: 1, props: { text: "Ver Demonstração", variant: 'outline', styles: { padding: '0.875rem 1.5rem', fontWeight: "500" } } },
      { id: "div-features-section", type: 'Div', parentId: null, column: 0, order: 2, props: { styles: { paddingTop: '6rem', paddingBottom: '6rem', backgroundColor: "#f9fafb" } } },
      { id: "div-features-title", type: 'Div', parentId: "div-features-section", column: 0, order: 0, props: { styles: { marginBottom: "3rem", animationType: 'fadeInUp' }, layout: { horizontalAlign: 'center', gap: '0.5rem', flexDirection: "column" } } },
      { id: "title-features", type: 'Title', parentId: 'div-features-title', column: 0, order: 0, props: { text: 'Por que escolher o Morfeus?', styles: { textAlign: 'center', fontSize: '2.25rem', color: "#111827", fontWeight: "700" } } },
      { id: "para-features", type: 'Paragraph', parentId: 'div-features-title', column: 0, order: 1, props: { text: 'Tudo que você precisa para escalar sua comunicação.', styles: { textAlign: 'center', color: '#4b5563' } } },
      { id: 'cols-features', type: 'Columns', parentId: 'div-features-section', column: 0, order: 1, props: { columnCount: 3, styles: { gap: "2rem" } } },
      { id: 'div-feature-1', type: 'Div', parentId: 'cols-features', column: 0, order: 0, props: { styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', padding: '2rem', borderRadius: '0.75rem', animationType: 'fadeInUp' }, layout: { flexDirection: 'column' }, hoverStyles: { transform: "translateY(-4px)", borderColor: "var(--theme-color)" } } },
      { id: 'icon-f1', type: 'CustomHTML', parentId: 'div-feature-1', column: 0, order: 0, props: { htmlContent: '<div style="display:flex; justify-content:flex-start; margin-bottom: 1rem;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--theme-color))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div>' } },
      { id: 'title-f1', type: 'Subtitle', parentId: 'div-feature-1', column: 0, order: 1, props: { text: "Automação Rápida", styles: { fontWeight: "600", color: "#111827" } } },
      { id: 'para-f1', type: 'Paragraph', parentId: 'div-feature-1', column: 0, order: 2, props: { text: "Construa páginas e fluxos em minutos, sem complicação.", styles: { color: "#4b5563" } } },
      { id: 'div-feature-2', type: 'Div', parentId: 'cols-features', column: 1, order: 0, props: { styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', padding: '2rem', borderRadius: '0.75rem', animationType: 'fadeInUp', animationDelay: 0.2 }, layout: { flexDirection: 'column' }, hoverStyles: { transform: "translateY(-4px)", borderColor: "var(--theme-color)" } } },
      { id: 'icon-f2', type: 'CustomHTML', parentId: 'div-feature-2', column: 0, order: 0, props: { htmlContent: '<div style="display:flex; justify-content:flex-start; margin-bottom: 1rem;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--theme-color))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>' } },
      { id: 'title-f2', type: 'Subtitle', parentId: 'div-feature-2', column: 0, order: 1, props: { text: "Segmentação Inteligente", styles: { fontWeight: "600", color: "#111827" } } },
      { id: 'para-f2', type: 'Paragraph', parentId: 'div-feature-2', column: 0, order: 2, props: { text: "Conecte-se com quem realmente importa.", styles: { color: "#4b5563" } } },
      { id: 'div-feature-3', type: 'Div', parentId: 'cols-features', column: 2, order: 0, props: { styles: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', padding: '2rem', borderRadius: '0.75rem', animationType: 'fadeInUp', animationDelay: 0.4 }, layout: { flexDirection: 'column' }, hoverStyles: { transform: "translateY(-4px)", borderColor: "var(--theme-color)" } } },
      { id: 'icon-f3', type: 'CustomHTML', parentId: 'div-feature-3', column: 0, order: 0, props: { htmlContent: '<div style="display:flex; justify-content:flex-start; margin-bottom: 1rem;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--theme-color))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"></line><line x1="18" x2="18" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="16"></line></svg></div>' } },
      { id: 'title-f3', type: 'Subtitle', parentId: 'div-feature-3', column: 0, order: 1, props: { text: "Relatórios Avançados", styles: { fontWeight: "600", color: "#111827" } } },
      { id: 'para-f3', type: 'Paragraph', parentId: 'div-feature-3', column: 0, order: 2, props: { text: "Tome decisões com base em dados reais.", styles: { color: "#4b5563" } } },
      { id: 'div-cta', type: 'Div', parentId: null, column: 0, order: 3, props: { styles: { paddingTop: '6rem', paddingBottom: '6rem' }, layout: { flexDirection: 'column', gap: '1.5rem', horizontalAlign: 'center' } } },
      { id: 'title-cta', type: 'Title', parentId: 'div-cta', column: 0, order: 0, props: { text: 'Pronto para transformar sua comunicação?', styles: { textAlign: 'center', fontSize: '2.5rem', color: '#111827', fontWeight: '700' } } },
      { id: 'para-cta', type: 'Paragraph', parentId: 'div-cta', column: 0, order: 1, props: { text: 'Crie sua conta gratuita e comece hoje mesmo.', styles: { textAlign: 'center', color: '#4b5563' } } },
      { id: 'btn-cta', type: 'Button', parentId: 'div-cta', column: 0, order: 2, props: { text: 'Começar Agora', variant: 'default', align: 'center', styles: { padding: '0.875rem 1.5rem', fontWeight: "500" } } },
      { id: "footer-initial", type: "Footer", parentId: null, column: 0, order: 4, props: { layout: "menus-and-social", footerText1: `© ${new Date().getFullYear()} Morfeus. Todos os direitos reservados.`, linksLeft: [{ id: "f1", text: "Início", url: "#" }, { id: "f2", text: "Preços", url: "#" }], linksRight: [{ id: "f3", text: "Termos", url: "#" }, { id: "f4", text: "Privacidade", url: "#" }], socialLinks: { twitter: "#", github: "#" }, styles: { borderTop: '1px solid #e5e7eb', paddingTop: "2rem", paddingBottom: "2rem", backgroundColor: "#FFFFFF" } } },
    ],
  };
  return sanitizeForFirestore(basePage);
};

const applyBrandToPage = (
    page: Omit<CloudPage, 'id' | 'createdAt' | 'updatedAt'>,
    brand: Brand
): Omit<CloudPage, 'id' | 'createdAt' | 'updatedAt'> => {
  return produce(page, draft => {
    draft.brandId = brand.id;
    draft.brandName = brand.name;
    draft.brand = brand;
    
    // Apply global styles
    draft.styles.backgroundColor = brand.colors.light.background;
    draft.styles.themeColor = brand.colors.light.primary;
    draft.styles.themeColorHover = brand.colors.light.primaryHover;
    draft.styles.fontFamily = brand.typography.customFontNameBody || brand.typography.fontFamilyBody;
    
    // Apply meta styles
    draft.meta.title = `${brand.name} - ${draft.name}`;
    draft.meta.faviconUrl = brand.logos.favicon;
    draft.meta.loaderImageUrl = brand.logos.iconLight;

    // Update specific components
    draft.components.forEach(comp => {
        if (comp.type === 'Header') {
            comp.props.logoUrl = brand.logos.horizontalLight;
        }
        if (comp.type === 'Footer') {
            comp.props.footerText1 = `© ${new Date().getFullYear()} ${brand.name}. Todos os direitos reservados.`;
        }
        if (comp.type === 'Title' || comp.type === 'Subtitle') {
           comp.props.styles = {
               ...comp.props.styles,
               fontFamily: `"${brand.typography.customFontNameHeadings || brand.typography.fontFamilyHeadings}", sans-serif`
           };
        }
        if (comp.type === 'Button' && comp.id === 'btn-hero-1') {
           comp.props.styles = {
               ...comp.props.styles,
               backgroundColor: brand.colors.light.primary,
               color: brand.colors.light.primaryForeground
           };
        }
    });
  });
};


export function CreatePageFromTemplateDialog({
  trigger,
  templateId,
  isDefaultTemplate,
  projectId,
  onPageCreated,
}: CreatePageFromTemplateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [newPageName, setNewPageName] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >(projectId);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [defaultTemplates, setDefaultTemplates] = useState<Template[]>([]);
  const [userBrands, setUserBrands] = useState<Brand[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
    templateId || null
  );
  const [selectedTemplateIsDefault, setSelectedTemplateIsDefault] =
    useState<boolean>(!!isDefaultTemplate);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("sfmc");

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
        getProjectsForUser(activeWorkspace.id).then(({ projects }) =>
          setUserProjects(projects)
        );
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
    if (!templateId) {
      // From project page flow
      if (!selectedTemplate) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Por favor, selecione um template.",
        });
        return;
      }
    }
    setStep(2);
  };

  const handleConfirmCreatePage = async () => {
    if (!user || !activeWorkspace) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado e em um workspace.",
      });
      return;
    }
    if (!selectedProjectId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione um projeto.",
      });
      return;
    }
    if (newPageName.trim() === "") {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O nome da página não pode ser vazio.",
      });
      return;
    }
    setIsCreating(true);

    try {
      let pageToCreate: Omit<CloudPage, 'id' | 'createdAt' | 'updatedAt'>;
      const selectedBrand = userBrands.find((b) => b.id === selectedBrandId) || null;

      if (selectedTemplate === "blank") {
        const basePage = getInitialPage(
          newPageName,
          selectedProjectId,
          activeWorkspace.id,
          selectedPlatform
        );
        pageToCreate = selectedBrand ? applyBrandToPage(basePage, selectedBrand) : basePage;
      } else {
        const templateData = selectedTemplateIsDefault
          ? await getDefaultTemplate(selectedTemplate!)
          : await getTemplate(selectedTemplate!);

        if (!templateData) throw new Error("Template não encontrado.");
        
        const templateCopy = JSON.parse(JSON.stringify(templateData));

        const basePage = {
          name: newPageName,
          workspaceId: activeWorkspace.id,
          projectId: selectedProjectId,
          platform: selectedPlatform,
          brandId: '',
          brandName: 'Sem Marca',
          tags: templateCopy.tags || [],
          styles: { ...templateCopy.styles },
          components: templateCopy.components || [],
          meta: {
            ...templateCopy.meta,
            title: newPageName,
            dataExtensionKey: templateCopy.meta?.dataExtensionKey ?? "CHANGE-ME",
            redirectUrl: templateCopy.meta?.redirectUrl ?? "https://www.google.com",
            tracking: { ga4: { enabled: false }, meta: { enabled: false }, linkedin: { enabled: false } }
          },
        };
        pageToCreate = selectedBrand ? applyBrandToPage(basePage, selectedBrand) : basePage;
      }
      
      const finalPageData = produce(pageToCreate, draft => {
        // Ensure cookie banner is fully defined to prevent Firestore errors
        if (!draft.cookieBanner) {
            draft.cookieBanner = {
                enabled: false, position: "bottom", layout: "bar",
                title: "", description: "", acceptButtonText: "Aceitar",
                declineButtonText: "Recusar", preferencesButtonText: "Preferências",
                privacyPolicyLink: "", categories: [],
                styles: { backgroundColor: "", textColor: "", buttonBackgroundColor: "", buttonTextColor: "" }
            };
        } else if (!draft.cookieBanner.styles) {
            draft.cookieBanner.styles = {
                backgroundColor: "", textColor: "", buttonBackgroundColor: "", buttonTextColor: ""
            };
        }
      });
      
      const sanitizedPageData = sanitizeForFirestore(finalPageData);
      const newPageId = await addPage(sanitizedPageData, user.uid);
      
      toast({
        title: "Página criada!",
        description: `A página "${newPageName}" foi criada com sucesso.`,
      });

      // Check onboarding progress
      const updatedProgress = await updateUserProgress(user.uid, "createdFirstPage");
      if (updatedProgress.objectives.createdFirstPage) {
        toast({
          title: "🎉 Objetivo Concluído!",
          description: "Você criou sua primeira página.",
        });
      }

      resetState();
      onPageCreated?.(); // Callback to refresh list on project page
      router.push(`/editor/${newPageId}?projectId=${selectedProjectId}`);
    } catch (error) {
      console.error("Failed to create page from template:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Criar Página",
        description: `Não foi possível criar a página. Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });
    } finally {
      setIsCreating(false);
    }
  };


  const combinedTemplates = useMemo(() => {
    return [...defaultTemplates, ...userTemplates];
  }, [userTemplates, defaultTemplates]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetState();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Página</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Escolha um template para começar."
              : "Agora, dê um nome e escolha a marca, projeto e plataforma para sua nova página."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <>
            <ScrollArea className="h-96">
              <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={cn(
                    "border-2 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary",
                    selectedTemplate === "blank"
                      ? "border-primary"
                      : "border-dashed"
                  )}
                  onClick={() => {
                    setSelectedTemplate("blank");
                    setSelectedTemplateIsDefault(false);
                  }}
                >
                  <FileText className="h-12 w-12 mb-2" />
                  <h3 className="font-semibold">Página em Branco</h3>
                  <p className="text-sm text-muted-foreground">
                    Comece do zero.
                  </p>
                </div>
                {combinedTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={cn(
                      "border-2 rounded-lg p-4 cursor-pointer hover:border-primary",
                      selectedTemplate === template.id ? "border-primary" : ""
                    )}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setSelectedTemplateIsDefault(!!template.isDefault);
                    }}
                  >
                    <div className="w-full aspect-video bg-muted rounded-md mb-2 flex items-center justify-center">
                      <Server className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold truncate">{template.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {template.description}
                    </p>
                    {template.isDefault && (
                      <Badge variant="secondary" className="mt-2">
                        Padrão
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={resetState}>
                Cancelar
              </Button>
              <Button onClick={handleNextStep} disabled={!selectedTemplate}>
                Próximo
              </Button>
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
                    <Select
                      onValueChange={setSelectedProjectId}
                      value={selectedProjectId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um projeto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {userProjects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Select
                    onValueChange={(value) =>
                      setSelectedBrandId(value === "none" ? null : value)
                    }
                    value={selectedBrandId || "none"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um Kit de Marca..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {userBrands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{
                                backgroundColor: brand.colors.light.primary,
                              }}
                            ></div>
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
                <RadioGroup
                  value={selectedPlatform}
                  onValueChange={setSelectedPlatform}
                  className="grid grid-cols-3 md:grid-cols-6 gap-2"
                >
                  {platforms.map((platform) => {
                    const content = (
                      <Label
                        key={platform.id}
                        htmlFor={`platform-${platform.id}`}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 border-2 rounded-lg p-3 transition-all h-28",
                          platform.enabled
                            ? "cursor-pointer hover:border-primary"
                            : "cursor-not-allowed",
                          selectedPlatform === platform.id && "border-primary"
                        )}
                      >
                        <RadioGroupItem
                          value={platform.id}
                          id={`platform-${platform.id}`}
                          className="sr-only"
                          disabled={!platform.enabled}
                        />
                        <div
                          className={cn(
                            "flex items-center justify-center h-10 w-full transition-opacity",
                            selectedPlatform !== platform.id && "opacity-40",
                            !platform.enabled && "opacity-20"
                          )}
                        >
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
                        <span className="text-xs text-center">
                          {platform.name}
                        </span>
                      </Label>
                    );

                    if (platform.enabled) {
                      return content;
                    }

                    return (
                      <Tooltip key={platform.id}>
                        <TooltipTrigger asChild>
                          <div className="cursor-not-allowed w-full">
                            {content}
                          </div>
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
              <Button
                variant="outline"
                onClick={() => (templateId ? resetState() : setStep(1))}
              >
                Voltar
              </Button>
              <Button onClick={handleConfirmCreatePage} disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Criar Página e Abrir Editor"
                )}
              </Button>
            </DialogFooter>
          </TooltipProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}
