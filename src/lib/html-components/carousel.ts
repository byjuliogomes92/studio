
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
    
    // Explicitly check for autoplay in options to create the correct JSON
    const emblaOptions = {
        ...options,
        autoplay: options.autoplay ? { delay: options.autoplay.delay || 4000, stopOnInteraction: false } : null,
    };

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
        <div class="carousel-container ${carouselType === 'logo' ? 'logo-carousel' : ''}" id="${carouselId}" data-options='${JSON.stringify(emblaOptions)}'>
            <div class="carousel-viewport">
                <div class="carousel-inner">
                    ${slidesHtml}
                    ${carouselType === 'logo' ? slidesHtml : ''}
                </div>
            </div>
            ${arrowsHtml}
        </div>
    `;
}
