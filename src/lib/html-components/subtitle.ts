
import type { PageComponent } from '@/lib/types';

export function renderSubtitle(component: PageComponent, isForPreview: boolean, hideAmpscript: boolean = false): string {
    const { props, pageState } = component as any; // Allow access to pageState if attached
    const styles = props.styles || {};
    const brand = pageState?.brand;
    const idOverride = props.idOverride;

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
    let text = props.text || 'Subtítulo';

    if (dataBinding && !hideAmpscript) {
        text = `%%=v(@${dataBinding})=%%`;
    }
    
    const idAttr = idOverride ? `id="${idOverride}"` : '';
    
    return `<h2 style="${styleString}" ${editableAttrs} ${idAttr}>${text}</h2>`;
}

function getStyleString(styles: any = {}): string {
    const forbiddenKeys = ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'];
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}
