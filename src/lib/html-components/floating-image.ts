
import type { PageComponent } from '@/lib/types';

export function renderFloatingImage(component: PageComponent): string {
    const { 
        imageUrl = 'https://placehold.co/150x150.png',
        width = '150px',
        top,
        left,
        right,
        bottom,
        zIndex = 10 
    } = component.props;

    const styleProps = {
        position: 'absolute',
        width,
        top,
        left,
        right,
        bottom,
        'z-index': zIndex,
        'max-width': '100%',
        height: 'auto',
    };

    const styleString = Object.entries(styleProps)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ');
      
    return `<img src="${imageUrl}" alt="Floating element" style="${styleString}" />`;
}
