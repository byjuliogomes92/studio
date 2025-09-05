
import type { PageComponent } from '@/lib/types';

function toUtcFormat(isoString: string | undefined, isAllDay: boolean): string {
    if (!isoString) return '';
    
    // Add time if it's missing for non-all-day events
    if (!isAllDay && isoString.length === 10) {
        isoString += 'T00:00:00';
    }

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';

    if (isAllDay) {
        // Format: YYYYMMDD
        const year = date.getUTCFullYear();
        const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
        const day = ('0' + date.getUTCDate()).slice(-2);
        return `${year}${month}${day}`;
    }

    // Format: YYYYMMDDTHHMMSSZ for timed events
    return date.toISOString().replace(/[-:.]/g, '').slice(0, -4) + 'Z';
}

function formatOutlookDate(isoString: string | undefined, isAllDay: boolean): string {
     if (!isoString) return '';
      // Add time if it's missing for non-all-day events
    if (!isAllDay && isoString.length === 10) {
        isoString += 'T00:00:00';
    }
     const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString();
}

export function renderAddToCalendar(component: PageComponent): string {
    const { 
        title = '', 
        description = '', 
        startTime, 
        endTime, 
        isAllDay = false,
        location = '',
        buttonTextGoogle = 'Adicionar ao Google Calendar',
        buttonTextOutlook = 'Adicionar ao Outlook',
        showGoogle = true,
        showOutlook = true,
        align = 'center'
    } = component.props;

    if (!title || !startTime) {
        return `
            <div style="padding: 20px; border: 2px dashed #cc0000; background-color: #fff5f5; text-align: center;">
                <p style="color: #cc0000; margin: 0; font-family: sans-serif;">
                    <strong>Componente "Adicionar ao Calendário":</strong>
                    <br>
                    Por favor, configure o 'Título' e a data de 'Início' para exibir os botões.
                </p>
            </div>
        `;
    }
    
    let finalEndTime = endTime;
    if (isAllDay && startTime && !endTime) {
        const startDate = new Date(startTime);
        startDate.setDate(startDate.getDate() + 1);
        finalEndTime = startDate.toISOString().split('T')[0];
    }

    const googleDates = `${toUtcFormat(startTime, isAllDay)}/${toUtcFormat(finalEndTime, isAllDay)}`;

    const googleUrl = new URL('https://www.google.com/calendar/render');
    googleUrl.searchParams.append('action', 'TEMPLATE');
    googleUrl.searchParams.append('text', title);
    googleUrl.searchParams.append('dates', googleDates);
    googleUrl.searchParams.append('details', description);
    googleUrl.searchParams.append('location', location);

    const outlookUrl = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
    outlookUrl.searchParams.append('path', '/calendar/action/compose');
    outlookUrl.searchParams.append('rru', 'addevent');
    outlookUrl.searchParams.append('subject', title);
    outlookUrl.searchParams.append('startdt', formatOutlookDate(startTime, isAllDay));
    if (finalEndTime) {
        outlookUrl.searchParams.append('enddt', formatOutlookDate(finalEndTime, isAllDay));
    }
    outlookUrl.searchParams.append('body', description);
    outlookUrl.searchParams.append('location', location);
    outlookUrl.searchParams.append('allday', String(isAllDay));
    
    const googleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.94 11.13c.06.45.09.91.09 1.38 0 4.42-3.27 8-7.5 8s-7.5-3.58-7.5-8c0-4.42 3.27-8 7.5-8 1.99 0 3.79.77 5.12 2.02l-2.29 2.29C15.03 8.38 13.88 8 12.53 8c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5c2.91 0 4.14-2.23 4.31-3.37h-4.31v-2.5h7.43z"/></svg>`;
    const outlookIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.4 2h-6.8a2.6 2.6 0 0 0-2.6 2.6V12h12V4.6a2.6 2.6 0 0 0-2.6-2.6m-3.4 8.2a1.2 1.2 0 1 1-1.2-1.2 1.2 1.2 0 0 1 1.2 1.2m-5.6 1.6V22l4.4-2.2 2.2-1.1 2.2 1.1L17 22V11.8z"/></svg>`;

    const justifyContent = align === 'center' ? 'center' : (align === 'right' ? 'flex-end' : 'flex-start');

    return `
        <div class="add-to-calendar-container" style="justify-content: ${justifyContent}; display: flex;">
            ${showGoogle ? `<a href="${googleUrl.toString()}" target="_blank" class="add-to-calendar-button google">${googleIcon} ${buttonTextGoogle}</a>` : ''}
            ${showOutlook ? `<a href="${outlookUrl.toString()}" target="_blank" class="add-to-calendar-button outlook">${outlookIcon} ${buttonTextOutlook}</a>` : ''}
        </div>
    `;
}
