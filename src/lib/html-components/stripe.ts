
import type { PageComponent } from '@/lib/types';

export function renderStripe(component: PageComponent): string {
    const { text, isClosable, backgroundColor, textColor, linkUrl } = component.props;
    const stripeId = `stripe-${component.id}`;

    const closeButton = isClosable ? `<button id="close-${stripeId}" class="stripe-close-btn">&times;</button>` : '';
    const content = linkUrl ? `<a href="${linkUrl}" target="_blank" style="color: inherit; text-decoration: none;">${text}</a>` : text;

    return `
        <div id="${stripeId}" class="stripe-container" style="background-color: ${backgroundColor}; color: ${textColor};">
            <p>${content}</p>
            ${closeButton}
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
