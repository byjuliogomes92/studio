
import type { PageComponent } from '@/lib/types';

export function renderSubtitle(component: PageComponent, isForPreview: boolean, hideAmpscript: boolean = false): string {
    const styles = component.props.styles || {};
    const styleString = getStyleString(styles);
    const editableAttrs = isForPreview ? `contenteditable="true" data-component-id="${component.id}" data-prop-name="text"` : '';
    const dataBinding = component.props.dataBinding;
    let text = component.props.text || 'Subtítulo';

    if (dataBinding && !hideAmpscript) {
        text = `%%=v(@${dataBinding})=%%`;
    }
    
    return `<h2 style="${styleString}" ${editableAttrs}>${text}</h2>`;
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

    