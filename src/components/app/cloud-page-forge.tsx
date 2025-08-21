
"use client";

import { useState, useEffect } from "react";
import type { CloudPage } from "@/lib/types";
import { generateHtml } from "@/lib/html-generator";
import { SettingsPanel } from "./settings-panel";
import { MainPanel } from "./main-panel";
import { Logo } from "@/components/icons";

const initialPage: CloudPage = {
  meta: {
    title: 'Avon - Cadastro',
    faviconUrl: 'https://image.hello.natura.com/lib/fe3611717164077c741373/m/1/7b699e43-8471-4819-8c79-5dd747e5df47.png',
    loaderImageUrl: 'https://image.hello.natura.com/lib/fe3611717164077c741373/m/1/7b699e43-8471-4819-8c79-5dd747e5df47.png',
    redirectUrl: 'https://cloud.hello.avon.com/cadastroavonagradecimento',
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

export function CloudPageForge() {
  const [isMounted, setIsMounted] = useState(false);
  const [pageState, setPageState] = useState<CloudPage>(initialPage);
  const [htmlCode, setHtmlCode] = useState("");
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    if(isMounted) {
      setHtmlCode(generateHtml(pageState));
    }
  }, [pageState, isMounted]);

  useEffect(() => {
    const headerIndex = pageState.components.findIndex(c => c.type === 'Header');
    if (headerIndex === -1) return;

    const currentLogo = pageState.components[headerIndex].props.logoUrl;
    const title = pageState.meta.title.toLowerCase();
    const avonLogo = 'https://gkpb.com.br/wp-content/uploads/2021/01/novo-logo-avon-png.png';
    const naturaLogo = 'https://i.postimg.cc/Z5TpsSsB/natura-logo-branco.png';
    
    let newLogo = currentLogo;

    if (title.includes('avon') && currentLogo !== avonLogo) {
      newLogo = avonLogo;
    } else if (!title.includes('avon') && currentLogo !== naturaLogo) {
      newLogo = naturaLogo;
    }

    if (newLogo !== currentLogo) {
        setPageState(prev => {
            const newComponents = [...prev.components];
            newComponents[headerIndex] = {
                ...newComponents[headerIndex],
                props: {
                    ...newComponents[headerIndex].props,
                    logoUrl: newLogo
                }
            };
            return {...prev, components: newComponents};
        });
    }
  }, [pageState.meta.title]);

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center h-14 px-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2 font-semibold">
          <Logo className="h-6 w-6 text-primary" />
          <h1>Cloud Page Forge</h1>
        </div>
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
    </div>
  );
}

    