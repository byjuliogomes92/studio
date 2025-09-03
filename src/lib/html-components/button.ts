
import type { PageComponent } from '@/lib/types';

export function renderButton(component: PageComponent): string {
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
    
    const styles = component.props.styles || {};
    const styleString = getStyleString(styles);
    const className = `custom-button custom-button--${variant}`;
    
    // O wrapper agora controla o alinhamento do bloco do botão
    return `<div class="button-wrapper" style="text-align: ${align}; ${styleString}"><a href="${href}" target="_blank" class="${className}">${text}</a></div>`;
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
