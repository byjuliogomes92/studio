
import type { Template } from './types';

// This file contains default templates that are available to all users.
// They are hardcoded here to avoid needing to pre-populate Firestore for every new project.
// Note: These templates don't have id, createdAt, or updatedAt fields like Firestore templates do.

export const defaultTemplates: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>[] = [
  {
    name: 'Lançamento de Produto',
    description: 'Um template elegante para anunciar um novo produto e capturar leads. Foco em imagem e formulário simples.',
    brand: 'Natura', // Legacy brand, will be overridden by Brand Kit
    isDefault: true,
    icon: 'rocket',
    meta: {
        title: 'Lançamento de Produto',
        faviconUrl: '',
        loaderImageUrl: '',
        metaDescription: 'Conheça nosso novo lançamento!',
        metaKeywords: 'lançamento, produto, novidade',
    },
    styles: {
        backgroundColor: '#FFFFFF',
        backgroundImage: '',
        themeColor: '#D97706',
        themeColorHover: '#B45309',
        fontFamily: 'Poppins',
        customCss: ``
    },
    cookieBanner: {
        enabled: true,
        text: 'Utilizamos cookies para personalizar sua experiência. Ao continuar, você concorda com nosso uso de cookies.',
        buttonText: 'Entendi',
    },
    components: [
        {
            id: 'header-launch',
            type: 'Header',
            props: { isSticky: true, logoUrl: 'https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeu_logo_light.svg?alt=media&token=565bfcc8-4fa4-4621-b79a-82261607fba4' },
            order: 0,
            parentId: null,
            column: 0,
            abTestEnabled: false,
            abTestVariants: []
        },
        {
          id: 'div-hero-launch',
          type: 'Div',
          props: {
            styles: {
              isFullWidth: true,
              backgroundType: 'image',
              backgroundImageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=2070&auto=format&fit=crop',
              overlayEnabled: true,
              overlayColor: '#000000',
              overlayOpacity: 0.5,
              paddingTop: '6rem',
              paddingBottom: '6rem',
            },
            layout: {
                horizontalAlign: 'center',
                verticalAlign: 'center',
                gap: '1rem'
            }
          },
          order: 1, parentId: null, column: 0
        },
        { id: `title-launch`, type: 'Title', props: { text: 'A Inovação que Você Esperava Chegou.', styles: { fontSize: '3.5rem', color: '#FFFFFF', textAlign: 'center', maxWidth: '800px' } }, order: 0, parentId: 'div-hero-launch', column: 0 },
        { id: `para-launch`, type: 'Paragraph', props: { text: 'Descubra a combinação perfeita de tecnologia e design, criada para transformar sua rotina. Uma experiência única que redefine o que é possível.', styles: { fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', color: '#E5E7EB', textAlign: 'center' } }, order: 1, parentId: 'div-hero-launch', column: 0 },
        { id: `btn-launch`, type: 'Button', props: { text: 'Ver Demonstração', href: '#' }, order: 2, parentId: 'div-hero-launch', column: 0 },
        {
            id: 'div-form-launch',
            type: 'Div',
            props: {
                styles: { paddingTop: '4rem', paddingBottom: '4rem', paddingLeft: '1rem', paddingRight: '1rem' }
            },
            order: 2, parentId: null, column: 0
        },
        {
            id: 'cols-form-launch',
            type: 'Columns',
            props: {
                columnCount: 2,
                styles: { alignItems: 'center', gap: '4rem' }
            },
            order: 0, parentId: 'div-form-launch', column: 0
        },
        { id: 'img-form-launch', type: 'Image', props: { src: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d54?q=80&w=2070&auto=format&fit=crop', styles: { borderRadius: '1rem' } }, order: 0, parentId: 'cols-form-launch', column: 0 },
        { id: 'subtitle-form-launch', type: 'Subtitle', props: { text: 'Seja o Primeiro a Saber' }, order: 0, parentId: 'cols-form-launch', column: 1 },
        { id: 'p-form-launch', type: 'Paragraph', props: { text: 'Deixe seu e-mail e garanta acesso antecipado e uma oferta exclusiva de lançamento.' }, order: 1, parentId: 'cols-form-launch', column: 1 },
        {
            id: 'form-launch',
            type: 'Form',
            props: {
                fields: { name: { enabled: true }, email: { enabled: true }, optin: {enabled: true} },
                placeholders: { name: 'Seu nome', email: 'Seu melhor e-mail' },
                consentText: 'Sim, quero receber comunicações sobre o lançamento.',
                buttonText: 'Quero Ser VIP!',
                buttonAlign: 'left',
                submission: { message: '<h2>Tudo pronto!</h2><p>Você está na lista. Fique de olho no seu e-mail!</p>' }
            },
            order: 2,
            parentId: 'cols-form-launch',
            column: 1
        },
        {
            id: 'footer-launch',
            type: 'Footer',
            props: {},
            order: 3,
            parentId: null,
            column: 0,
        }
    ]
  },
  {
    name: 'Boas-Vindas & Onboarding',
    description: 'Um template para engajar um novo cliente ou inscrito logo após o cadastro.',
    brand: 'Natura',
    isDefault: true,
    icon: 'handshake',
    meta: {
      title: 'Bem-vindo!',
      faviconUrl: '',
      loaderImageUrl: '',
      metaDescription: 'Bem-vindo(a)! Estamos felizes em ter você conosco.',
      metaKeywords: 'boas-vindas, onboarding, cadastro',
    },
    styles: {
      backgroundColor: '#FEFBF6',
      backgroundImage: '',
      themeColor: '#3A5A40',
      themeColorHover: '#588157',
      fontFamily: 'Lato',
      customCss: '',
    },
    cookieBanner: {
      enabled: true,
      text: 'Este site usa cookies para garantir que você obtenha a melhor experiência.',
      buttonText: 'Aceitar',
    },
    components: [
      { id: 'h-welcome', type: 'Header', props: { logoUrl: 'https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeu_logo_light.svg?alt=media&token=565bfcc8-4fa4-4621-b79a-82261607fba4' }, order: 0, parentId: null, column: 0 },
      { id: 'div-welcome', type: 'Div', props: { layout: { horizontalAlign: 'center', gap: '0.5rem' }, styles: { paddingTop: '4rem', paddingBottom: '3rem' } }, order: 1, parentId: null, column: 0 },
      { id: 't-welcome', type: 'Title', props: { text: 'Que bom ter você aqui, %%FirstName%%!', styles: { textAlign: 'center' } }, order: 0, parentId: 'div-welcome', column: 0 },
      { id: 'p-welcome', type: 'Paragraph', props: { text: 'Estamos muito felizes por você ter se juntado à nossa comunidade. Explore os primeiros passos para aproveitar ao máximo a plataforma.', styles: { textAlign: 'center', fontSize: '1.1rem', maxWidth: '600px' } }, order: 1, parentId: 'div-welcome', column: 0 },
      { id: 'cols-welcome', type: 'Columns', props: { columnCount: 3, styles: { paddingTop: '3rem', paddingBottom: '4rem' } }, order: 2, parentId: null, column: 0 },
      { id: 'div-col1', type: 'Div', props: { layout: { horizontalAlign: 'center', gap: '1rem' } }, order: 0, parentId: 'cols-welcome', column: 0 },
      { id: 'sub1', type: 'Subtitle', props: { text: 'Explore Nossos Produtos', styles: { textAlign: 'center' } }, order: 1, parentId: 'div-col1', column: 0 },
      { id: 'p1', type: 'Paragraph', props: { text: 'Descubra as soluções que criamos pensando em você.', styles: { textAlign: 'center' } }, order: 2, parentId: 'div-col1', column: 0 },
      { id: 'btn1', type: 'Button', props: { text: 'Ver Produtos', href: '#' }, order: 3, parentId: 'div-col1', column: 0 },
      { id: 'div-col2', type: 'Div', props: { layout: { horizontalAlign: 'center', gap: '1rem' } }, order: 0, parentId: 'cols-welcome', column: 1 },
      { id: 'sub2', type: 'Subtitle', props: { text: 'Siga nas Redes Sociais', styles: { textAlign: 'center' } }, order: 1, parentId: 'div-col2', column: 0 },
      { id: 'p2', type: 'Paragraph', props: { text: 'Fique por dentro das novidades e bastidores.', styles: { textAlign: 'center' } }, order: 2, parentId: 'div-col2', column: 0 },
      { id: 'social-welcome', type: 'SocialIcons', props: { links: { instagram: '#', facebook: '#', youtube: '#' } }, order: 3, parentId: 'div-col2', column: 0 },
      { id: 'div-col3', type: 'Div', props: { layout: { horizontalAlign: 'center', gap: '1rem' } }, order: 0, parentId: 'cols-welcome', column: 2 },
      { id: 'sub3', type: 'Subtitle', props: { text: 'Precisa de Ajuda?', styles: { textAlign: 'center' } }, order: 1, parentId: 'div-col3', column: 0 },
      { id: 'p3', type: 'Paragraph', props: { text: 'Nossa central de ajuda está pronta para te auxiliar.', styles: { textAlign: 'center' } }, order: 2, parentId: 'div-col3', column: 0 },
      { id: 'btn3', type: 'Button', props: { text: 'Visitar Suporte', href: '#' }, order: 3, parentId: 'div-col3', column: 0 },
      { id: 'f-welcome', type: 'Footer', props: {}, order: 3, parentId: null, column: 0 },
    ],
  },
  {
    name: 'Divulgação de Evento',
    description: 'Promova um evento ou webinar e capture inscrições com um contador regressivo para urgência.',
    brand: 'Avon',
    isDefault: true,
    icon: 'calendar-clock',
    meta: {
      title: 'Participe do Nosso Evento Exclusivo',
      faviconUrl: '',
      loaderImageUrl: '',
      metaDescription: 'Inscreva-se no nosso evento e aprenda com os melhores.',
      metaKeywords: 'evento, webinar, inscrição, ao vivo',
    },
    styles: {
      backgroundColor: '#111827',
      backgroundImage: '',
      themeColor: '#E11D48',
      themeColorHover: '#F43F5E',
      fontFamily: 'Montserrat',
      customCss: 'h1, h2, h3, p { color: #FFFFFF; }',
    },
    cookieBanner: { enabled: true, text: 'Usamos cookies para melhorar sua experiência.', buttonText: 'Ok' },
    components: [
      { id: 'h-event', type: 'Header', props: { logoUrl: 'https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeu_logo_dark.svg?alt=media&token=300e7d5e-9864-4d98-a72b-ad35e4b37623' }, order: 0, parentId: null, column: 0 },
      { id: 'div-event-hero', type: 'Div', props: { layout: { horizontalAlign: 'center', gap: '1.5rem' }, styles: { paddingTop: '5rem', paddingBottom: '5rem' } }, order: 1, parentId: null, column: 0 },
      { id: 't-event', type: 'Title', props: { text: 'Webinar Exclusivo: O Futuro da Beleza', styles: { textAlign: 'center', fontSize: '3rem', maxWidth: '700px' } }, order: 0, parentId: 'div-event-hero', column: 0 },
      { id: 'p-event', type: 'Paragraph', props: { text: 'Junte-se a nós para uma discussão aprofundada sobre as tendências que estão moldando o futuro da indústria da beleza. Vagas limitadas!', styles: { textAlign: 'center', maxWidth: '600px', fontSize: '1.1rem', color: '#D1D5DB' } }, order: 1, parentId: 'div-event-hero', column: 0 },
      { id: 'cd-event', type: 'Countdown', props: { targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16) }, order: 2, parentId: 'div-event-hero', column: 0 },
      { id: 'cols-event', type: 'Columns', props: { columnCount: 2, styles: { paddingTop: '4rem', paddingBottom: '4rem', alignItems: 'center', gap: '3rem' } }, order: 2, parentId: null, column: 0 },
      { id: 'acc-event', type: 'Accordion', props: { items: [{ id: 'i1', title: 'Agenda do Evento', content: '10:00 - Abertura\\n10:30 - Palestra Principal\\n11:30 - Q&A' }, { id: 'i2', title: 'Palestrantes', content: 'CEO da Empresa, Influenciadora Digital' }] }, order: 0, parentId: 'cols-event', column: 0 },
      { id: 'form-event', type: 'Form', props: { fields: { name: { enabled: true }, email: { enabled: true } }, buttonText: 'Garantir minha vaga', thankYouMessage: '<h3>Inscrição Confirmada!</h3><p>Enviamos os detalhes para o seu e-mail.</p>' }, order: 0, parentId: 'cols-event', column: 1 },
      { id: 'f-event', type: 'Footer', props: {}, order: 3, parentId: null, column: 0 },
    ],
  },
  {
    name: 'Pesquisa NPS',
    description: 'Template simples e direto para coletar feedback de satisfação do cliente (NPS).',
    brand: 'Natura',
    isDefault: true,
    icon: 'smile',
    meta: {
      title: 'Pesquisa de Satisfação',
      faviconUrl: '',
      loaderImageUrl: '',
      metaDescription: 'Sua opinião é importante para nós.',
      metaKeywords: 'nps, pesquisa, feedback, satisfação',
    },
    styles: {
      backgroundColor: '#F9FAFB',
      backgroundImage: '',
      themeColor: '#16A34A',
      themeColorHover: '#15803D',
      fontFamily: 'Open Sans',
      customCss: '',
    },
    cookieBanner: { enabled: false, text: '', buttonText: '' },
    components: [
      { id: 'h-nps', type: 'Header', props: { logoUrl: 'https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeu_logo_light.svg?alt=media&token=565bfcc8-4fa4-4621-b79a-82261607fba4' }, order: 0, parentId: null, column: 0 },
      { id: 'div-nps', type: 'Div', props: { layout: { horizontalAlign: 'center', gap: '1rem' }, styles: { paddingTop: '5rem', paddingBottom: '5rem' } }, order: 1, parentId: null, column: 0 },
      { id: 't-nps', type: 'Title', props: { text: 'Sua opinião é muito importante para nós', styles: { textAlign: 'center', maxWidth: '600px' } }, order: 0, parentId: 'div-nps', column: 0 },
      { id: 'nps-comp', type: 'NPS', props: { question: 'Em uma escala de 0 a 10, o quão provável você é de nos recomendar a um amigo?', lowLabel: 'Pouco Provável', highLabel: 'Muito Provável', thankYouMessage: 'Obrigado pelo seu feedback!' }, order: 1, parentId: 'div-nps', column: 0 },
      { id: 'f-nps', type: 'Footer', props: {}, order: 2, parentId: null, column: 0 },
    ],
  },
  {
    name: 'Página de Agradecimento',
    description: 'Confirme uma ação do usuário e sugira os próximos passos, como ler artigos ou ver produtos.',
    brand: 'Avon',
    isDefault: true,
    icon: 'check-check',
    meta: {
      title: 'Obrigado!',
      faviconUrl: '',
      loaderImageUrl: '',
      metaDescription: 'Agradecemos seu cadastro!',
      metaKeywords: 'obrigado, agradecimento, confirmação',
    },
    styles: {
      backgroundColor: '#FFFFFF',
      backgroundImage: '',
      themeColor: '#6D28D9',
      themeColorHover: '#5B21B6',
      fontFamily: 'Roboto',
      customCss: '',
    },
    cookieBanner: { enabled: true, text: 'Usamos cookies.', buttonText: 'Ok' },
    components: [
      { id: 'h-thanks', type: 'Header', props: { logoUrl: 'https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeu_logo_light.svg?alt=media&token=565bfcc8-4fa4-4621-b79a-82261607fba4' }, order: 0, parentId: null, column: 0 },
      { id: 'div-thanks-title', type: 'Div', props: { layout: { horizontalAlign: 'center', gap: '1rem' }, styles: { paddingTop: '5rem', paddingBottom: '2rem' } }, order: 1, parentId: null, column: 0 },
      { id: 't-thanks', type: 'Title', props: { text: 'Cadastro Realizado com Sucesso!', styles: { textAlign: 'center', color: '#6D28D9' } }, order: 0, parentId: 'div-thanks-title', column: 0 },
      { id: 'p-thanks', type: 'Paragraph', props: { text: 'Enviamos um e-mail de confirmação para você. Enquanto isso, que tal conferir nosso conteúdo exclusivo abaixo?', styles: { textAlign: 'center', maxWidth: '600px' } }, order: 1, parentId: 'div-thanks-title', column: 0 },
      { id: 'div-thanks-cols', type: 'Div', props: { styles: { paddingTop: '2rem', paddingBottom: '5rem' } }, order: 2, parentId: null, column: 0 },
      { id: 'cols-thanks', type: 'Columns', props: { columnCount: 3, styles: { gap: '2rem' } }, order: 0, parentId: 'div-thanks-cols', column: 0 },
      { id: 'div-col1', type: 'Div', props: { layout: { horizontalAlign: 'left', gap: '0.5rem' } }, order: 0, parentId: 'cols-thanks', column: 0 },
      { id: 'img1-thanks', type: 'Image', props: { src: 'https://placehold.co/400x300.png', alt: 'Artigo 1', styles: { borderRadius: '0.5rem' } }, order: 0, parentId: 'div-col1', column: 0 },
      { id: 'sub1-thanks', type: 'Subtitle', props: { text: 'Dicas de Maquiagem' }, order: 1, parentId: 'div-col1', column: 0 },
      { id: 'p1-thanks', type: 'Paragraph', props: { text: 'Aprenda a criar o look perfeito para qualquer ocasião com nossos tutoriais.' }, order: 2, parentId: 'div-col1', column: 0 },
      { id: 'btn1-thanks', type: 'Button', props: { text: 'Ler Artigo', href: '#', variant: 'link' }, order: 3, parentId: 'div-col1', column: 0 },
      { id: 'div-col2', type: 'Div', props: { layout: { horizontalAlign: 'left', gap: '0.5rem' } }, order: 0, parentId: 'cols-thanks', column: 1 },
      { id: 'img2-thanks', type: 'Image', props: { src: 'https://placehold.co/400x300.png', alt: 'Artigo 2', styles: { borderRadius: '0.5rem' } }, order: 0, parentId: 'div-col2', column: 0 },
      { id: 'sub2-thanks', type: 'Subtitle', props: { text: 'Cuidados com a Pele' }, order: 1, parentId: 'div-col2', column: 0 },
      { id: 'p2-thanks', type: 'Paragraph', props: { text: 'Descubra a rotina ideal para a sua pele com recomendações de especialistas.' }, order: 2, parentId: 'div-col2', column: 0 },
      { id: 'btn2-thanks', type: 'Button', props: { text: 'Ver Dicas', href: '#', variant: 'link' }, order: 3, parentId: 'div-col2', column: 0 },
      { id: 'div-col3', type: 'Div', props: { layout: { horizontalAlign: 'left', gap: '0.5rem' } }, order: 0, parentId: 'cols-thanks', column: 2 },
      { id: 'img3-thanks', type: 'Image', props: { src: 'https://placehold.co/400x300.png', alt: 'Artigo 3', styles: { borderRadius: '0.5rem' } }, order: 0, parentId: 'div-col3', column: 0 },
      { id: 'sub3-thanks', type: 'Subtitle', props: { text: 'Fragrâncias' }, order: 1, parentId: 'div-col3', column: 0 },
      { id: 'p3-thanks', type: 'Paragraph', props: { text: 'Encontre o perfume que mais combina com você em nossa seleção exclusiva.' }, order: 2, parentId: 'div-col3', column: 0 },
      { id: 'btn3-thanks', type: 'Button', props: { text: 'Explorar', href: '#', variant: 'link' }, order: 3, parentId: 'div-col3', column: 0 },
      { id: 'f-thanks', type: 'Footer', props: {}, order: 3, parentId: null, column: 0 },
    ],
  },
  {
    name: 'Página "Em Breve"',
    description: 'Página de manutenção ou "coming soon" para capturar o interesse antes do lançamento.',
    brand: 'Natura',
    isDefault: true,
    icon: 'party-popper',
    meta: {
      title: 'Em Breve: Novidades Incríveis',
      faviconUrl: '',
      loaderImageUrl: '',
      metaDescription: 'Estamos preparando algo novo para você.',
      metaKeywords: 'em breve, lançamento, novidade',
    },
    styles: {
      backgroundColor: '#FFFFFF',
      backgroundImage: '',
      themeColor: '#0F766E',
      themeColorHover: '#0D9488',
      fontFamily: 'Inter',
      customCss: '',
    },
    cookieBanner: { enabled: false, text: '', buttonText: '' },
    components: [
       {
            id: 'div-soon-hero',
            type: 'Div',
            props: {
                styles: {
                    isFullWidth: true,
                    backgroundImageUrl: 'https://images.unsplash.com/photo-1559024926-75314d33a9e9?q=80&w=2070&auto=format&fit=crop',
                    overlayEnabled: true,
                    overlayColor: '#000000',
                    overlayOpacity: 0.6,
                    height: '100vh',
                },
                layout: {
                    horizontalAlign: 'center',
                    verticalAlign: 'center',
                    gap: '1.5rem'
                }
            },
            order: 0, parentId: null, column: 0
       },
      { id: 't-soon', type: 'Title', props: { text: 'Algo incrível está a caminho.', styles: { textAlign: 'center', fontSize: '3.5rem', color: '#FFFFFF' } }, order: 0, parentId: 'div-soon-hero', column: 0 },
      { id: 'p-soon', type: 'Paragraph', props: { text: 'Nossa nova coleção está quase pronta para ser revelada. Deixe seu e-mail abaixo para ser o primeiro a saber quando lançarmos e receba um desconto especial.', styles: { textAlign: 'center', maxWidth: '600px', color: '#D1D5DB' } }, order: 1, parentId: 'div-soon-hero', column: 0 },
      { id: 'form-soon', type: 'Form', props: { fields: { email: { enabled: true } }, buttonText: 'Avise-me!', submission: { message: '<h4>Confirmado!</h4><p>Você será notificado assim que lançarmos.</p>' } }, order: 2, parentId: 'div-soon-hero', column: 0 },
      { id: 'social-soon', type: 'SocialIcons', props: { links: { instagram: '#' }, styles: { align: 'center', color: '#FFFFFF' } }, order: 3, parentId: 'div-soon-hero', column: 0 },
    ],
  },
];
