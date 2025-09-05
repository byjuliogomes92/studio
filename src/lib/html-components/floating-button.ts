
import type { PageComponent, Action } from '@/lib/types';

export function renderFloatingButton(component: PageComponent): string {
    const { 
        type = 'icon',
        icon = 'plus',
        imageUrl = '',
        action = { type: 'URL', url: '#' } as Action,
        position = 'bottom-right',
        size = 60,
        backgroundColor = 'var(--theme-color)',
        iconColor = '#FFFFFF',
        showOnScroll = false,
        scrollOffset = 100
    } = component.props;

    const lucideIconSvgs: Record<string, string> = {
        plus: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" y2="19"></line><line x1="5" y1="12" y2="19" y1="12"></line></svg>',
        'message-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>',
        'arrow-up': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>',
        'download': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" y2="3"></line></svg>',
    };
    
    let href = '#';
    if (action.type === 'URL') {
        href = action.url || '#';
    } else if (action.type === 'PAGE' && action.pageId) {
        href = `%%=CloudPagesURL(${action.pageId})=%%`;
    }

    const positionStyles: Record<string, string> = {
        'bottom-right': 'bottom: 20px; right: 20px;',
        'bottom-left': 'bottom: 20px; left: 20px;',
        'top-right': 'top: 20px; right: 20px;',
        'top-left': 'top: 20px; left: 20px;',
    };
    
    let content = '';
    let linkStyle = '';

    if (type === 'image' && imageUrl) {
        content = `<img src="${imageUrl}" alt="Floating Button" style="width: 100%; height: auto; display: block;">`;
        linkStyle = `
            width: ${size}px; 
            height: auto; 
            background-color: transparent; 
            box-shadow: none;
        `;
    } else {
        content = lucideIconSvgs[icon] || lucideIconSvgs.plus;
        linkStyle = `
            width: ${size}px; 
            height: ${size}px; 
            background-color: ${backgroundColor}; 
            color: ${iconColor};
            border-radius: 50%;
        `;
    }

    const wrapperId = `floating-button-wrapper-${component.id}`;

    return `
        <div 
            id="${wrapperId}"
            class="floating-button-wrapper"
            style="${positionStyles[position]}"
            data-show-on-scroll="${showOnScroll}"
            data-scroll-offset="${scrollOffset}"
        >
            <a 
                href="${href}" 
                class="floating-button-link"
                target="_blank"
                rel="noopener noreferrer"
                style="${linkStyle}"
            >
                ${content}
            </a>
        </div>
    `;
}
