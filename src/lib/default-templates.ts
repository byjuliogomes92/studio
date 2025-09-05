
import type { Template } from './types';

export const defaultTemplates: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'workspaceId' | 'isDefault'>[] = [
    {
        name: "Lançamento de Produto",
        description: "Template de uma coluna com imagem de fundo, título, parágrafo e formulário. Ideal para anunciar um novo produto ou serviço.",
        brand: "Natura",
        icon: 'rocket',
        styles: {
            backgroundColor: "#ffffff",
            backgroundImage: "",
            themeColor: "#FF6900",
            themeColorHover: "#E65E00",
            fontFamily: "Roboto, sans-serif",
            customCss: "",
        },
        components: [
            {
                id: 'div-hero', type: 'Div', parentId: null, column: 0, order: 0, props: {
                    styles: {
                        isFullWidth: true,
                        backgroundType: 'image',
                        backgroundImageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=2726&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                        paddingTop: '6rem',
                        paddingBottom: '6rem',
                        overlayEnabled: true,
                        overlayColor: '#000000',
                        overlayOpacity: 0.4
                    },
                    layout: { flexDirection: 'column', verticalAlign: 'center', horizontalAlign: 'center', gap: '1rem' }
                }
            },
            { id: 'title-1', type: 'Title', parentId: 'div-hero', column: 0, order: 0, props: { text: 'Produto Inovador Chegou', styles: { color: '#FFFFFF', fontSize: '3rem', textAlign: 'center' } } },
            { id: 'para-1', type: 'Paragraph', parentId: 'div-hero', column: 0, order: 1, props: { text: 'Descubra a solução que vai revolucionar o seu dia a dia. Design moderno, funcionalidade incrível e um preço que você não vai acreditar.', styles: { color: '#FFFFFF', textAlign: 'center', maxWidth: '600px' } } },
            {
                id: 'cols-main', type: 'Columns', parentId: null, column: 0, order: 1, props: {
                    columnCount: 2,
                    styles: { paddingTop: '4rem', paddingBottom: '4rem', gap: '3rem', alignItems: 'center' }
                }
            },
            { id: 'para-2', type: 'Paragraph', parentId: 'cols-main', column: 0, order: 0, props: { text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa.' } },
            {
                id: 'form-1', type: 'Form', parentId: 'cols-main', column: 1, order: 0, props: {
                    fields: { name: { enabled: true }, email: { enabled: true } },
                    buttonText: 'Quero Saber Mais!',
                    submission: { message: `<h2>Tudo pronto!</h2><p>Você está na lista. Fique de olho no seu e-mail!</p>` }
                }
            },
        ],
        meta: {
            title: "Lançamento de Produto",
            faviconUrl: "https://i.postimg.cc/pVd0p0Zg/favicon-Natura.png",
        },
    },
    {
        name: "Boas-Vindas",
        description: "Um template para agradecer o cadastro e guiar o usuário para os próximos passos.",
        brand: "Natura",
        icon: 'handshake',
        styles: {
            backgroundColor: "#f4f4f4",
            backgroundImage: "",
            themeColor: "#FF6900",
            themeColorHover: "#E65E00",
            fontFamily: "Roboto, sans-serif",
            customCss: "",
        },
        components: [
            {
                id: 'div-welcome', type: 'Div', parentId: null, column: 0, order: 0, props: {
                    styles: { paddingTop: '4rem', paddingBottom: '4rem' },
                    layout: { flexDirection: 'column', verticalAlign: 'center', horizontalAlign: 'center', gap: '0.5rem' }
                }
            },
            { id: 'title-welcome', type: 'Title', parentId: 'div-welcome', column: 0, order: 0, props: { text: 'Seja Bem-Vindo(a), %%FirstName%%!', dataBinding: 'FirstName', styles: { textAlign: 'center' } } },
            { id: 'para-welcome', type: 'Paragraph', parentId: 'div-welcome', column: 0, order: 1, props: { text: 'Estamos muito felizes em ter você conosco. Explore os links abaixo para começar.', styles: { textAlign: 'center' } } },
            {
                id: 'cols-links', type: 'Columns', parentId: null, column: 0, order: 1, props: {
                    columnCount: 3, styles: { paddingBottom: '4rem', gap: '1.5rem' }
                }
            },
            { id: 'div-link-1', type: 'Div', parentId: 'cols-links', column: 0, order: 0, props: { styles: { border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }, layout: { flexDirection: 'column', verticalAlign: 'center', horizontalAlign: 'center', gap: '1rem' } } },
            { id: 'title-link-1', type: 'Subtitle', parentId: 'div-link-1', column: 0, order: 0, props: { text: 'Explore o Catálogo', styles: { textAlign: 'center' } } },
            { id: 'btn-link-1', type: 'Button', parentId: 'div-link-1', column: 0, order: 1, props: { text: 'Ver Produtos', href: '#' } },
            { id: 'div-link-2', type: 'Div', parentId: 'cols-links', column: 1, order: 0, props: { styles: { border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }, layout: { flexDirection: 'column', verticalAlign: 'center', horizontalAlign: 'center', gap: '1rem' } } },
            { id: 'title-link-2', type: 'Subtitle', parentId: 'div-link-2', column: 0, order: 0, props: { text: 'Fale Conosco', styles: { textAlign: 'center' } } },
            { id: 'btn-link-2', type: 'Button', parentId: 'div-link-2', column: 0, order: 1, props: { text: 'Entrar em Contato', href: '#' } },
            { id: 'div-link-3', type: 'Div', parentId: 'cols-links', column: 2, order: 0, props: { styles: { border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }, layout: { flexDirection: 'column', verticalAlign: 'center', horizontalAlign: 'center', gap: '1rem' } } },
            { id: 'title-link-3', type: 'Subtitle', parentId: 'div-link-3', column: 0, order: 0, props: { text: 'Siga nas Redes', styles: { textAlign: 'center' } } },
            { id: 'social-1', type: 'SocialIcons', parentId: 'div-link-3', column: 0, order: 1, props: { links: { facebook: '#', instagram: '#' } } },
        ],
        meta: {
            title: "Boas-Vindas",
            faviconUrl: "https://i.postimg.cc/pVd0p0Zg/favicon-Natura.png",
        },
    },
    {
        name: "Divulgação de Evento",
        description: "Template focado em conversão para eventos, com contador regressivo e agenda.",
        brand: "Avon",
        icon: 'calendar-clock',
        styles: {
            backgroundColor: "#1c1c1c",
            backgroundImage: "",
            themeColor: "#D80027",
            themeColorHover: "#B30020",
            fontFamily: "Poppins, sans-serif",
            customCss: "",
        },
        components: [
            {
                id: 'div-hero-event', type: 'Div', parentId: null, column: 0, order: 0, props: {
                    styles: { isFullWidth: true, backgroundColor: '#000000', paddingTop: '5rem', paddingBottom: '5rem' },
                    layout: { flexDirection: 'column', verticalAlign: 'center', horizontalAlign: 'center', gap: '1.5rem' }
                }
            },
            { id: 'title-event', type: 'Title', parentId: 'div-hero-event', column: 0, order: 0, props: { text: 'Webinar Exclusivo', styles: { color: '#FFFFFF', fontSize: '3.5rem', textAlign: 'center' } } },
            { id: 'para-event', type: 'Paragraph', parentId: 'div-hero-event', column: 0, order: 1, props: { text: 'Junte-se a nós para um evento online imperdível sobre as tendências do mercado de beleza para 2025.', styles: { color: '#e0e0e0', textAlign: 'center', maxWidth: '700px' } } },
            { id: 'countdown-1', type: 'Countdown', parentId: 'div-hero-event', column: 0, order: 2, props: { targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), backgroundColor: '#333333', digitColor: '#FFFFFF' } },
            { id: 'btn-event', type: 'Button', parentId: 'div-hero-event', column: 0, order: 3, props: { text: 'Garanta sua Vaga Agora', href: '#form-inscricao', styles: { padding: '1rem 2rem', fontSize: '1.2rem' } } },
            {
                id: 'cols-agenda', type: 'Columns', parentId: null, column: 0, order: 1, props: {
                    columnCount: 2, styles: { paddingTop: '4rem', paddingBottom: '4rem', gap: '3rem', alignItems: 'center', backgroundColor: '#1c1c1c' }
                }
            },
            {
                id: 'div-agenda-text', type: 'Div', parentId: 'cols-agenda', column: 0, order: 0, props: {
                    layout: { flexDirection: 'column', gap: '1rem' }
                }
            },
            { id: 'title-agenda', type: 'Title', parentId: 'div-agenda-text', column: 0, order: 0, props: { text: 'O que você vai aprender', styles: { color: '#FFFFFF' } } },
            { id: 'para-agenda-1', type: 'Paragraph', parentId: 'div-agenda-text', column: 0, order: 1, props: { text: '✔ As principais inovações em produtos.', styles: { color: '#cccccc' } } },
            { id: 'para-agenda-2', type: 'Paragraph', parentId: 'div-agenda-text', column: 0, order: 2, props: { text: '✔ Estratégias de marketing digital para o setor.', styles: { color: '#cccccc' } } },
            { id: 'para-agenda-3', type: 'Paragraph', parentId: 'div-agenda-text', column: 0, order: 3, props: { text: '✔ Como criar uma marca pessoal de sucesso.', styles: { color: '#cccccc' } } },
            { id: 'div-form-inscricao', type: 'Div', parentId: 'cols-agenda', column: 1, order: 0, props: { idOverride: 'form-inscricao', styles: { backgroundColor: '#2d2d2d', padding: '2rem', borderRadius: '12px' } } },
            { id: 'title-form', type: 'Title', parentId: 'div-form-inscricao', column: 0, order: 0, props: { text: 'Inscreva-se Gratuitamente', styles: { color: '#FFFFFF', textAlign: 'center' } } },
            {
                id: 'form-event', type: 'Form', parentId: 'div-form-inscricao', column: 0, order: 1, props: {
                    fields: { name: { enabled: true }, email: { enabled: true } },
                    buttonText: 'Inscrever',
                    submission: { message: 'Inscrição confirmada! Enviamos os detalhes para o seu e-mail.' }
                }
            },
        ],
        meta: {
            title: "Webinar Exclusivo",
            faviconUrl: "https://i.postimg.cc/pXq9SjVz/favicon-Avon.png",
        },
    },
];
