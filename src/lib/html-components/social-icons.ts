
import type { PageComponent } from '@/lib/types';

export function renderSocialIcons(component: PageComponent): string {
    const { links = {}, styles: iconStyles = {} } = component.props;
    const { align = 'center', iconSize = '24px' } = iconStyles;
    const styleString = getStyleString(component.props.styles);
    
    const socialSvgs: Record<string, string> = {
        facebook: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
        instagram: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>',
        twitter: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.9 3.3 4.9-6.1 1.2-18 5-18 5s-2.7-7.1 2.5-11.2c-1.4 1.3-2.8 2.5-2.8 2.5s-2.8-7.4 9.1-3.8c.9 2.1 3.3 2.6 3.3 2.6Z"/></svg>',
        linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>',
        youtube: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-youtube"><path d="M2.5 17a24.12 24.12 0 0 1 0-10C2.5 4.24 4.24 2.5 7 2.5h10c2.76 0 4.5 1.74 4.5 4.5v10c0 2.76-1.74 4.5-4.5 4.5H7c-2.76 0-4.5-1.74-4.5-4.5Z"/><path d="m10 15 5-3-5-3z"/></svg>',
        tiktok: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tiktok"><path d="M12 12a4 4 0 1 0 4 4V4a5 5 0 1 0-5 5h4"/></svg>',
        pinterest: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pinterest"><path d="M12 12c-2.25 0-4.43.9-6.13 2.45-.5.4-.44 1.25.08 1.65l2.29 1.78c.45.35 1.1.2 1.45-.25.5-.63.85-1.4 1.03-2.2.14-.64.04-1.34-.3-1.96-.3-.54.21-1.2.78-1.22.63-.03 1.2.3 1.28.98.08.7-.3 1.4-.7 1.9-.44.55-.22 1.34.3 1.6l2.32 1.83c.53.41 1.28.2 1.68-.25 2.4-2.7 3.1-6.4 2.2-9.6-1-3.5-3.8-6.1-7.2-6.5-4.5-.4-8.4 2.1-9.4 6.2-.9 3.5.7 7.5 4.1 9.4 1.4.7 2.9 1 4.4 1.1"/></svg>',
        snapchat: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-snapchat"><path d="M15 17a8 8 0 1 0-8.5-8H12v10Z"/><path d="M12 12c-2-2-2-4-2-4-2 0-2 2-2 4s2 4 4 4 2-2 2-4-2-4-2-4Z"/></svg>',
    };

    const iconsHtml = Object.keys(links)
        .filter(key => links[key])
        .map(key => `
            <a href="${links[key]}" target="_blank" class="social-icon" aria-label="${key}">
                ${socialSvgs[key as keyof typeof socialSvgs] || ''}
            </a>
        `).join('');

    return `<div class="social-icons-container" style="text-align: ${align}; ${styleString}" data-icon-size="${iconSize}">${iconsHtml}</div>`;
}

function getStyleString(styles: any = {}): string {
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}
