
import type { PageComponent } from '@/lib/types';

export function renderParagraph(component: PageComponent, isForPreview: boolean): string {
    const styles = component.props.styles || {};
    const styleString = getStyleString(styles);
    const editableAttrs = isForPreview ? `contenteditable="true" data-component-id="${component.id}" data-prop-name="text"` : '';
    const dataBinding = component.props.dataBinding;
    const text = dataBinding ? `%%=v(@${dataBinding})=%%` : (component.props.text || 'Este é um parágrafo. Edite o texto no painel de configurações.');
    
    return `<div style="white-space: pre-wrap; ${styleString}" ${editableAttrs}>${text}</div>`;
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
