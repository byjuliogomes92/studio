
import type { PageComponent } from '@/lib/types';

export function renderBanner(component: PageComponent): string {
    const styleString = getStyleString(component.props.styles);
    return `
    <div class="banner" style="${styleString}">
        <img src="${component.props.imageUrl || 'https://images.rede.natura.net/html/crm/campanha/20250819/44760-banner-topo.png'}" alt="Banner">
    </div>`;
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
