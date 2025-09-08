
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
import type { Brand, Template, Project, CloudPage } from "@/lib/types";
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
import { Badge } from "@/components/ui/badge";
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
  },
  { id: "web", name: "Web", Icon: Globe, enabled: false },
];

// Helper function to sanitize data for Firestore (remove undefined values)
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
  brand: Brand | null,
  platform: string
): Omit<CloudPage, "id" | "createdAt" | "updatedAt"> => {
  const brandName = brand?.name ?? "Sem Marca";
  const brandId = brand?.id ?? "";
  const faviconUrl = brand?.logos?.favicon ?? "";

  return sanitizeForFirestore({
    name: name,
    projectId,
    workspaceId,
    brandId: brandId,
    brandName: brandName,
    platform,
    tags: [],
    meta: {
      title: name,
      faviconUrl,
      metaDescription: `Descrição da página ${name}.`,
      loaderType: 'image',
      loaderImageUrl: 'https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeus_logo_icon.svg?alt=media&token=3fcd759a-3975-4285-9c59-98b824674514',
    },
    styles: {
      backgroundColor: "#000000",
      fontFamily: "Inter, sans-serif",
    },
    cookieBanner: {
      enabled: false,
    },
    components: [
      // Header
      {
        id: "header-initial",
        type: "Header",
        parentId: null,
        column: 0,
        order: 0,
        props: {
          logoUrl: "https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeus_logo_dark.svg?alt=media&token=717e9359-5b3f-4d4f-b778-9bcf091d054b",
          logoHeight: 24,
          layout: "logo-left-menu-button-right",
          isSticky: true,
          backgroundColor: "rgba(0,0,0,0.7)",
          styles: { backdropFilter: "blur(10px)", borderBottom: "1px solid #333333"},
          linkColor: "#d1d5db",
          linkHoverColor: "#ffffff",
          links: [
            { id: "1", text: "Recursos", url: "#" },
            { id: "2", text: "Preços", url: "#" },
            { id: "3", text: "Contato", url: "#" },
          ],
          buttonText: "Começar Agora",
          buttonUrl: "#",
          buttonProps: { variant: 'primary', bgColor: "#FFFFFF", textColor: "#000000", hoverBgColor: "#e5e5e5" },
        },
      },
      // Hero Section
      {
        id: "div-hero-initial",
        type: "Div",
        parentId: null,
        column: 0,
        order: 1,
        props: {
          styles: { paddingTop: "8rem", paddingBottom: "8rem" },
          layout: {
            flexDirection: "column",
            verticalAlign: "center",
            horizontalAlign: "center",
            gap: "1.5rem",
          },
        },
      },
      {
        id: "title-hero",
        type: "Title",
        parentId: "div-hero-initial",
        column: 0,
        order: 0,
        props: {
          text: "Construa Jornadas Incríveis com Morfeus",
          styles: {
            fontFamily: `Inter, sans-serif`,
            fontSize: "3.75rem",
            textAlign: "center",
            fontWeight: "900",
            letterSpacing: "-0.05em",
            color: '#FFFFFF'
          },
        },
      },
      {
        id: "para-hero",
        type: "Paragraph",
        parentId: "div-hero-initial",
        column: 0,
        order: 1,
        props: {
          text: "Plataforma completa para automação de marketing, campanhas inteligentes e resultados reais.",
          styles: {
            textAlign: "center",
            maxWidth: "42rem",
            fontSize: "1.25rem",
            color: "#a0a0a0",
          },
        },
      },
      {
        id: "div-buttons-hero",
        type: "Div",
        parentId: "div-hero-initial",
        column: 0,
        order: 2,
        props: {
          layout: {
            flexDirection: "row",
            gap: "1rem",
            horizontalAlign: "center",
            marginTop: "1rem"
          },
        },
      },
      {
        id: "btn-hero-1",
        type: "Button",
        parentId: "div-buttons-hero",
        column: 0,
        order: 0,
        props: {
          text: "Criar Conta Gratuitamente",
          variant: 'primary',
          styles: {
            backgroundColor: "#FFFFFF",
            color: "#000000",
            borderRadius: "0.5rem",
            padding: "0.875rem 1.5rem",
            fontWeight: "500",
          },
        },
      },
      {
        id: "btn-hero-2",
        type: "Button",
        parentId: "div-buttons-hero",
        column: 0,
        order: 1,
        props: {
          text: "Saiba Mais",
          variant: "outline",
          styles: {
            borderRadius: "0.5rem",
            padding: "0.875rem 1.5rem",
            color: "#FFFFFF",
            backgroundColor: 'transparent',
            borderColor: "#FFFFFF",
             fontWeight: "500",
          },
        },
      },
       // Features Section
      {
        id: "div-features-section",
        type: "Div",
        parentId: null,
        column: 0,
        order: 2,
        props: {
          styles: {
            paddingTop: "6rem",
            paddingBottom: "6rem",
            backgroundColor: "#000000",
          },
        },
      },
      {
        id: "div-features-title",
        type: "Div",
        parentId: "div-features-section",
        column: 0,
        order: 0,
        props: {
          styles: { marginBottom: "3rem" },
          layout: { horizontalAlign: "center", gap: "0.5rem", flexDirection: 'column' },
        },
      },
      {
        id: "title-features",
        type: "Title",
        parentId: "div-features-title",
        column: 0,
        order: 0,
        props: {
          text: "Por que escolher o Morfeus?",
          styles: {
            textAlign: "center",
            fontSize: "2.25rem",
            color: "#FFFFFF",
            fontWeight: "700"
          },
        },
      },
      {
        id: "para-features",
        type: "Paragraph",
        parentId: "div-features-title",
        column: 0,
        order: 1,
        props: {
          text: "Tudo que você precisa para escalar sua comunicação.",
          styles: { textAlign: "center", color: "#a0a0a0" },
        },
      },
      {
        id: "cols-features",
        type: "Columns",
        parentId: "div-features-section",
        column: 0,
        order: 1,
        props: { columnCount: 3, styles: { gap: "2rem" } },
      },
      // Feature 1
      {
        id: "div-feature-1",
        type: "Div",
        parentId: "cols-features",
        column: 0,
        order: 0,
        props: {
          styles: {
            backgroundColor: "#1a1a1a",
            border: "1px solid #333333",
            padding: "2rem",
            borderRadius: "0.75rem",
          },
          layout: {
            flexDirection: "column",
            horizontalAlign: "flex-start",
            gap: "0.5rem",
          },
        },
      },
       {
        id: "icon-f1",
        type: "CustomHTML",
        parentId: "div-feature-1",
        column: 0,
        order: 0,
        props: { htmlContent: '<div class="flex items-center justify-center h-12 w-12 rounded-lg bg-gray-800 mb-4"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div>' },
      },
      {
        id: "title-f1",
        type: "Subtitle",
        parentId: "div-feature-1",
        column: 0,
        order: 1,
        props: { text: "Automação Rápida", styles: { fontWeight: "600", color: '#FFFFFF', marginTop: '0.5rem' } },
      },
      {
        id: "para-f1",
        type: "Paragraph",
        parentId: "div-feature-1",
        column: 0,
        order: 2,
        props: {
          text: "Monte fluxos em minutos e ganhe agilidade para focar no que realmente importa.",
          styles: { color: "#a0a0a0" },
        },
      },
      // Feature 2
      {
        id: "div-feature-2",
        type: "Div",
        parentId: "cols-features",
        column: 1,
        order: 0,
        props: {
          styles: {
            backgroundColor: "#1a1a1a",
            border: "1px solid #333333",
            padding: "2rem",
            borderRadius: "0.75rem",
          },
          layout: {
            flexDirection: "column",
            horizontalAlign: "flex-start",
            gap: "0.5rem",
          },
        },
      },
       {
        id: "icon-f2",
        type: "CustomHTML",
        parentId: "div-feature-2",
        column: 0,
        order: 0,
        props: { htmlContent: '<div class="flex items-center justify-center h-12 w-12 rounded-lg bg-gray-800 mb-4"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>' },
      },
      {
        id: "title-f2",
        type: "Subtitle",
        parentId: "div-feature-2",
        column: 0,
        order: 1,
        props: { text: "Segmentação Inteligente", styles: { fontWeight: "600", color: '#FFFFFF', marginTop: '0.5rem' } },
      },
      {
        id: "para-f2",
        type: "Paragraph",
        parentId: "div-feature-2",
        column: 0,
        order: 2,
        props: {
          text: "Conecte-se com o público certo na hora certa e maximize o impacto das suas campanhas.",
          styles: { color: "#a0a0a0" },
        },
      },
      // Feature 3
      {
        id: "div-feature-3",
        type: "Div",
        parentId: "cols-features",
        column: 2,
        order: 0,
        props: {
          styles: {
            backgroundColor: "#1a1a1a",
            border: "1px solid #333333",
            padding: "2rem",
            borderRadius: "0.75rem",
          },
          layout: {
            flexDirection: "column",
            horizontalAlign: "flex-start",
            gap: "0.5rem",
          },
        },
      },
       {
        id: "icon-f3",
        type: "CustomHTML",
        parentId: "div-feature-3",
        column: 0,
        order: 0,
        props: { htmlContent: '<div class="flex items-center justify-center h-12 w-12 rounded-lg bg-gray-800 mb-4"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><path d="M2.06 12.87a2.38 2.38 0 0 0 .34 1.47l2.63 4.3c.23.38.49.71.78.99a2.38 2.38 0 0 0 1.47.34h11.44a2.38 2.38 0 0 0 1.47-.34c.29-.28.55-.61.78-.99l2.63-4.3a2.38 2.38 0 0 0 .34-1.47V4.38a2.38 2.38 0 0 0-.34-1.47l-2.63-4.3c-.23-.38-.49-.71-.78-.99a2.38 2.38 0 0 0-1.47-.34H7.62a2.38 2.38 0 0 0-1.47.34c-.29.28-.55.61-.78.99L2.74 2.91a2.38 2.38 0 0 0-.34 1.47Z"></path><path d="m11.33 12.4-2.13 3.42"></path><path d="m14.8 15.82-2.9-4.66"></path><path d="m13.4 7.6-1.6 2.53"></path><path d="M12 2v2.5"></path><path d="M12 19.5V22"></path><path d="m16.5 4.5.8 1.35"></path><path d="m6.7 18.15.8 1.35"></path><path d="m20.91 10.91 1.35.8"></path><path d="m1.74 12.29 1.35.8"></path><path d="m7.5 4.5-.8 1.35"></path><path d="m17.3 18.15-.8 1.35"></path><path d="m3.09 10.91-1.35.8"></path><path d="m22.26 12.29-1.35.8"></path></svg></div>' },
      },
      {
        id: "title-f3",
        type: "Subtitle",
        parentId: "div-feature-3",
        column: 0,
        order: 1,
        props: { text: "Relatórios Avançados", styles: { fontWeight: "600", color: '#FFFFFF', marginTop: '0.5rem' } },
      },
      {
        id: "para-f3",
        type: "Paragraph",
        parentId: "div-feature-3",
        column: 0,
        order: 2,
        props: {
          text: "Tome decisões estratégicas com base em dados reais e visualizações claras.",
          styles: { color: "#a0a0a0" },
        },
      },
      // CTA Section
      {
        id: "div-cta-section",
        type: "Div",
        parentId: null,
        column: 0,
        order: 3,
        props: { styles: { paddingTop: "5rem", paddingBottom: "8rem" } },
      },
      {
        id: "div-cta-inner",
        type: "Div",
        parentId: "div-cta-section",
        column: 0,
        order: 0,
        props: {
          styles: {
            backgroundColor: "#1a1a1a",
            border: "1px solid #333333",
            padding: "4rem 2.5rem",
            borderRadius: "1rem",
          },
          layout: { horizontalAlign: "center", gap: "1rem", flexDirection: "column" },
        },
      },
      {
        id: "title-cta",
        type: "Title",
        parentId: "div-cta-inner",
        column: 0,
        order: 0,
        props: {
          text: "Pronto para transformar sua comunicação?",
          styles: {
            textAlign: "center",
            fontSize: "2.25rem",
            color: "#FFFFFF",
            fontWeight: "700",
          },
        },
      },
      {
        id: "para-cta",
        type: "Paragraph",
        parentId: "div-cta-inner",
        column: 0,
        order: 1,
        props: {
          text: "Cadastre-se no Morfeus e descubra como levar suas campanhas para o próximo nível. Comece gratuitamente, sem necessidade de cartão de crédito.",
          styles: {
            textAlign: "center",
            maxWidth: "42rem",
            fontSize: "1.125rem",
            color: "#a0a0a0",
          },
        },
      },
      {
        id: "btn-cta",
        type: "Button",
        parentId: "div-cta-inner",
        column: 0,
        order: 2,
        props: {
          text: "Criar Conta Gratuitamente",
          variant: 'primary',
          styles: {
            marginTop: "1rem",
            backgroundColor: "#FFFFFF",
            color: "#000000",
            borderRadius: "0.5rem",
            padding: "0.875rem 1.5rem",
            fontWeight: "500",
          },
        },
      },
      // Footer
       {
        id: "footer-initial",
        type: "Footer",
        parentId: null,
        column: 0,
        order: 4,
        props: {
          layout: 'menus-and-social',
          logoUrl: "https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeus_logo_dark.svg?alt=media&token=717e9359-5b3f-4d4f-b778-9bcf091d054b",
          footerText1: `© ${new Date().getFullYear()} Morfeus. Todos os direitos reservados.`,
          linksLeft: [
            { id: "f1", text: 'Início', url: '#' },
            { id: "f2", text: 'Preços', url: '#' },
          ],
          linksRight: [
            { id: "f3", text: 'Termos', url: '#' },
            { id: "f4", text: 'Privacidade', url: '#' },
          ],
          socialLinks: { twitter: "#", github: "#" },
          styles: {
            borderTop: "1px solid #333333",
            paddingTop: "2rem",
            paddingBottom: "2rem",
            backgroundColor: '#000000'
          },
        },
      },
    ],
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
      let newPageData: Omit<CloudPage, "id" | "createdAt" | "updatedAt">;
      const selectedBrand =
        userBrands.find((b) => b.id === selectedBrandId) || null;

      if (selectedTemplate === "blank") {
        newPageData = getInitialPage(
          newPageName,
          selectedProjectId,
          activeWorkspace.id,
          selectedBrand,
          selectedPlatform
        );
      } else {
        let template: Omit<
          Template,
          "id" | "createdAt" | "updatedAt" | "createdBy"
        > | null = null;
        if (selectedTemplateIsDefault) {
          template = await getDefaultTemplate(selectedTemplate!);
        } else {
          template = await getTemplate(selectedTemplate!);
        }

        if (!template) throw new Error("Template não encontrado.");
        if (!selectedBrand && selectedTemplate !== 'blank')
          throw new Error(
            "Marca selecionada não encontrada para este template."
          );

        const newComponents = produce(template.components || [], (draft) => {
          const idMap: { [oldId: string]: string } = {};
          const generateNewId = () =>
            `comp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

          const traverseAndMap = (components: any[]) => {
            components.forEach((component) => {
              if (component && component.id) {
                const oldId = component.id;
                idMap[oldId] = generateNewId();
                if (component.children && Array.isArray(component.children)) {
                  traverseAndMap(component.children);
                }
              }
            });
          };

          traverseAndMap(draft);

          const traverseAndReplace = (components: any[]) => {
            components.forEach((component) => {
              if (component && component.id) {
                component.id = idMap[component.id];
                if (component.parentId && idMap[component.parentId]) {
                  component.parentId = idMap[component.parentId];
                }
                if (component.children && Array.isArray(component.children)) {
                  traverseAndReplace(component.children);
                }
              }
            });
          };

          traverseAndReplace(draft);
        });

        // Create the page data with safe defaults
        newPageData = sanitizeForFirestore({
          name: newPageName,
          workspaceId: activeWorkspace.id,
          brandId: selectedBrand?.id || '',
          brandName: selectedBrand?.name || 'Sem Marca',
          platform: selectedPlatform,
          projectId: selectedProjectId,
          tags: template.tags || [],
          styles: {
            backgroundColor: template.styles?.backgroundColor ?? "#FFFFFF",
            backgroundImage: template.styles?.backgroundImage ?? "",
            themeColor:
              selectedBrand?.colors?.light?.primary ??
              template.styles?.themeColor ??
              "#000000",
            themeColorHover:
              selectedBrand?.colors?.light?.primaryHover ??
              template.styles?.themeColorHover ??
              "#333333",
            fontFamily:
              selectedBrand?.typography?.fontFamilyBody ??
              template.styles?.fontFamily ??
              "Roboto",
            customCss: template.styles?.customCss ?? "",
          },
          components: newComponents,
          cookieBanner: template.cookieBanner, // Keep original cookie banner from template
          meta: {
            title: `${selectedBrand?.name || 'Marca'} - ${newPageName}`,
            faviconUrl:
              selectedBrand?.logos?.favicon ?? template.meta?.faviconUrl ?? "",
            loaderImageUrl:
              selectedBrand?.logos?.iconLight ??
              template.meta?.loaderImageUrl ??
              "",
            redirectUrl: template.meta?.redirectUrl ?? "https://www.google.com",
            dataExtensionKey: template.meta?.dataExtensionKey ?? "CHANGE-ME",
            metaDescription:
              template.meta?.metaDescription ??
              `Página de campanha para ${newPageName}.`,
            metaKeywords:
              template.meta?.metaKeywords ??
              `campanha, ${newPageName.toLowerCase()}`,
            tracking: {
              ga4: { enabled: false },
              meta: { enabled: false },
              linkedin: { enabled: false },
            },
          },
        });
      }

      // Ensure cookie banner is fully defined to prevent Firestore errors
      if (!newPageData.cookieBanner) {
        newPageData.cookieBanner = {
          enabled: false,
          position: "bottom",
          layout: "bar",
          title: "",
          description: "",
          acceptButtonText: "Aceitar",
          declineButtonText: "Recusar",
          preferencesButtonText: "Preferências",
          privacyPolicyLink: "",
          categories: [],
          styles: {
            backgroundColor: "",
            textColor: "",
            buttonBackgroundColor: "",
            buttonTextColor: "",
          },
        };
      } else if (!newPageData.cookieBanner.styles) {
        newPageData.cookieBanner.styles = {
          backgroundColor: "",
          textColor: "",
          buttonBackgroundColor: "",
          buttonTextColor: "",
        };
      }

      console.log(
        "Creating page with data:",
        JSON.stringify(newPageData, null, 2)
      );

      const newPageId = await addPage(newPageData, user.uid);
      toast({
        title: "Página criada!",
        description: `A página "${newPageName}" foi criada com sucesso.`,
      });

      // Check onboarding progress
      const updatedProgress = await updateUserProgress(
        user.uid,
        "createdFirstPage"
      );
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
        title: "Erro",
        description: "Não foi possível criar a página.",
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
