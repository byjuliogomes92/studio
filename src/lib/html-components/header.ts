
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
        overlay = false,
        backgroundColor = '#ffffff', // Default to white
        backgroundColorOnScroll = '#ffffff',
        textColorOnScroll = '#000000',
        mobileMenuBehavior = 'push',
        borderRadius,
        backgroundType = 'solid',
        gradientFrom,
        gradientTo,
    } = component.props;
    
    const menuItems = links.map((link: HeaderLink) => `<li><a href="${link.url}">${link.text}</a></li>`).join('');
    
    const showMenu = layout.includes('menu');
    const showButton = layout.includes('button');
    
    const buttonHtml = showButton && buttonText && buttonUrl 
        ? `<a href="${buttonUrl}" class="header-button">${buttonText}</a>` 
        : '';
        
    const navHtml = showMenu ? `<nav class="header-nav"><ul>${menuItems}</ul></nav>` : '';

    const stickyAttrs = isSticky ? `
        data-sticky="true"
        data-bg-scroll="${backgroundColorOnScroll}"
        data-text-color-scroll="${textColorOnScroll}"
    ` : '';

    const overlayAttr = overlay ? 'data-overlay="true"' : '';
    
    let leftContent = `<div class="header-logo">
                <img src="${logoUrl}" alt="Logo" style="height: ${logoHeight}px;">
            </div>`;
    let centerContent = '';
    let rightContent = '';

    if (layout === 'logo-left-menu-button-right') {
        rightContent = `<div class="header-nav-container">${navHtml}${buttonHtml}</div>`;
    } else if (layout === 'logo-left-menu-right') {
        rightContent = `<div class="header-nav-container">${navHtml}</div>`;
    } else if (layout === 'logo-left-button-right') {
        rightContent = `<div class="header-nav-container">${buttonHtml}</div>`;
    } else if (layout === 'logo-left-menu-center-button-right') {
        centerContent = `<div class="header-nav-container">${navHtml}</div>`;
        rightContent = `<div class="header-nav-container">${buttonHtml}</div>`;
    } else if (layout === 'logo-center-menu-below') {
        // Handled by CSS flex-direction
    }

    // Apply initial background
    let initialBackground = '';
    if (overlay) {
        initialBackground = 'background-color: transparent;';
    } else if (backgroundType === 'gradient' && gradientFrom && gradientTo) {
        initialBackground = `background: linear-gradient(to right, ${gradientFrom}, ${gradientTo});`;
    } else { // Defaults to solid
        initialBackground = `background-color: ${backgroundColor};`;
    }
    
    const inlineStyles = `
      ${initialBackground}
      ${borderRadius ? `border-radius: ${borderRadius};` : ''}
    `;

    return `
        <header class="page-header" data-layout="${layout}" ${stickyAttrs} ${overlayAttr} style="${inlineStyles}">
            ${leftContent}
            ${centerContent}
            ${rightContent}
            <button class="mobile-menu-toggle">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
        </header>
    `;
}

    