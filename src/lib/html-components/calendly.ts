
import type { PageComponent } from '@/lib/types';

export function renderCalendly(component: PageComponent): string {
    const { 
        embedType = 'inline',
        calendlyUrl = '',
        buttonText = 'Agende um Horário',
        textColor = '#ffffff',
        buttonColor = '#0069ff',
        prefill = {},
        utm = {}
    } = component.props;

    const dataUrl = new URL(calendlyUrl || 'https://calendly.com/user/event');
    
    // Add text color and button color to URL params
    dataUrl.searchParams.set('text_color', textColor.substring(1));
    dataUrl.searchParams.set('primary_color', buttonColor.substring(1));

    // Prefill parameters
    if (prefill.name) dataUrl.searchParams.set('name', prefill.name);
    if (prefill.email) dataUrl.searchParams.set('email', prefill.email);
    if (prefill.custom1) dataUrl.searchParams.set('a1', prefill.custom1);
    if (prefill.custom2) dataUrl.searchParams.set('a2', prefill.custom2);
    if (prefill.custom3) dataUrl.searchParams.set('a3', prefill.custom3);
    if (prefill.custom4) dataUrl.searchParams.set('a4', prefill.custom4);
    if (prefill.custom5) dataUrl.searchParams.set('a5', prefill.custom5);
    
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
                <div class="calendly-inline-widget" data-url="${finalUrl}" style="min-width:320px;height:700px;"></div>
            `;
        case 'popup_button':
            return `
                <button 
                    onclick="Calendly.initPopupWidget({url: '${finalUrl}'});return false;" 
                    class="custom-button"
                    style="background-color: ${buttonColor}; color: ${textColor};"
                >
                    ${buttonText}
                </button>
            `;
        case 'popup_text':
            return `
                <a href="" onclick="Calendly.initPopupWidget({url: '${finalUrl}'});return false;">${buttonText}</a>
            `;
        default:
            return '<!-- Tipo de embed do Calendly inválido -->';
    }
}
