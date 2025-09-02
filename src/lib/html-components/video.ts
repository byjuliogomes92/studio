
import type { PageComponent } from '@/lib/types';

export function renderVideo(component: PageComponent): string {
    const videoUrl = component.props.url || '';
    const styleString = getStyleString(component.props.styles);
    let embedUrl = '';
    if (videoUrl.includes('youtube.com/watch?v=')) {
        const videoId = videoUrl.split('v=')[1].split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    return embedUrl ? `<div class="video-container" style="${styleString}"><iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>` : '<p>URL do vídeo inválida.</p>';
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
