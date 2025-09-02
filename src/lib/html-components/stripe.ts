
import type { PageComponent } from '@/lib/types';

export function renderStripe(component: PageComponent): string {
    const { 
        text, 
        isClosable, 
        backgroundColor, 
        textColor, 
        linkUrl,
        backgroundType = 'solid',
        gradientFrom,
        gradientTo,
        backgroundImageUrl,
        icon,
        buttonEnabled,
        buttonText,
        buttonUrl
    } = component.props;
    const stripeId = `stripe-${component.id}`;

    const iconSvgs: Record<string, string> = {
        megaphone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>',
        star: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        zap: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2z"/></svg>',
    };
    
    let backgroundStyle = `background-color: ${backgroundColor || '#000000'};`;
    if (backgroundType === 'gradient') {
        backgroundStyle = `background: linear-gradient(to right, ${gradientFrom || '#000000'}, ${gradientTo || '#434343'});`;
    } else if (backgroundType === 'image' && backgroundImageUrl) {
        backgroundStyle = `background-image: url('${backgroundImageUrl}'); background-size: cover; background-position: center;`;
    }

    const iconHtml = icon && icon !== 'none' ? `<div class="stripe-icon">${iconSvgs[icon]}</div>` : '';
    const closeButton = isClosable ? `<button id="close-${stripeId}" class="stripe-close-btn">&times;</button>` : '';
    const mainContent = linkUrl ? `<a href="${linkUrl}" target="_blank" style="color: inherit; text-decoration: none;">${text}</a>` : text;
    const buttonHtml = buttonEnabled && buttonText && buttonUrl ? `<a href="${buttonUrl}" class="stripe-button">${buttonText}</a>` : '';

    return `
        <div id="${stripeId}" class="stripe-container" style="${backgroundStyle} color: ${textColor || '#FFFFFF'};">
            <div class="stripe-content">
                ${iconHtml}
                <p>${mainContent}</p>
            </div>
            <div class="stripe-actions">
                ${buttonHtml}
                ${closeButton}
            </div>
        </div>
        <script>
            (function() {
                const stripe = document.getElementById('${stripeId}');
                if (!stripe) return;
                const closeBtn = document.getElementById('close-${stripeId}');
                const storageKey = 'stripe_closed_${stripeId}';

                if (localStorage.getItem(storageKey) === 'true') {
                    stripe.style.display = 'none';
                } else {
                    stripe.style.display = 'flex';
                }

                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        stripe.style.display = 'none';
                        localStorage.setItem(storageKey, 'true');
                    });
                }
            })();
        </script>
    `;
}
