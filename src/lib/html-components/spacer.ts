
import type { PageComponent } from '@/lib/types';

export function renderSpacer(component: PageComponent): string {
    const styles = component.props.styles || {};
    const styleString = getStyleString(styles);
    return `<div style="height: ${component.props.height || 20}px; ${styleString}"></div>`;
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
