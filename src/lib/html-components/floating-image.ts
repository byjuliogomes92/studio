
import type { PageComponent } from '@/lib/types';

export function renderFloatingImage(component: PageComponent): string {
    const { 
        imageUrl = 'https://placehold.co/150x150.png',
        width = '150px',
        position = 'top-left',
        offsetX = '20px',
        offsetY = '20px',
        zIndex = 10 
    } = component.props;

    const styleProps: Record<string, string | number> = {
        position: 'absolute',
        width,
        'z-index': zIndex,
        'max-width': '100%',
        height: 'auto',
    };
    
    // Reset all positions
    styleProps.top = 'auto';
    styleProps.left = 'auto';
    styleProps.right = 'auto';
    styleProps.bottom = 'auto';
    styleProps.transform = 'none';

    // Apply new position logic
    switch (position) {
        case 'top-left':
            styleProps.top = offsetY;
            styleProps.left = offsetX;
            break;
        case 'top-center':
            styleProps.top = offsetY;
            styleProps.left = '50%';
            styleProps.transform = 'translateX(-50%)';
            break;
        case 'top-right':
            styleProps.top = offsetY;
            styleProps.right = offsetX;
            break;
        case 'center-left':
            styleProps.top = '50%';
            styleProps.left = offsetX;
            styleProps.transform = 'translateY(-50%)';
            break;
        case 'center':
            styleProps.top = '50%';
            styleProps.left = '50%';
            styleProps.transform = 'translate(-50%, -50%)';
            break;
        case 'center-right':
            styleProps.top = '50%';
            styleProps.right = offsetX;
            styleProps.transform = 'translateY(-50%)';
            break;
        case 'bottom-left':
            styleProps.bottom = offsetY;
            styleProps.left = offsetX;
            break;
        case 'bottom-center':
            styleProps.bottom = offsetY;
            styleProps.left = '50%';
            styleProps.transform = 'translateX(-50%)';
            break;
        case 'bottom-right':
            styleProps.bottom = offsetY;
            styleProps.right = offsetX;
            break;
    }


    const styleString = Object.entries(styleProps)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ');
      
    return `<img src="${imageUrl}" alt="Floating element" style="${styleString}" />`;
}
