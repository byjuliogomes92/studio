

import type { PageComponent, HeaderLink } from '@/lib/types';

const socialSvgs: Record<string, string> = {
    facebook: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    instagram: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>',
    twitter: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.9 3.3 4.9-6.1 1.2-18 5-18 5s-2.7-7.1 2.5-11.2c-1.4 1.3-2.8 2.5-2.8 2.5s-2.8-7.4 9.1-3.8c.9 2.1 3.3 2.6 3.3 2.6Z"/></svg>',
    linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>',
    youtube: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-youtube"><path d="M2.5 17a24.12 24.12 0 0 1 0-10C2.5 4.24 4.24 2.5 7 2.5h10c2.76 0 4.5 1.74 4.5 4.5v10c0 2.76-1.74 4.5-4.5 4.5H7c-2.76 0-4.5-1.74-4.5-4.5Z"/><path d="m10 15 5-3-5-3z"/></svg>',
};

function renderLinkList(links: HeaderLink[] = []): string {
    if (!links || links.length === 0) return '';
    const itemsHtml = links.map(link => `<li><a href="${link.url}" class="footer-link">${link.text}</a></li>`).join('');
    return `<ul class="footer-link-list">${itemsHtml}</ul>`;
}

function renderSocialIcons(links: Record<string, string> = {}): string {
    const iconsHtml = Object.keys(links)
        .filter(key => links[key] && socialSvgs[key])
        .map(key => `
            <a href="${links[key]}" target="_blank" class="footer-social-icon" aria-label="${key}">
                ${socialSvgs[key]}
            </a>
        `).join('');
    return `<div class="footer-social-icons">${iconsHtml}</div>`;
}

export function renderFooter(component: PageComponent): string {
    const { props } = component;
    const {
        layout = 'default',
        linksLeft,
        linksRight,
        socialLinks,
        footerText1 = `© ${new Date().getFullYear()} Morfeus. Todos os direitos reservados.`,
        styles = {}
    } = props;
    
    const styleString = getStyleString(styles);

    let contentHtml = '';
    
    const logoHtml = `
      <div class="footer-logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
        </svg>
        <span>Morfeus</span>
      </div>`;

    if (layout === 'menus-and-social') {
        contentHtml = `
            <div class="footer-col footer-col-main">
                ${logoHtml}
                <p class="footer-copyright">${footerText1}</p>
            </div>
            <div class="footer-col">${renderLinkList(linksLeft)}</div>
            <div class="footer-col">${renderLinkList(linksRight)}</div>
            <div class="footer-col">${renderSocialIcons(socialLinks)}</div>
        `;
    } else {
        // Default layout
        contentHtml = `
            <div class="footer-col footer-col-center">
                ${logoHtml}
                <p class="footer-copyright">${footerText1}</p>
            </div>
        `;
    }

    return `
    <footer class="page-footer" style="${styleString}" data-layout="${layout}">
      <div class="footer-container">
        ${contentHtml}
      </div>
    </footer>`;
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
