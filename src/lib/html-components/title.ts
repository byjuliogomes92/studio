
import type { PageComponent } from '@/lib/types';
import { CloudPage } from '../types';

export function renderTitle(component: PageComponent, isForPreview: boolean, hideAmpscript: boolean = false): string {
    const { props, pageState } = component as any; // Allow access to pageState if attached
    const styles = props.styles || {};
    const brand = pageState?.brand;

    let finalStyles: any = { ...styles };

    // Apply brand typography if available and not overridden
    if (brand?.typography) {
        const { customFontNameHeadings, fontFamilyHeadings } = brand.typography;
        if (!styles.fontFamily) { // Only apply if no specific font is set on the component
            finalStyles.fontFamily = `"${customFontNameHeadings || fontFamilyHeadings}", sans-serif`;
        }
    }
    
    const styleString = getStyleString(finalStyles);
    const editableAttrs = isForPreview ? `contenteditable="true" data-component-id="${component.id}" data-prop-name="text"` : '';
    const dataBinding = props.dataBinding;
    let text = props.text || 'Título Principal';
    
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
