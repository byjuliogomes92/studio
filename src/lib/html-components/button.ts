
import type { PageComponent, CloudPage, Action } from '@/lib/types';

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
    const finalBgColor = componentStyles.backgroundColor; // Can be undefined
    const finalTextColor = componentStyles.color; // Can be undefined

    // Remove props that are handled separately to avoid duplication
    const { borderRadius, backgroundColor, color, ...otherStyles } = componentStyles;
    
    const styleString = getStyleString(otherStyles);
    
    let buttonStyle = `border-radius: ${finalBorderRadius};`;
    if(finalBgColor) {
        buttonStyle += ` background-color: ${finalBgColor} !important;`;
    }
    if(finalTextColor) {
        buttonStyle += ` color: ${finalTextColor} !important;`;
    }

    const className = `custom-button custom-button--${variant}`;
    
    // O wrapper agora controla o alinhamento do bloco do botão
    const wrapperStyle = `text-align: ${align}; ${styleString}`;

    if (action?.type === 'CLOSE_POPUP') {
        return `<div class="button-wrapper" style="${wrapperStyle}"><button class="${className}" style="${buttonStyle}" onclick="window.closePopup && window.closePopup()">${text}</button></div>`;
    }

    return `<div class="button-wrapper" style="${wrapperStyle}"><a href="${href}" target="_blank" class="${className}" style="${buttonStyle}">${text}</a></div>`;
}

function getStyleString(styles: any = {}): string {
    const forbiddenKeys = ['borderRadius', 'backgroundColor', 'color'];
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value || forbiddenKeys.includes(key)) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}

    