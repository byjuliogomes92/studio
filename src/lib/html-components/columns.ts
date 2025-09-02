
import type { PageComponent } from '@/lib/types';

export function renderColumns(component: PageComponent, childrenHtml: string): string {
    const styles = component.props.styles || {};
    // Separate custom styles from hero-specific props
    const { isHero, backgroundImageUrl, ...otherStyles } = styles;
    
    let styleString = getStyleString(otherStyles);
    
    if (backgroundImageUrl) {
        styleString += ` background-image: url('${backgroundImageUrl}');`;
    }

    return `<div class="columns-container" style="--column-count: ${component.props.columnCount || 2}; ${styleString}">${childrenHtml}</div>`;
}

function getStyleString(styles: any = {}): string {
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value || key === 'isHero') return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}
