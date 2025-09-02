
import type { PageComponent } from '@/lib/types';

export function renderImage(component: PageComponent): string {
    const styles = component.props.styles || {};
    const styleString = getStyleString(styles);
    return `
        <div style="text-align: center; ${styleString}">
            <img src="${component.props.src || 'https://placehold.co/800x200.png'}" alt="${component.props.alt || 'Placeholder image'}" style="max-width: 100%; height: auto; border-radius: 8px;" data-ai-hint="website abstract">
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
