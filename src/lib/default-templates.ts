
import type { Template } from './types';

// This file contains default templates that are available to all users.
// They are hardcoded here to avoid needing to pre-populate Firestore for every new project.
// Note: These templates don't have id, createdAt, or updatedAt fields like Firestore templates do.

export const defaultTemplates: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>[] = [
  {
    name: 'Lançamento de Produto',
    description: 'Um template elegante para anunciar um novo produto e capturar leads. Foco em imagem e formulário simples.',
    brand: 'Natura', // Default brand, can be changed on page creation
    isDefault: true,
    meta: {
        title: 'Lançamento de Produto',
        faviconUrl: '',
        loaderImageUrl: '',
        metaDescription: 'Conheça nosso novo lançamento!',
        metaKeywords: 'lançamento, produto, novidade',
    },
    styles: {
        backgroundColor: '#F3F4F6', // Light Gray
        backgroundImage: '',
        themeColor: '#D97706', // Amber 600
        themeColorHover: '#B45309', // Amber 700
        fontFamily: 'Poppins',
        customCss: `
            .content-wrapper {
                padding: 0;
            }
            .launch-hero {
                display: flex;
                align-items: center;
                gap: 2rem;
                padding: 3rem 2rem;
            }
             .launch-hero .text-content {
                flex: 1;
            }
            .launch-hero .image-content {
                flex: 1;
            }
             .launch-hero .image-content img {
                border-radius: 0.75rem;
                box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
            }

            @media (max-width: 768px) {
                .launch-hero {
                    flex-direction: column-reverse;
                }
            }
        `
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
            props: { logoUrl: '' }, // Will be set by brand selection
            order: 0,
            parentId: null,
        },
        {
            id: 'columns-hero',
            type: 'Columns',
            props: { columnCount: 2 },
            order: 1,
            parentId: null,
            children: [
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
                }
            ]
        },
        {
            id: 'footer-launch',
            type: 'Footer',
            props: {}, // Will be set by brand selection
            order: 2,
            parentId: null,
        }
    ]
  },
  // Add other default templates here in the future
];
