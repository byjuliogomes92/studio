
import type { PageComponent, HeaderLink } from '@/lib/types';

function getStyleString(styles: any = {}): string {
    const forbiddenKeys = ['maxWidth'];
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value || forbiddenKeys.includes(key)) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}


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
        backgroundColor = 'transparent', 
        backgroundColorOnScroll = '#ffffff',
        linkColor,
        linkHoverColor,
        mobileMenuBehavior = 'push',
        borderRadius,
        backgroundType = 'solid',
        gradientFrom,
        gradientTo,
        buttonProps = {},
        isFullWidth = false,
        styles = {}
    } = component.props;
    
    const menuItems = links.map((link: HeaderLink) => `<li><a href="${link.url}">${link.text}</a></li>`).join('');
    
    const showMenu = layout.includes('menu');
    const showButton = layout.includes('button');
    
    const { 
        bgColor: buttonBgColor = 'var(--theme-color)',
        textColor: buttonTextColor = '#FFFFFF',
        icon: buttonIcon,
        iconPosition = 'left'
    } = buttonProps;

    const lucideIconSvgs: Record<string, string> = {
        send: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
        'arrow-right': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
        'check-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
        'plus': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
        'download': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
        'star': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        'zap': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2z"/></svg>',
    };
    
    const iconHtml = buttonIcon && lucideIconSvgs[buttonIcon] ? lucideIconSvgs[buttonIcon] : '';

    const buttonHtml = showButton && buttonText && buttonUrl 
        ? `<a href="${buttonUrl}" class="header-button" style="background-color: ${buttonBgColor}; color: ${buttonTextColor};">
            ${iconPosition === 'left' ? iconHtml : ''}
            <span>${buttonText}</span>
            ${iconPosition === 'right' ? iconHtml : ''}
           </a>` 
        : '';
        
    const navHtml = showMenu ? `<nav class="header-nav"><ul>${menuItems}</ul></nav>` : '';

    const stickyAttrs = isSticky ? `
        data-sticky="true"
        data-bg-scroll="${backgroundColorOnScroll}"
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
    if (backgroundType === 'gradient') {
      initialBackground = `background: linear-gradient(to right, ${gradientFrom || 'transparent'}, ${gradientTo || 'transparent'});`;
    } else {
      initialBackground = `background-color: ${backgroundColor || 'transparent'};`;
    }
    
    const styleString = getStyleString(styles);

    const inlineStyles = `
      ${initialBackground}
      ${borderRadius ? `border-radius: ${borderRadius};` : ''}
      --custom-link-color: ${linkColor || '#333333'};
      --custom-link-hover-color: ${linkHoverColor || '#000000'};
      ${styleString}
    `;

    const innerContent = `
        ${leftContent}
        ${centerContent}
        ${rightContent}
        <button class="mobile-menu-toggle">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
    `;
    
    const containerClass = isFullWidth ? 'header-inner-full' : 'header-inner-contained';
    const containerStyle = !isFullWidth ? `max-width: ${styles.maxWidth || '1200px'};` : '';

    return `
        <header class="page-header" data-layout="${layout}" ${stickyAttrs} ${overlayAttr} style="${inlineStyles}">
            <div class="${containerClass}" style="${containerStyle}">
                ${innerContent}
            </div>
        </header>
    `;
}
