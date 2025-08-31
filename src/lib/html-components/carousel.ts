
import type { PageComponent } from '@/lib/types';

interface CarouselImage {
  id: string;
  url: string;
  alt: string;
}

export function renderCarousel(component: PageComponent): string {
    const { 
        images = [], 
        options = { loop: true, align: 'start' }, 
        showArrows = true,
        showDots = true,
        carouselType = 'default'
    } = component.props;
    
    if (!images || images.length === 0) {
        return '<!-- Carrossel sem imagens para exibir -->';
    }

    const carouselId = `carousel-${component.id}`;
    const autoplayOptions = options.autoplay ? { delay: options.autoplaySpeed || 4000, stopOnInteraction: false } : null;
    const emblaOptions = JSON.stringify({ ...options, autoplay: autoplayOptions });

    const slidesHtml = images.map((image: CarouselImage) => `
        <div class="carousel-slide">
            <img src="${image.url}" alt="${image.alt}">
        </div>
    `).join('');

    const arrowsHtml = showArrows ? `
        <button class="carousel-prev" aria-label="Anterior">&lt;</button>
        <button class="carousel-next" aria-label="Próximo">&gt;</button>
    ` : '';
    
    return `
        <div class="carousel-container ${carouselType === 'logo' ? 'logo-carousel' : ''}" id="${carouselId}" data-options='${emblaOptions}'>
            <div class="carousel-viewport">
                <div class="carousel-inner">
                    ${slidesHtml}
                </div>
            </div>
            ${arrowsHtml}
        </div>
    `;
}
