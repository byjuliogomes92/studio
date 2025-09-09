
import type { PageComponent, CloudPage, Action } from '@/lib/types';

function getStyleString(styles: any = {}): string {
    const forbiddenKeys = ['textAlign']; // The wrapper div handles alignment.
    return Object.entries(styles)
      .map(([key, value]) => {
        if (value === undefined || value === null || value === '' || forbiddenKeys.includes(key)) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}


export function renderButton(component: PageComponent, pageState?: CloudPage): string {
    const { text = 'Clique Aqui', align = 'center', variant = 'default', action, idOverride } = component.props;
    const styles = component.props.styles || {};
    
    let href = '#';
    if (action?.type === 'URL') {
        href = action.url || '#';
    } else if (action?.type === 'PAGE' && action.pageId) {
        href = `%%=CloudPagesURL(${action.pageId})=%%`;
    } else if (action?.type === 'ANCHOR' && action.anchorId) {
        href = action.anchorId;
    }

    const brandStyles = (component as any).brand?.components?.button;

    // The wrapper div only controls horizontal alignment.
    const wrapperStyle = `text-align: ${align};`;
    
    // Apply brand styles first, then local component styles
    const combinedStyles = {
        borderRadius: brandStyles?.borderRadius,
        ...styles,
    };
    
    // The button itself gets all other styles.
    const buttonStyleString = getStyleString(combinedStyles);
    const className = `custom-button custom-button--${variant}`;
    
    const idAttr = idOverride ? `id="${idOverride}"` : '';

    let element: string;
    if (action?.type === 'CLOSE_POPUP') {
        element = `<button type="button" class="${className}" style="${buttonStyleString}" onclick="window.closePopup && window.closePopup()" ${idAttr}>${text}</button>`;
    } else {
        const target = href.startsWith('#') ? '' : 'target="_blank"';
        element = `<a href="${href}" ${target} class="${className}" style="${buttonStyleString}" ${idAttr}>${text}</a>`;
    }

    return `<div class="button-wrapper" style="${wrapperStyle}">${element}</div>`;
}
