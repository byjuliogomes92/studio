
import type { PageComponent } from '@/lib/types';
import { CloudPage } from '../types';

export function renderParagraph(component: PageComponent, isForPreview: boolean, hideAmpscript: boolean = false): string {
    const { props, pageState } = component as any; // Allow access to pageState if attached
    const styles = props.styles || {};
    const brand = pageState?.brand;

    let finalStyles: any = { ...styles };

    // Apply brand typography if available and not overridden
    if (brand?.typography) {
        const { customFontNameBody, fontFamilyBody } = brand.typography;
        if (!styles.fontFamily) { // Only apply if no specific font is set on the component
            finalStyles.fontFamily = customFontNameBody || fontFamilyBody;
        }
    }
    
    const styleString = getStyleString(finalStyles);
    const editableAttrs = isForPreview ? `contenteditable="true" data-component-id="${component.id}" data-prop-name="text"` : '';
    const dataBinding = props.dataBinding;
    let text = props.text || 'Este é um parágrafo. Edite o texto no painel de configurações.';

    if (dataBinding && !hideAmpscript) {
        text = `%%=v(@${dataBinding})=%%`;
    }
    
    // The wrapping div is now only for spacing, the inner p tag gets the styles and contenteditable
    const wrapperStyle = getSpacingStyle(styles);

    return `<div style="white-space: pre-wrap; ${styleString}" ${editableAttrs}>${text}</div>`;
}

function getStyleString(styles: any = {}): string {
    const forbiddenKeys = ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'];
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value || forbiddenKeys.includes(key)) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}

function getSpacingStyle(styles: any = {}): string {
    const spacingKeys = ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'];
    return spacingKeys.map(key => {
        if(styles[key]) {
            const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
            return `${cssKey}: ${styles[key]};`;
        }
        return '';
    }).join(' ');
}
