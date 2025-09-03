
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

export function renderDiv(component: PageComponent, childrenHtml: string): string {
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
    
    let overlayHtml = '';
    if (backgroundType === 'image' && overlayEnabled) {
        const rgbaColor = hexToRgba(overlayColor || '#000000', overlayOpacity || 0.5);
        overlayHtml = `<div class="section-overlay" style="background-color: ${rgbaColor};"></div>`;
    }

    const className = `div-container ${heroClass}`;
    
    const finalContainerStyle = `
        position: relative;
        ${backgroundStyle}
        ${styleString}
    `;

    if (isFullWidth) {
        return `<div class="section-wrapper" style="${finalContainerStyle}">
                    ${overlayHtml}
                    <div class="${className}">${childrenHtml}</div>
                </div>`;
    }

    return `<div class="${className}" style="${finalContainerStyle}">
                ${overlayHtml}
                ${childrenHtml}
            </div>`;
}

function getStyleString(styles: any = {}): string {
    const forbiddenKeys = [
        'isFullWidth', 'backgroundType', 'backgroundImageUrl', 
        'backgroundColor', 'gradientFrom', 'gradientTo', 
        'overlayEnabled', 'overlayColor', 'overlayOpacity',
    ];
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value || forbiddenKeys.includes(key)) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}
