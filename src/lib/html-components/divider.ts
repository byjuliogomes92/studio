
import type { PageComponent } from '@/lib/types';

export function renderDivider(component: PageComponent): string {
    const styles = component.props.styles || {};
    const styleString = getStyleString(styles);
    return `<hr style="border-top: ${component.props.thickness || 1}px ${component.props.style || 'solid'} ${component.props.color || '#cccccc'}; margin: ${component.props.margin || 20}px 0; ${styleString}" />`;
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
