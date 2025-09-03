
import type { PageComponent } from '@/lib/types';

export function renderTitle(component: PageComponent, isForPreview: boolean, hideAmpscript: boolean = false): string {
    const styles = component.props.styles || {};
    const styleString = getStyleString(styles);
    const editableAttrs = isForPreview ? `contenteditable="true" data-component-id="${component.id}" data-prop-name="text"` : '';
    const dataBinding = component.props.dataBinding;
    let text = component.props.text || 'Título Principal';
    
    if (dataBinding && !hideAmpscript) {
        text = `%%=v(@${dataBinding})=%%`;
    }
    
    return `<h1 style="${styleString}" ${editableAttrs}>${text}</h1>`;
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

    
