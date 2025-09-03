
import type { PageComponent } from '@/lib/types';

function hexToRgba(hex: string, alpha: number): string {
    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        return `rgba(0,0,0,${alpha})`; // fallback
    }
    let c = hex.substring(1).split('');
    if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    const i = parseInt(c.join(''), 16);
    const r = (i >> 16) & 255;
    const g = (i >> 8) & 255;
    const b = i & 255;
    return `rgba(${r},${g},${b},${alpha})`;
}

export function renderColumns(component: PageComponent, childrenHtml: string): string {
    const { props } = component;
    const styles = props.styles || {};
    const { 
        isFullWidth, 
        backgroundType, 
        backgroundImageUrl, 
        backgroundColor, 
        gradientFrom, 
        gradientTo, 
        overlayEnabled,
        overlayColor,
        overlayOpacity,
        ...otherStyles 
    } = styles;
    
    let styleString = getStyleString(otherStyles);
    
    let backgroundStyle = '';
    let heroClass = '';

    switch(backgroundType) {
        case 'gradient':
            backgroundStyle = `background-image: linear-gradient(to right, ${gradientFrom || '#000000'}, ${gradientTo || '#434343'});`;
            break;
        case 'image':
             if (backgroundImageUrl) {
                backgroundStyle = `background-image: url('${backgroundImageUrl}'); background-size: cover; background-position: center;`;
                heroClass = 'hero-section';
            }
            break;
        case 'solid':
        default:
            backgroundStyle = `background-color: ${backgroundColor || 'transparent'};`;
            break;
    }
    
    let overlayStyle = '';
    if (backgroundType === 'image' && overlayEnabled) {
        const rgbaColor = hexToRgba(overlayColor || '#000000', overlayOpacity || 0.5);
        overlayStyle = `
            content: '';
            position: absolute;
            top: 0; right: 0; bottom: 0; left: 0;
            background-color: ${rgbaColor};
            z-index: 0;
        `;
    }

    const className = `columns-container ${heroClass}`;

    // Handle column widths
    const columnCount = props.columnCount || 2;
    const columnWidths = props.columnWidths || [];
    const validWidths = Array.isArray(columnWidths) && columnWidths.length === columnCount && columnWidths.every(w => w !== null && w > 0);
    const totalWidth = validWidths ? columnWidths.reduce((a, b) => a + b, 0) : 0;
    
    let gridTemplateColumns;
    if (validWidths && totalWidth === 100) {
        gridTemplateColumns = columnWidths.map((w: number) => `${w}%`).join(' ');
    } else {
        gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
    }

    const finalContainerStyle = `
        --column-count: ${columnCount};
        grid-template-columns: ${gridTemplateColumns};
        ${styleString}
    `;

    if (isFullWidth) {
        return `<div class="section-wrapper" style="${backgroundStyle}">
                    <div class="section-overlay" style="${overlayStyle}"></div>
                    <div class="${className}" style="${finalContainerStyle}">${childrenHtml}</div>
                </div>`;
    }

    return `<div class="${className}" style="${backgroundStyle} ${finalContainerStyle}">
                <div class="section-overlay" style="${overlayStyle}"></div>
                ${childrenHtml}
            </div>`;
}

function getStyleString(styles: any = {}): string {
    const forbiddenKeys = [
        'isFullWidth', 'backgroundType', 'backgroundImageUrl', 
        'backgroundColor', 'gradientFrom', 'gradientTo', 
        'overlayEnabled', 'overlayColor', 'overlayOpacity'
    ];
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value || forbiddenKeys.includes(key)) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}
