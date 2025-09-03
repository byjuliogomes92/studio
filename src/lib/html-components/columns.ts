
import type { PageComponent } from '@/lib/types';

export function renderColumns(component: PageComponent, childrenHtml: string): string {
    const styles = component.props.styles || {};
    const { isFullWidth, backgroundType, backgroundImageUrl, backgroundColor, gradientFrom, gradientTo, ...otherStyles } = styles;
    
    let styleString = getStyleString(otherStyles);
    
    const className = `columns-container`;
    let backgroundStyle = '';

    switch(backgroundType) {
        case 'gradient':
            backgroundStyle = `background-image: linear-gradient(to right, ${gradientFrom || '#000000'}, ${gradientTo || '#434343'});`;
            break;
        case 'image':
             if (backgroundImageUrl) {
                backgroundStyle = `background-image: url('${backgroundImageUrl}'); background-size: cover; background-position: center;`;
            }
            break;
        case 'solid':
        default:
            backgroundStyle = `background-color: ${backgroundColor || 'transparent'};`;
            break;
    }
    
    const heroClass = backgroundType === 'image' && backgroundImageUrl ? 'hero-section' : '';

    // The outer wrapper for full-bleed backgrounds
    if (isFullWidth) {
        return `<div class="section-wrapper ${heroClass}" style="${backgroundStyle}">
                    <div class="${className}" style="--column-count: ${component.props.columnCount || 2}; ${styleString}">${childrenHtml}</div>
                </div>`;
    }

    // Default container with background styles applied directly if not full-width
    const combinedStyles = `${backgroundStyle} ${styleString}`;
    return `<div class="${className} ${heroClass}" style="--column-count: ${component.props.columnCount || 2}; ${combinedStyles}">${childrenHtml}</div>`;
}

function getStyleString(styles: any = {}): string {
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value || ['isFullWidth', 'backgroundType', 'backgroundImageUrl', 'backgroundColor', 'gradientFrom', 'gradientTo'].includes(key)) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}
