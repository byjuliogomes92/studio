
import type { PageComponent, CloudPage, Action } from '@/lib/types';

function getStyleString(styles: any = {}): string {
    // This function now handles all styles for the button itself.
    // The wrapper div will only handle alignment.
    return Object.entries(styles)
      .map(([key, value]) => {
        if (value === undefined || value === null || value === '') return '';
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
    const finalButtonStyles = {
        borderRadius: brandStyles?.borderRadius,
        ...styles,
    };
    const buttonStyleString = getStyleString(finalButtonStyles);
    
    // The wrapper div only controls horizontal alignment using text-align.
    const wrapperStyle = `text-align: ${align};`;
    
    const className = `custom-button custom-button--${variant}`;
    
    let element: string;
    if (action?.type === 'CLOSE_POPUP') {
        // Use a <button> for actions that don't navigate
        element = `<button type="button" class="${className}" style="${buttonStyleString}" onclick="window.closePopup && window.closePopup()">${text}</button>`;
    } else {
        // Use an <a> tag for links
        element = `<a href="${href}" target="_blank" class="${className}" style="${buttonStyleString}">${text}</a>`;
    }

    // The wrapper div's only job is alignment. The button itself has all other styles.
    return `<div class="button-wrapper" style="${wrapperStyle}">${element}</div>`;
}
