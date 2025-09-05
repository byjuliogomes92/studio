
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
        customCss: `
        .columns-container {
            align-items: center;
        }
        .component-wrapper img {
            border-radius: 0.75rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }`
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
            props: { logoUrl: 'https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeu_logo_light.svg?alt=media&token=565bfcc8-4fa4-4621-b79a-82261607fba4' },
            order: 0,
            parentId: null,
            column: 0,
            abTestEnabled: false,
            abTestVariants: []
        },
        {
            id: 'columns-hero',
            type: 'Columns',
            props: { columnCount: 2 },
            order: 1,
            parentId: null,
            column: 0,
            abTestEnabled: false,
            abTestVariants: [],
        },
        {
            id: 'title-launch',
            type: 'Title',
            props: { 
                text: 'A Inovação que Você Esperava Chegou.',
                styles: { fontSize: '2.5rem', lineHeight: '1.2' }
            },
            order: 0,
            parentId: 'columns-hero',
            column: 0,
            abTestEnabled: false,
            abTestVariants: []
        },
        {
            id: 'paragraph-launch',
            type: 'Paragraph',
            props: { 
                text: 'Descubra a combinação perfeita de tecnologia e design, criada para transformar sua rotina. Inscreva-se para ser o primeiro a saber de tudo e receber uma oferta exclusiva de lançamento.',
                styles: { fontSize: '1.1rem', color: '#4B5563' }
             },
            order: 1,
            parentId: 'columns-hero',
            column: 0,
            abTestEnabled: false,
            abTestVariants: []
        },
        {
            id: 'form-launch',
            type: 'Form',
            props: {
                fields: { name: true, email: true, phone: false, cpf: false, city: false, birthdate: false, optin: true },
                placeholders: { name: 'Seu nome', email: 'Seu melhor e-mail' },
                consentText: 'Sim, quero receber comunicações sobre o lançamento e ofertas especiais.',
                buttonText: 'Quero Ser o Primeiro!',
                buttonAlign: 'left',
                thankYouMessage: '<h2>Tudo pronto!</h2><p>Você está na lista. Fique de olho no seu e-mail!</p>'
            },
            order: 2,
            parentId: 'columns-hero',
            column: 0,
            abTestEnabled: false,
            abTestVariants: []
        },
        {
            id: 'image-launch',
            type: 'Image',
            props: {
                src: 'https://placehold.co/600x600.png',
                alt: 'Imagem do novo produto em destaque'
            },
            order: 0,
            parentId: 'columns-hero',
            column: 1,
            abTestEnabled: false,
            abTestVariants: []
        },
        {
            id: 'footer-launch',
            type: 'Footer',
            props: {},
            order: 2,
            parentId: null,
            column: 0,
            abTestEnabled: false,
            abTestVariants: []
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
      { id: 'h-welcome', type: 'Header', props: { logoUrl: 'https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeu_logo_light.svg?alt=media&token=565bfcc8-4fa4-4621-b79a-82261607fba4' }, order: 0, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'b-welcome', type: 'Banner', props: { imageUrl: 'https://placehold.co/800x250.png', alt: 'Pessoas felizes usando produtos' }, order: 1, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 't-welcome', type: 'Title', props: { text: 'Que bom ter você aqui, [Nome]!', styles: { textAlign: 'center', marginTop: '20px' } }, order: 2, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'p-welcome', type: 'Paragraph', props: { text: 'Estamos muito felizes por você ter se juntado à nossa comunidade. Explore nossos produtos, descubra nossas histórias e aproveite todos os benefícios que preparamos para você. Para começar, que tal nos seguir nas redes sociais?', styles: { textAlign: 'center', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' } }, order: 3, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'btn-welcome', type: 'Button', props: { text: 'Explore Nossos Produtos', href: '#', align: 'center' }, order: 4, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'social-welcome', type: 'SocialIcons', props: { links: { instagram: '#', facebook: '#', youtube: '#' }, styles: { align: 'center', iconSize: '28px' } }, order: 5, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'f-welcome', type: 'Footer', props: {}, order: 6, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
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
      customCss: 'h1, h2, p { color: #FFFFFF; }',
    },
    cookieBanner: { enabled: true, text: 'Usamos cookies para melhorar sua experiência.', buttonText: 'Ok' },
    components: [
      { id: 'h-event', type: 'Header', props: { logoUrl: 'https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeu_logo_dark.svg?alt=media&token=300e7d5e-9864-4d98-a72b-ad35e4b37623' }, order: 0, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 't-event', type: 'Title', props: { text: 'Webinar Exclusivo: O Futuro da Beleza', styles: { textAlign: 'center' } }, order: 1, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'cd-event', type: 'Countdown', props: { targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), styles: { color: 'white', fontSize: '2.5rem' } }, order: 2, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'p-event', type: 'Paragraph', props: { text: 'Junte-se a nós para uma discussão aprofundada sobre as tendências que estão moldando o futuro da indústria da beleza. Vagas limitadas!' }, order: 3, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'acc-event', type: 'Accordion', props: { items: [{ id: 'i1', title: 'Agenda do Evento', content: '10:00 - Abertura\n10:30 - Palestra Principal\n11:30 - Q&A' }, { id: 'i2', title: 'Palestrantes', content: 'CEO da Empresa, Influenciadora Digital' }] }, order: 4, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'form-event', type: 'Form', props: { fields: { name: true, email: true, optin: false }, buttonText: 'Garantir minha vaga', thankYouMessage: '<h3>Inscrição Confirmada!</h3><p>Enviamos os detalhes para o seu e-mail.</p>' }, order: 5, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'f-event', type: 'Footer', props: {}, order: 6, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
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
      { id: 'h-nps', type: 'Header', props: { logoUrl: 'https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeu_logo_light.svg?alt=media&token=565bfcc8-4fa4-4621-b79a-82261607fba4' }, order: 0, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 't-nps', type: 'Title', props: { text: 'Sua opinião é muito importante para nós', styles: { textAlign: 'center' } }, order: 1, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'nps-comp', type: 'NPS', props: { question: 'Em uma escala de 0 a 10, o quão provável você é de nos recomendar a um amigo?', lowLabel: 'Pouco Provável', highLabel: 'Muito Provável', thankYouMessage: 'Obrigado pelo seu feedback!' }, order: 2, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'form-nps', type: 'Form', props: { fields: { email: true }, placeholders: { email: 'Confirme seu e-mail para registrar a pesquisa' }, buttonText: 'Enviar Feedback' }, order: 3, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'f-nps', type: 'Footer', props: {}, order: 4, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
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
      { id: 'h-thanks', type: 'Header', props: { logoUrl: 'https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeu_logo_light.svg?alt=media&token=565bfcc8-4fa4-4621-b79a-82261607fba4' }, order: 0, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 't-thanks', type: 'Title', props: { text: 'Cadastro Realizado com Sucesso!', styles: { textAlign: 'center', color: '#6D28D9' } }, order: 1, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'p-thanks', type: 'Paragraph', props: { text: 'Enviamos um e-mail de confirmação para você. Enquanto isso, que tal conferir nosso conteúdo exclusivo abaixo?', styles: { textAlign: 'center' } }, order: 2, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'cols-thanks', type: 'Columns', props: { columnCount: 3 }, order: 3, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'img1-thanks', type: 'Image', props: { src: 'https://placehold.co/400x300.png', alt: 'Artigo 1' }, order: 0, parentId: 'cols-thanks', column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'p1-thanks', type: 'Paragraph', props: { text: '<b>Dicas de Maquiagem</b><br>Aprenda a criar o look perfeito para qualquer ocasião.' }, order: 1, parentId: 'cols-thanks', column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'img2-thanks', type: 'Image', props: { src: 'https://placehold.co/400x300.png', alt: 'Artigo 2' }, order: 0, parentId: 'cols-thanks', column: 1, abTestEnabled: false, abTestVariants: [] },
      { id: 'p2-thanks', type: 'Paragraph', props: { text: '<b>Cuidados com a Pele</b><br>Descubra a rotina ideal para a sua pele.' }, order: 1, parentId: 'cols-thanks', column: 1, abTestEnabled: false, abTestVariants: [] },
      { id: 'img3-thanks', type: 'Image', props: { src: 'https://placehold.co/400x300.png', alt: 'Artigo 3' }, order: 0, parentId: 'cols-thanks', column: 2, abTestEnabled: false, abTestVariants: [] },
      { id: 'p3-thanks', type: 'Paragraph', props: { text: '<b>Fragrâncias</b><br>Encontre o perfume que mais combina com você.' }, order: 1, parentId: 'cols-thanks', column: 2, abTestEnabled: false, abTestVariants: [] },
      { id: 'f-thanks', type: 'Footer', props: {}, order: 4, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
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
      backgroundColor: '#F1F5F9',
      backgroundImage: 'https://images.unsplash.com/photo-1559024926-75314d33AP9e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      themeColor: '#0F766E',
      themeColorHover: '#0D9488',
      fontFamily: 'Inter',
      customCss: `
      .container {
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
      }
      `,
    },
    cookieBanner: { enabled: false, text: '', buttonText: '' },
    components: [
      { id: 'h-soon', type: 'Header', props: { logoUrl: 'https://firebasestorage.googleapis.com/v0/b/quizkong-mvp.firebasestorage.app/o/morfeu_logo_dark.svg?alt=media&token=300e7d5e-9864-4d98-a72b-ad35e4b37623' }, order: 0, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 't-soon', type: 'Title', props: { text: 'Estamos preparando algo incrível para você.', styles: { textAlign: 'center', fontSize: '2.5rem' } }, order: 1, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'p-soon', type: 'Paragraph', props: { text: 'Nossa nova coleção está quase pronta para ser revelada. Deixe seu e-mail abaixo para ser o primeiro a saber quando lançarmos e receba um desconto especial.', styles: { textAlign: 'center' } }, order: 2, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'form-soon', type: 'Form', props: { fields: { email: true, optin: true }, consentText: 'Aceito receber notícias sobre o lançamento.', buttonText: 'Avise-me!', thankYouMessage: '<h4>Confirmado!</h4><p>Você será notificado assim que lançarmos.</p>' }, order: 3, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'social-soon', type: 'SocialIcons', props: { links: { instagram: '#' }, styles: { align: 'center' } }, order: 4, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
      { id: 'f-soon', type: 'Footer', props: {}, order: 5, parentId: null, column: 0, abTestEnabled: false, abTestVariants: [] },
    ],
  },
];
