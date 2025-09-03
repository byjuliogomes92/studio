
import type { PageComponent } from '@/lib/types';

export function renderImage(component: PageComponent): string {
    const { src = 'https://placehold.co/800x200.png', alt = 'Placeholder image', width } = component.props;
    const styles = component.props.styles || {};
    
    // Combine base styles with the dynamic width property
    const imageStyles: { [key: string]: string } = {
        'max-width': '100%',
        'height': 'auto',
        'border-radius': '8px',
        'display': 'block', // Keep as block to respect container's alignment logic
    };

    if (width) {
        imageStyles.width = width;
    }

    const imageStyleString = Object.entries(imageStyles)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ');
      
    // Apply additional styles from the settings panel directly to the image
    const customStyleString = getStyleString(styles);

    return `<img src="${src}" alt="${alt}" style="${imageStyleString}${customStyleString}" data-ai-hint="website abstract">`;
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
