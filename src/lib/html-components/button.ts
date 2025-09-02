
import type { PageComponent } from '@/lib/types';

export function renderButton(component: PageComponent): string {
    const { href = '#', text = 'Clique Aqui', align = 'center', variant = 'default' } = component.props;
    const styles = component.props.styles || {};
    const styleString = getStyleString(styles);
    const className = `custom-button custom-button--${variant}`;
    
    return `<div style="text-align: ${align}; ${styleString}"><a href="${href}" target="_blank" class="${className}">${text}</a></div>`;
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
