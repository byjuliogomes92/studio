
import type { PageComponent, CloudPage, Action } from '@/lib/types';

function getWrapperStyleString(styles: any = {}): string {
    const forbiddenKeys = ['borderRadius', 'backgroundColor', 'color', 'background'];
    const wrapperStyles: { [key: string]: any } = {};

    // Only allow non-color related styles on the wrapper
    Object.entries(styles).forEach(([key, value]) => {
        if (!value || forbiddenKeys.some(fk => key.toLowerCase().includes(fk))) {
            return;
        }
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        wrapperStyles[cssKey] = value;
    });

    return Object.entries(wrapperStyles)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ');
}


function getButtonStyleString(styles: any = {}): string {
    const buttonStyles: { [key: string]: any } = {};

    const allowedKeys = ['borderRadius', 'backgroundColor', 'color', 'background'];
     Object.entries(styles).forEach(([key, value]) => {
        if (value && allowedKeys.some(ak => key.toLowerCase().includes(ak))) {
            const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
            buttonStyles[cssKey] = value;
        }
    });

    return Object.entries(buttonStyles)
      .map(([key, value]) => `${key}: ${value} !important;`)
      .join(' ');
}


export function renderButton(component: PageComponent, pageState?: CloudPage): string {
    const { text = 'Clique Aqui', align = 'center', variant = 'default', action } = component.props;
    
    let href = '#';
    if (action?.type === 'URL') {
        href = action.url || '#';
    } else if (action?.type === 'PAGE' && action.pageId) {
        href = `%%=CloudPagesURL(${action.pageId})=%%`;
    }

    const componentStyles = component.props.styles || {};
    
    // Default styles from brand if available
    const brandStyles = pageState?.brand?.components?.button;
    const brandButtonRadius = brandStyles?.borderRadius || '0.5rem';

    // Component-specific styles override brand styles
    const finalBorderRadius = componentStyles.borderRadius || brandButtonRadius;
    
    const wrapperStyleString = getWrapperStyleString(componentStyles);
    const buttonInlineStyleString = getButtonStyleString(componentStyles);

    const wrapperStyle = `text-align: ${align}; ${wrapperStyleString}`;
    
    // Add border-radius to the final button styles
    const finalButtonStyle = `border-radius: ${finalBorderRadius}; ${buttonInlineStyleString}`;
    
    const className = `custom-button custom-button--${variant}`;
    
    if (action?.type === 'CLOSE_POPUP') {
        return `<div class="button-wrapper" style="${wrapperStyle}"><button class="${className}" style="${finalButtonStyle}" onclick="window.closePopup && window.closePopup()">${text}</button></div>`;
    }

    return `<div class="button-wrapper" style="${wrapperStyle}"><a href="${href}" target="_blank" class="${className}" style="${finalButtonStyle}">${text}</a></div>`;
}
