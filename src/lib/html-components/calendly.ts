
import type { PageComponent, CalendlyEmbedType } from '@/lib/types';

export function renderCalendly(component: PageComponent): string {
    const { 
        embedType = 'inline' as CalendlyEmbedType,
        calendlyUrl = '',
        height = '700px',
        buttonText = 'Agende um Horário',
        prefill = {},
        utm = {}
    } = component.props;

    if (!calendlyUrl) {
        return '<!-- URL do Calendly não configurada -->';
    }

    const dataUrl = new URL(calendlyUrl);
    
    // Prefill parameters
    if (prefill.name) dataUrl.searchParams.set('name', `%%=v(@${prefill.name})=%%`);
    if (prefill.email) dataUrl.searchParams.set('email', `%%=v(@${prefill.email})=%%`);
    if (prefill.custom1) dataUrl.searchParams.set('a1', `%%=v(@${prefill.custom1})=%%`);
    if (prefill.custom2) dataUrl.searchParams.set('a2', `%%=v(@${prefill.custom2})=%%`);
    
    // UTM parameters
    if (utm.utm_campaign) dataUrl.searchParams.set('utm_campaign', utm.utm_campaign);
    if (utm.utm_source) dataUrl.searchParams.set('utm_source', utm.utm_source);
    if (utm.utm_medium) dataUrl.searchParams.set('utm_medium', utm.utm_medium);
    if (utm.utm_content) dataUrl.searchParams.set('utm_content', utm.utm_content);
    if (utm.utm_term) dataUrl.searchParams.set('utm_term', utm.utm_term);

    const finalUrl = dataUrl.toString();

    switch (embedType) {
        case 'inline':
            return `
                <div class="calendly-inline-widget" data-url="${finalUrl}" style="min-width:320px;height:${height};"></div>
            `;
        case 'popup_button':
            return `
                <button 
                    onclick="Calendly.initPopupWidget({url: '${finalUrl}'});return false;" 
                    class="custom-button"
                >
                    ${buttonText}
                </button>
            `;
        case 'popup_text':
            return `
                <a class="calendly-popup-link" href="#" onclick="Calendly.initPopupWidget({url: '${finalUrl}'});return false;">${buttonText}</a>
            `;
        default:
            return '<!-- Tipo de embed do Calendly inválido -->';
    }
}
