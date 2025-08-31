
import type { PageComponent, HeaderLink } from '@/lib/types';

export function renderHeader(component: PageComponent): string {
    const { 
        layout = 'logo-left-menu-right', 
        logoUrl = 'https://i.postimg.cc/Z5TpsSsB/natura-logo-branco.png', 
        links = [], 
        buttonText, 
        buttonUrl, 
        logoHeight = 40,
        isSticky = false,
        backgroundColor = '#ffffff00',
        textColor = '#000000',
        backgroundColorOnScroll = '#ffffffff',
        textColorOnScroll = '#000000',
    } = component.props;
    
    const menuItems = links.map((link: HeaderLink) => `<li><a href="${link.url}">${link.text}</a></li>`).join('');
    const buttonHtml = layout.includes('button') && buttonText && buttonUrl ? `<a href="${buttonUrl}" class="header-button">${buttonText}</a>` : '';

    const stickyAttrs = isSticky ? `
        data-sticky="true"
        data-bg-top="${backgroundColor}"
        data-text-color-top="${textColor}"
        data-bg-scroll="${backgroundColorOnScroll}"
        data-text-color-scroll="${textColorOnScroll}"
    ` : '';

    return `
        <header class="page-header" data-layout="${layout}" ${stickyAttrs}>
            <div class="header-logo">
                <img src="${logoUrl}" alt="Logo" style="height: ${logoHeight}px;">
            </div>
            ${layout.includes('menu') ? `<nav class="header-nav"><ul>${menuItems}</ul></nav>` : ''}
            ${buttonHtml}
            <button class="mobile-menu-toggle">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
        </header>
    `;
}
