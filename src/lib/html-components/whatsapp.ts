
import type { PageComponent } from '@/lib/types';

export function renderWhatsApp(component: PageComponent): string {
    const { phoneNumber, defaultMessage, position = 'bottom-right' } = component.props;
    const encodedMessage = encodeURIComponent(defaultMessage);
    const href = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    return `
        <a href="${href}" target="_blank" class="whatsapp-float-btn ${position}" aria-label="Fale conosco no WhatsApp">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </a>`;
}
