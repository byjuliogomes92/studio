
import type { PageComponent } from '@/lib/types';

export function renderMap(component: PageComponent): string {
    const { embedUrl } = component.props;
    const styleString = getStyleString(component.props.styles);
    if (!embedUrl) {
        return '<p>URL de incorporação do mapa não fornecida.</p>';
    }
    return `
        <div class="map-container" style="${styleString}">
            <iframe
                src="${embedUrl}"
                width="100%"
                height="450"
                style="border:0;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
            </iframe>
        </div>
    `;
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
