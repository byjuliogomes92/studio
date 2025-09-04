
import type { PageComponent, CloudPage } from '@/lib/types';

export function renderButton(component: PageComponent, pageState?: CloudPage): string {
    const { text = 'Clique Aqui', align = 'center', variant = 'default', action } = component.props;
    
    let href = '#';
    if (action) {
      if (action.type === 'URL' && action.url) {
        href = action.url;
      } else if (action.type === 'PAGE' && action.pageId) {
        // In a real scenario, you'd resolve this to a proper URL.
        // For SFMC, we might link to the CloudPage by ID or a generated slug.
        href = `%%=CloudPagesURL(${action.pageId})=%%`;
      }
    }
    
    // Combine global brand styles with component-specific styles
    const brandButtonRadius = pageState?.brand?.components?.button?.borderRadius || '0.5rem';
    const componentStyles = component.props.styles || {};
    const finalBorderRadius = componentStyles.borderRadius || brandButtonRadius;

    // Remove borderRadius from componentStyles if it exists to avoid duplication
    const { borderRadius, ...otherStyles } = componentStyles;
    
    const styleString = getStyleString(otherStyles);
    const className = `custom-button custom-button--${variant}`;
    
    // O wrapper agora controla o alinhamento do bloco do botão
    const wrapperStyle = `text-align: ${align}; ${styleString}`;
    const buttonStyle = `border-radius: ${finalBorderRadius};`;

    return `<div class="button-wrapper" style="${wrapperStyle}"><a href="${href}" target="_blank" class="${className}" style="${buttonStyle}">${text}</a></div>`;
}

function getStyleString(styles: any = {}): string {
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        // Skip border-radius as it's handled separately
        if (cssKey === 'border-radius') return '';
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}
