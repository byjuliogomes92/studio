
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CloudPage, PageComponent } from "@/lib/types";
import { generateHtml } from "@/lib/html-generator";
import { SettingsPanel } from "./settings-panel";
import { MainPanel } from "./main-panel";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addPage, getPage, updatePage } from "@/lib/firestore";
import { useAuth } from "@/hooks/use-auth";

const initialPage: Omit<CloudPage, 'id' | 'createdAt' | 'updatedAt' | 'userId'> = {
  name: "Nova CloudPage",
  projectId: "",
  meta: {
    title: 'Avon - Cadastro',
    faviconUrl: 'https://image.hello.natura.com/lib/fe3611717164077c741373/m/1/7b699e43-8471-4819-8c79-5dd747e5df47.png',
    loaderImageUrl: 'https://image.hello.natura.com/lib/fe3611717164077c741373/m/1/7b699e43-8471-4819-8c79-5dd747e5df47.png',
    redirectUrl: 'https://cloud.hello.avon.com/cadastroavonagradecimento',
    dataExtensionKey: '2D6B0E7A-DE4A-4FD8-92B7-900EBF4B3A60',
    metaDescription: 'Página de cadastro para a campanha da Avon.',
    metaKeywords: 'avon, cadastro, campanha, beleza',
  },
  styles: {
    backgroundColor: '#E4004B',
    backgroundImage: 'https://images.rede.natura.net/html/crm/campanha/20250819/44760-bg.png',
    themeColor: '#E5004B',
    themeColorHover: '#B3003B',
  },
  components: [
    { id: '1', type: 'Header', props: { logoUrl: 'https://gkpb.com.br/wp-content/uploads/2021/01/novo-logo-avon-png.png' } },
    { id: '2', type: 'Banner', props: { imageUrl: 'https://images.rede.natura.net/html/crm/campanha/20250819/44760-banner-topo.png' } },
    { 
      id: '3', 
      type: 'Form', 
      props: {
        fields: {
            name: true,
            email: true,
            phone: true,
            cpf: true,
            city: false,
            birthdate: false,
            optin: true,
        },
        placeholders: {
            name: 'Nome',
            email: 'Email',
            phone: 'Telefone - Ex:(11) 9 9999-9999',
            cpf: 'CPF',
            birthdate: 'Data de Nascimento',
        },
        consentText: `Quero receber novidades e promoções da Natura e de outras empresas do Grupo Natura &Co, por meio do fornecimento dos meus dados para contato via telefone e/ou e-mail, inclusive por parte de Consultoras Natura. Sei que posso revogar meu consentimento e solicitar outros direitos como titular de dados neste <a target="_blank" href="https://privacyportal-br.onetrust.com/webform/00181faa-85e7-4785-848b-f12d02b3f614/6f7e1250-be9f-4b2c-8610-98afc44fb2c0">link</a>. Ao entrar no espaço, estou ciente que o ambiente está sendo filmado e, desde já, AUTORIZO a Natura Cosméticos S/A e todas as empresas do Grupo Natura, ou terceiro à sua ordem, a utilizar meus direitos de personalidade, tais como minha imagem, nome, depoimento e voz, nos materiais de comunicação utilizados pela NATURA&CO para veiculação e divulgação de conteúdo da Ativação TODODIA Cereja na mídia em geral, em todas as formas, e transmissão por qualquer meio de comunicação, pelo prazo de 10 (dez) anos. Entendo que o uso da minha imagem é uma condição para acessar o ambiente e as experiências imersivas nos espaços da Natura na Ativação TODODIA Cereja.`,
        buttonText: 'Finalizar',
      } 
    },
    { 
      id: '4', 
      type: 'Footer', 
      props: { 
        footerText1: `© ${new Date().getFullYear()} Natura. Todos os direitos reservados.`,
        footerText2: `NATURA COSMÉTICOS S/A, com sede na Av. Alexandre Colares, 1188, Vila Jaguara, São Paulo/SP, CEP 05106-000, Fone 0800 11 55 66 de telefones fixos ou 0300 711 55 66 de celulares (custo da ligação local), inscrita no CNPJ sob o n° 71.673.990/0001-77, IM 15.679, IE142.484.958.110, sociedade que executa atividades comerciais em geral e se dedica à pesquisa e desenvolvimento de produtos. Atividades fabris realizadas por INDÚSTRIA E COMÉRCIO DE COSMÉTICOS NATURA LTDA., com sede na Rodovia Anhanguera, s/n, KM 30,5, Prédio C, Polvilho, Cajamar/SP, CEP 07790-190, Fone (11) 4389-7317, inscrita no CNPJ sob o nº 00.190.373/0001-72, IE 241.022.419.113.`,
        footerText3: `Todos os preços e condições deste site são válidos apenas para compras no site. Destacamos que os preços previstos no site prevalecem aos demais anunciados em outros meios de comunicação e sites de buscas. Em caso de divergência, o preço válido é o do carrinho de compras. Imagens meramente ilustrativas. Confira condições na sacola de compras.`,
      }
    },
  ],
};

interface CloudPageForgeProps {
  pageId: string;
}

export function CloudPageForge({ pageId }: CloudPageForgeProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [pageState, setPageState] = useState<CloudPage | null>(null);
  const [htmlCode, setHtmlCode] = useState("");
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [pageName, setPageName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }
    if (!user) {
      setIsLoading(false);
      router.push('/login');
      return;
    }
    
    const fetchPage = async () => {
      setIsLoading(true);
      try {
        if (pageId !== "new") {
          const pageData = await getPage(pageId);
          if (pageData && pageData.userId === user.uid) {
            let needsUpdate = false;
            const updatedComponents = pageData.components.map((component: PageComponent) => {
              if (component.type === 'Form' && (!component.props.placeholders || !component.props.fields)) {
                needsUpdate = true;
                const newProps = { ...component.props };
                if (!newProps.fields) {
                  newProps.fields = { name: true, email: true, phone: true, cpf: true, city: false, birthdate: false, optin: true };
                }
                if (!newProps.placeholders) {
                  newProps.placeholders = { name: 'Nome', email: 'Email', phone: 'Telefone - Ex:(11) 9 9999-9999', cpf: 'CPF', birthdate: 'Data de Nascimento' };
                }
                return { ...component, props: newProps };
              }
              return component;
            });
            if (needsUpdate) {
              pageData.components = updatedComponents;
            }
            setPageState(pageData);
            setPageName(pageData.name);
          } else {
            toast({ variant: "destructive", title: "Erro", description: "Página não encontrada ou acesso negado." });
            router.push('/');
          }
        } else {
          const projectId = new URLSearchParams(window.location.search).get('projectId');
          if (!projectId) {
            toast({ variant: "destructive", title: "Erro", description: "ID do projeto não encontrado." });
            router.push('/');
            return;
          }
          const newPage: CloudPage = {
            ...initialPage,
            id: '',
            userId: user.uid,
            projectId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setPageState(newPage);
          setPageName(newPage.name);
        }
      } catch (error) {
        console.error("Failed to fetch page:", error);
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar a página." });
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [pageId, router, user, toast, authLoading]);
  
  useEffect(() => {
    if(pageState) {
      setHtmlCode(generateHtml(pageState));
    }
  }, [pageState]);

  useEffect(() => {
     if (!pageState) return;

    const title = pageState.meta.title.toLowerCase();
    const isAvon = title.includes('avon');

    const naturaLogo = 'https://i.postimg.cc/Z5TpsSsB/natura-logo-branco.png';
    const naturaFavicon = 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.natura.com.br/&size=64';
    const naturaLoader = 'https://arcgis.natura.com.br/portal/sharing/rest/content/items/32111ed7537b474db26ed253c721117a/data';

    const avonLogo = 'https://gkpb.com.br/wp-content/uploads/2021/01/novo-logo-avon-png.png';
    const avonFavicon = 'https://image.hello.natura.com/lib/fe3611717164077c741373/m/1/7b699e43-8471-4819-8c79-5dd747e5df47.png';
    const avonLoader = 'https://image.hello.natura.com/lib/fe3611717164077c741373/m/1/7b699e43-8471-4819-8c79-5dd747e5df47.png';

    setPageState(prev => {
        if (!prev) return null;
        const headerIndex = prev.components.findIndex(c => c.type === 'Header');
        let needsUpdate = false;
        
        const newLogo = isAvon ? avonLogo : naturaLogo;
        const newFavicon = isAvon ? avonFavicon : naturaLoader;
        const newLoader = isAvon ? avonLoader : naturaLoader;

        const newState = JSON.parse(JSON.stringify(prev));

        if (prev.meta.faviconUrl !== newFavicon || prev.meta.loaderImageUrl !== newLoader) {
            needsUpdate = true;
            newState.meta.faviconUrl = newFavicon;
            newState.meta.loaderImageUrl = newLoader;
        }
        
        if (headerIndex !== -1 && newState.components[headerIndex].props.logoUrl !== newLogo) {
            needsUpdate = true;
            newState.components[headerIndex].props.logoUrl = newLogo;
        }
        
        return needsUpdate ? newState : prev;
    });

  }, [pageState?.meta.title]);

  const handleSave = async () => {
    if (!pageState || !user) return;
    setIsSaving(true);
    
    const finalPageState = { 
        ...pageState, 
        name: pageName,
        userId: user.uid,
    };

    try {
      if (pageId === "new") {
         if (pageName.trim() === "") {
            toast({variant: "destructive", title: "Erro", description: "O nome da página não pode ser vazio."});
            setIsSaving(false);
            return;
        }
        const newPageId = await addPage(finalPageState);
        toast({ title: "Página salva!", description: `A página "${pageName}" foi criada com sucesso.` });
        router.push(`/editor/${newPageId}`);
      } else {
        await updatePage(pageId, finalPageState);
        toast({ title: "Página atualizada!", description: `A página "${pageName}" foi salva com sucesso.` });
      }
    } catch(error) {
         toast({ variant: "destructive", title: "Erro ao salvar", description: "Não foi possível salvar a página." });
         console.error("Save error:", error);
    } finally {
        setIsSaving(false);
    }
  };


  if (isLoading || authLoading || !pageState) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
            <Logo className="h-10 w-10 animate-spin text-primary" />
       </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between h-14 px-4 border-b flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/project/${pageState.projectId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6 text-primary" />
            <h1>Cloud Page Forge</h1>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'Salvando...' : 'Salvar Página'}
        </Button>
      </header>
      <div className="flex flex-grow overflow-hidden">
        <aside className="w-[380px] border-r flex-shrink-0 bg-card/20">
          <SettingsPanel
            pageState={pageState}
            setPageState={setPageState as any}
            selectedComponentId={selectedComponentId}
            setSelectedComponentId={setSelectedComponentId}
            pageName={pageName}
            setPageName={setPageName}
          />
        </aside>
        <main className="flex-grow h-full">
          <MainPanel htmlCode={htmlCode} />
        </main>
      </div>
    </div>
  );
}
