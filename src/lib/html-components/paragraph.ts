
import type { PageComponent } from '@/lib/types';
import { CloudPage } from '../types';

export function renderParagraph(component: PageComponent, isForPreview: boolean, hideAmpscript: boolean = false): string {
    const { props, pageState } = component as any; // Allow access to pageState if attached
    const styles = props.styles || {};
    const brand = pageState?.brand;
    const idOverride = props.idOverride;

    let finalStyles: any = { ...styles };

    // Apply brand typography if available and not overridden
    if (brand?.typography) {
        const { customFontNameBody, fontFamilyBody } = brand.typography;
        if (!styles.fontFamily) { // Only apply if no specific font is set on the component
            finalStyles.fontFamily = `"${customFontNameBody || fontFamilyBody}", sans-serif`;
        }
    }
    
    // Do not apply alignment directly to the p tag, it's handled by the wrapper.
    const styleString = getStyleString(finalStyles);
    const editableAttrs = isForPreview ? `contenteditable="true" data-component-id="${component.id}" data-prop-name="text"` : '';
    const dataBinding = props.dataBinding;
    let text = props.text || 'Este é um parágrafo. Edite o texto no painel de configurações.';

    if (dataBinding && !hideAmpscript) {
        text = `%%=v(@${dataBinding})=%%`;
    }
    
    const idAttr = idOverride ? `id="${idOverride}"` : '';

    return `<p style="white-space: pre-wrap; ${styleString}" ${editableAttrs} ${idAttr}>${text}</p>`;
}

function getStyleString(styles: any = {}): string {
    // Remove text-align as it's handled by the wrapper div
    const forbiddenKeys = ['marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'textAlign'];
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value || forbiddenKeys.includes(key)) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}
