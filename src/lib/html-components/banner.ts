
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
        height,
        mobileHeight,
        styles = {}
    } = component.props;

    const customStyleString = getStyleString(styles);

    let bannerStyle: string;
    if (isFullWidth) {
        bannerStyle = `
            display: block;
            position: relative;
            overflow: hidden;
            padding: ${padding};
            ${height ? `height: ${height};` : ''}
            width: 100vw;
            left: 50%;
            transform: translateX(-50%);
            ${customStyleString}
        `;
    } else {
         bannerStyle = `
            display: block;
            position: relative;
            overflow: hidden;
            padding: ${padding};
            ${height ? `height: ${height};` : ''}
            width: 100%;
            max-width: 1200px; /* Garante que não fique excessivamente largo */
            margin: 0 auto; /* Centraliza o banner */
            ${customStyleString}
        `;
    }


    let mediaHtml = '';
    if (mediaType === 'video' && videoUrl) {
        mediaHtml = `
            <video class="banner-media" autoplay loop muted playsinline>
                <source src="${videoUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
    } else {
        mediaHtml = `
            <picture>
                ${mobileImageUrl ? `<source media="(max-width: 768px)" srcset="${mobileImageUrl}">` : ''}
                <img src="${imageUrl}" alt="Banner" class="banner-media">
            </picture>
        `;
    }
    
    const responsiveHeightStyle = `
        <style>
            @media (max-width: 768px) {
                #banner-${component.id} {
                    ${mobileHeight ? `height: ${mobileHeight} !important;` : ''}
                }
            }
        </style>
    `;

    if (linkUrl) {
        return `
            <a href="${linkUrl}" id="banner-${component.id}" class="banner-container" style="${bannerStyle}">
                ${mediaHtml}
            </a>
            ${responsiveHeightStyle}
        `;
    }

    return `
        <div id="banner-${component.id}" class="banner-container" style="${bannerStyle}">
            ${mediaHtml}
        </div>
        ${responsiveHeightStyle}
    `;
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
