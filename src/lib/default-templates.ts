
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
        customCss: ''
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
            props: {}, // Will be set by brand selection
            order: 2,
            parentId: null,
            column: 0,
            abTestEnabled: false,
            abTestVariants: []
        }
    ]
  },
  // Add other default templates here in the future
];
