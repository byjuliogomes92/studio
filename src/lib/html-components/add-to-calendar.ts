
import type { PageComponent } from '@/lib/types';

function toUtcFormat(isoString: string | undefined, forGoogle: boolean): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';

    if (forGoogle) {
        // Format: YYYYMMDDTHHMMSSZ
        return date.getUTCFullYear() +
               ('0' + (date.getUTCMonth() + 1)).slice(-2) +
               ('0' + date.getUTCDate()).slice(-2) +
               'T' +
               ('0' + date.getUTCHours()).slice(-2) +
               ('0' + date.getUTCMinutes()).slice(-2) +
               ('0' + date.getUTCSeconds()).slice(-2) +
               'Z';
    } else {
        // Format: YYYY-MM-DDTHH:MM:SS
         return date.getFullYear() +
               '-' +
               ('0' + (date.getMonth() + 1)).slice(-2) +
               '-' +
               ('0' + date.getDate()).slice(-2) +
               'T' +
               ('0' + date.getHours()).slice(-2) +
               ':' +
               ('0' + date.getMinutes()).slice(-2) +
               ':' +
               ('0' + date.getSeconds()).slice(-2);
    }
}

export function renderAddToCalendar(component: PageComponent): string {
    const { 
        title = '', 
        description = '', 
        startTime, 
        endTime, 
        location = '',
        buttonTextGoogle = 'Adicionar ao Google Calendar',
        buttonTextOutlook = 'Adicionar ao Outlook',
        showGoogle = true,
        showOutlook = true,
        align = 'left'
    } = component.props;

    if (!title || !startTime || !endTime) {
        return '<!-- Componente "Adicionar ao Calendário" não configurado corretamente. Título, Início e Fim são obrigatórios. -->';
    }

    const googleUrl = new URL('https://www.google.com/calendar/render');
    googleUrl.searchParams.append('action', 'TEMPLATE');
    googleUrl.searchParams.append('text', title);
    googleUrl.searchParams.append('dates', `${toUtcFormat(startTime, true)}/${toUtcFormat(endTime, true)}`);
    googleUrl.searchParams.append('details', description);
    googleUrl.searchParams.append('location', location);

    const outlookUrl = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
    outlookUrl.searchParams.append('path', '/calendar/action/compose');
    outlookUrl.searchParams.append('rru', 'addevent');
    outlookUrl.searchParams.append('subject', title);
    outlookUrl.searchParams.append('startdt', toUtcFormat(startTime, false));
    outlookUrl.searchParams.append('enddt', toUtcFormat(endTime, false));
    outlookUrl.searchParams.append('body', description);
    outlookUrl.searchParams.append('location', location);
    
    const googleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.94 11.13c.06.45.09.91.09 1.38 0 4.42-3.27 8-7.5 8s-7.5-3.58-7.5-8c0-4.42 3.27-8 7.5-8 1.99 0 3.79.77 5.12 2.02l-2.29 2.29C15.03 8.38 13.88 8 12.53 8c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5c2.91 0 4.14-2.23 4.31-3.37h-4.31v-2.5h7.43z"/></svg>`;
    const outlookIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.4 2h-6.8a2.6 2.6 0 0 0-2.6 2.6V12h12V4.6a2.6 2.6 0 0 0-2.6-2.6m-3.4 8.2a1.2 1.2 0 1 1-1.2-1.2 1.2 1.2 0 0 1 1.2 1.2m-5.6 1.6V22l4.4-2.2 2.2-1.1 2.2 1.1L17 22V11.8z"/></svg>`;

    return `
        <div class="add-to-calendar-container" style="align-items: ${align};">
            ${showGoogle ? `<a href="${googleUrl.toString()}" target="_blank" class="add-to-calendar-button google">${googleIcon} ${buttonTextGoogle}</a>` : ''}
            ${showOutlook ? `<a href="${outlookUrl.toString()}" target="_blank" class="add-to-calendar-button outlook">${outlookIcon} ${buttonTextOutlook}</a>` : ''}
        </div>
    `;
}
