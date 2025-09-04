
import type { PageComponent } from '@/lib/types';

function hexToRgba(hex: string, alpha: number): string {
    if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
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
    const layout = props.layout || {};
    const idOverride = props.idOverride || `div-container-${component.id}`;
    const customClasses = props.customClasses || '';

    const {
        isFullWidth = false,
        backgroundType = 'solid',
        backgroundImageUrl,
        backgroundColor,
        gradientFrom,
        gradientTo,
        overlayEnabled,
        overlayColor,
        overlayOpacity,
        ...otherContainerStyles
    } = styles;

    const {
        verticalAlign,
        horizontalAlign,
        gap
    } = layout;

    let styleString = getStyleString(otherContainerStyles);

    let backgroundStyle = '';
    let heroClass = '';
    
    if (backgroundType === 'gradient') {
        backgroundStyle = `background-image: linear-gradient(to right, ${gradientFrom || '#000000'}, ${gradientTo || '#434343'});`;
    } else if (backgroundType === 'image' && backgroundImageUrl) {
        backgroundStyle = `background-image: url('${backgroundImageUrl}'); background-size: cover; background-position: center;`;
        heroClass = 'hero-section';
    } else { // Solid or default
        backgroundStyle = `background-color: ${backgroundColor || 'transparent'};`;
    }
    
    let overlayHtml = '';
    if (backgroundType === 'image' && overlayEnabled) {
        const rgbaColor = hexToRgba(overlayColor || '#000000', overlayOpacity || 0.5);
        overlayHtml = `<div class="section-overlay" style="background-color: ${rgbaColor};"></div>`;
    }

    const containerStyle = `
        display: flex;
        flex-direction: column;
        justify-content: ${verticalAlign || 'flex-start'};
        align-items: ${horizontalAlign || 'stretch'};
        gap: ${gap || '10px'};
        ${styleString}
    `;

    const className = `div-container ${heroClass} ${customClasses}`;
    
    const wrapperClass = isFullWidth ? 'section-wrapper' : 'section-container-padded';
    
    const wrapperStyle = isFullWidth ? backgroundStyle : '';
    const innerStyle = isFullWidth ? containerStyle : `${backgroundStyle} ${containerStyle}`;
    
    return `<div class="${wrapperClass}" style="${wrapperStyle}">
                ${overlayHtml}
                <div id="${idOverride}" class="${className}" style="${innerStyle}">${childrenHtml}</div>
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
