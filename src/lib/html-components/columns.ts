
import type { PageComponent } from '@/lib/types';

export function renderColumns(component: PageComponent, childrenHtml: string): string {
    const styles = component.props.styles || {};
    // Separate custom styles from hero-specific props
    const { isHero, backgroundImageUrl, backgroundColor, gradientFrom, gradientTo, backgroundType, ...otherStyles } = styles;
    
    let styleString = getStyleString(otherStyles);
    
    if (isHero) {
        switch(backgroundType) {
            case 'gradient':
                styleString += ` background-image: linear-gradient(to right, ${gradientFrom || '#000000'}, ${gradientTo || '#434343'});`;
                break;
            case 'image':
                 if (backgroundImageUrl) {
                    styleString += ` background-image: url('${backgroundImageUrl}');`;
                }
                break;
            case 'solid':
            default:
                styleString += ` background-color: ${backgroundColor || 'transparent'};`;
                break;
        }
    }

    const className = `columns-container ${isHero ? 'hero-section' : ''}`;

    return `<div class="${className}" style="--column-count: ${component.props.columnCount || 2}; ${styleString}">${childrenHtml}</div>`;
}

function getStyleString(styles: any = {}): string {
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value || ['isHero', 'isFullWidth', 'backgroundType', 'backgroundImageUrl', 'backgroundColor', 'gradientFrom', 'gradientTo'].includes(key)) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}
