
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CloudPage } from "@/lib/types";
import { generateHtml } from "@/lib/html-generator";
import { SettingsPanel } from "./settings-panel";
import { MainPanel } from "./main-panel";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialPage: CloudPage = {
  id: "new",
  name: "Nova CloudPage",
  projectId: null,
  meta: {
    title: 'Avon - Cadastro',
    faviconUrl: 'https://image.hello.natura.com/lib/fe3611717164077c741373/m/1/7b699e43-8471-4819-8c79-5dd747e5df47.png',
    loaderImageUrl: 'https://image.hello.natura.com/lib/fe3611717164077c741373/m/1/7b699e43-8471-4819-8c79-5dd747e5df47.png',
    redirectUrl: 'https://cloud.hello.avon.com/cadastroavonagradecimento',
    dataExtensionKey: '2D6B0E7A-DE4A-4FD8-92B7-900EBF4B3A60',
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
        namePlaceholder: 'Nome',
        emailPlaceholder: 'Email',
        phonePlaceholder: 'Telefone - Ex:(11) 9 9999-9999',
        cpfPlaceholder: 'CPF',
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
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [pageState, setPageState] = useState<CloudPage>(initialPage);
  const [htmlCode, setHtmlCode] = useState("");
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isSaveAlertOpen, setIsSaveAlertOpen] = useState(false);
  const [pageName, setPageName] = useState(initialPage.name);

  useEffect(() => {
    setIsMounted(true);
    if (pageId !== "new") {
      const storedPages: CloudPage[] = JSON.parse(localStorage.getItem("cloudPages") || "[]");
      const pageToLoad = storedPages.find(p => p.id === pageId);
      if (pageToLoad) {
        setPageState(pageToLoad);
        setPageName(pageToLoad.name);
      } else {
        router.push('/');
      }
    } else {
        const projectId = new URLSearchParams(window.location.search).get('projectId');
        if (!projectId) {
          router.push('/');
          return;
        }
        setPageState(prev => ({...prev, projectId}));
    }
  }, [pageId, router]);
  
  useEffect(() => {
    if(isMounted) {
      setHtmlCode(generateHtml(pageState));
    }
  }, [pageState, isMounted]);

  useEffect(() => {
    const title = pageState.meta.title.toLowerCase();
    const isAvon = title.includes('avon');

    const naturaLogo = 'https://i.postimg.cc/Z5TpsSsB/natura-logo-branco.png';
    const naturaFavicon = 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.natura.com.br/&size=64';
    const naturaLoader = 'https://arcgis.natura.com.br/portal/sharing/rest/content/items/32111ed7537b474db26ed253c721117a/data';

    const avonLogo = 'https://gkpb.com.br/wp-content/uploads/2021/01/novo-logo-avon-png.png';
    const avonFavicon = 'https://image.hello.natura.com/lib/fe3611717164077c741373/m/1/7b699e43-8471-4819-8c79-5dd747e5df47.png';
    const avonLoader = 'https://image.hello.natura.com/lib/fe3611717164077c741373/m/1/7b699e43-8471-4819-8c79-5dd747e5df47.png';

    setPageState(prev => {
        const headerIndex = prev.components.findIndex(c => c.type === 'Header');
        let needsUpdate = false;
        
        const newLogo = isAvon ? avonLogo : naturaLogo;
        const newFavicon = isAvon ? avonFavicon : naturaFavicon;
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

  }, [pageState.meta.title]);

  const handleSave = () => {
    if (pageId === "new") {
      setIsSaveAlertOpen(true);
    } else {
      savePage(pageState.name);
    }
  };

  const savePage = (name: string) => {
    const storedPages: CloudPage[] = JSON.parse(localStorage.getItem("cloudPages") || "[]");
    const newPage = { ...pageState, name, id: pageId === "new" ? Date.now().toString() : pageId };
    
    let updatedPages;
    if (pageId === "new") {
        updatedPages = [...storedPages, newPage];
    } else {
        updatedPages = storedPages.map(p => p.id === pageId ? newPage : p);
    }

    localStorage.setItem("cloudPages", JSON.stringify(updatedPages));
    toast({ title: "Página salva!", description: `A página "${name}" foi salva com sucesso.` });

    if (pageId === "new") {
        router.push(`/editor/${newPage.id}`);
    }
  };

  const handleConfirmSave = () => {
    if (pageName.trim() === "") {
        toast({variant: "destructive", title: "Erro", description: "O nome da página não pode ser vazio."});
        return;
    }
    savePage(pageName);
    setIsSaveAlertOpen(false);
  }

  if (!isMounted || !pageState.projectId) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
            <Logo className="h-10 w-10 animate-pulse text-primary" />
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
        <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Salvar Página
        </Button>
      </header>
      <div className="flex flex-grow overflow-hidden">
        <aside className="w-[380px] border-r flex-shrink-0 bg-card/20">
          <SettingsPanel
            pageState={pageState}
            setPageState={setPageState}
            selectedComponentId={selectedComponentId}
            setSelectedComponentId={setSelectedComponentId}
          />
        </aside>
        <main className="flex-grow h-full">
          <MainPanel htmlCode={htmlCode} />
        </main>
      </div>
       <AlertDialog open={isSaveAlertOpen} onOpenChange={setIsSaveAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Salvar Nova CloudPage</AlertDialogTitle>
            <AlertDialogDescription>
              Dê um nome para a sua nova página para salvá-la.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="page-name">Nome da Página</Label>
            <Input 
              id="page-name"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              className="mt-2"
              placeholder="Ex: Campanha Dia das Mães"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>Salvar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
