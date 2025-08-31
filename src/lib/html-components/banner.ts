
import type { PageComponent } from '@/lib/types';

export function renderBanner(component: PageComponent): string {
    const { 
        mediaType = 'image',
        imageUrl = 'https://placehold.co/1200x400.png',
        mobileImageUrl,
        videoUrl,
        linkUrl,
        isFullWidth = false,
        padding = '0',
        styles = {}
    } = component.props;

    const customStyleString = getStyleString(styles);

    const bannerStyle = `
        padding: ${padding};
        ${isFullWidth ? 'width: 100vw; position: relative; left: 50%; transform: translateX(-50%);' : ''}
        ${customStyleString}
    `;

    let mediaHtml = '';
    if (mediaType === 'video' && videoUrl) {
        mediaHtml = `
            <video class="banner-video" autoplay loop muted playsinline>
                <source src="${videoUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
    } else {
        mediaHtml = `
            <picture>
                ${mobileImageUrl ? `<source media="(max-width: 768px)" srcset="${mobileImageUrl}">` : ''}
                <img src="${imageUrl}" alt="Banner" class="banner-image">
            </picture>
        `;
    }

    if (linkUrl) {
        return `
            <a href="${linkUrl}" class="banner-link-wrapper" style="${bannerStyle}">
                ${mediaHtml}
            </a>
        `;
    }

    return `<div class="banner-container" style="${bannerStyle}">${mediaHtml}</div>`;
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
