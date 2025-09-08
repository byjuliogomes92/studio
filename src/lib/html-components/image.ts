
import type { PageComponent } from '@/lib/types';

export function renderImage(component: PageComponent): string {
    const { src = 'https://placehold.co/800x200.png', alt = 'Placeholder image', width, idOverride } = component.props;
    const styles = component.props.styles || {};
    const textAlign = styles.textAlign || 'left';
    
    // Combine base styles with the dynamic width property
    const imageStyles: { [key: string]: string } = {
        'max-width': '100%',
        'height': 'auto',
        'border-radius': '8px',
        'display': 'block', 
    };

    if (width) {
        imageStyles.width = width;
    }
    
    // Handle horizontal alignment
    if (textAlign === 'center') {
        imageStyles['margin-left'] = 'auto';
        imageStyles['margin-right'] = 'auto';
    } else if (textAlign === 'right') {
        imageStyles['margin-left'] = 'auto';
        imageStyles['margin-right'] = '0';
    } else {
        imageStyles['margin-left'] = '0';
        imageStyles['margin-right'] = 'auto';
    }


    const imageStyleString = Object.entries(imageStyles)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ');
      
    // Apply additional styles from the settings panel directly to the image
    const customStyleString = getStyleString(styles);

    const idAttr = idOverride ? `id="${idOverride}"` : '';

    return `<img src="${src}" alt="${alt}" style="${imageStyleString}${customStyleString}" data-ai-hint="website abstract" ${idAttr}>`;
}

function getStyleString(styles: any = {}): string {
    const forbiddenKeys = ['textAlign']; // Don't apply textAlign directly to the img tag
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value || forbiddenKeys.includes(key)) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}
