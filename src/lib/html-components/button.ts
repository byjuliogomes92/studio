
import type { PageComponent } from '@/lib/types';

export function renderButton(component: PageComponent): string {
    const styles = component.props.styles || {};
    const styleString = getStyleString(styles);
    return `<div style="text-align: ${component.props.align || 'center'}; ${styleString}"><a href="${component.props.href || '#'}" target="_blank" class="custom-button">${component.props.text || 'Clique Aqui'}</a></div>`;
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
