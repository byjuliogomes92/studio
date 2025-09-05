
import type { PageComponent, CloudPage, Action } from '@/lib/types';

function getStyleString(styles: any = {}): string {
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value && value !== 0) return '';
        // Convert camelCase to kebab-case
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}


export function renderButton(component: PageComponent, pageState?: CloudPage): string {
    const { text = 'Clique Aqui', align = 'center', variant = 'default', action } = component.props;
    const styles = component.props.styles || {};
    
    let href = '#';
    if (action?.type === 'URL') {
        href = action.url || '#';
    } else if (action?.type === 'PAGE' && action.pageId) {
        href = `%%=CloudPagesURL(${action.pageId})=%%`;
    }

    const brandStyles = pageState?.brand?.components?.button;

    // Build the final styles for the button itself
    const buttonStyles = {
        // Start with brand defaults
        borderRadius: brandStyles?.borderRadius,
        // Override with component-specific styles
        ...styles,
    };
    const buttonStyleString = getStyleString(buttonStyles);
    
    // The wrapper div only controls alignment
    const wrapperStyle = `text-align: ${align};`;
    
    const className = `custom-button custom-button--${variant}`;
    
    // Handle the button element type
    let element: string;
    if (action?.type === 'CLOSE_POPUP') {
        element = `<button class="${className}" style="${buttonStyleString}" onclick="window.closePopup && window.closePopup()">${text}</button>`;
    } else {
        element = `<a href="${href}" target="_blank" class="${className}" style="${buttonStyleString}">${text}</a>`;
    }

    return `<div class="button-wrapper" style="${wrapperStyle}">${element}</div>`;
}

