
import type { PageComponent } from '@/lib/types';

export function renderAccordion(component: PageComponent): string {
    const items = component.props.items || [];
    const styles = component.props.styles || {};
    const { maxWidth = '100%', align = 'left' } = styles;
    
    let margin = '0';
    if (align === 'center') {
        margin = '0 auto';
    } else if (align === 'right') {
        margin = '0 0 0 auto';
    }

    const styleString = `max-width: ${maxWidth}; margin: ${margin};`;

    const itemsHtml = items
        .map(
        (item: { id: string; title: string; content: string }) => `
        <div class="accordion-item">
            <h2 class="accordion-heading">
              <button class="accordion-header" aria-expanded="false" aria-controls="content-${item.id}">
                <span>${item.title}</span>
                <span class="accordion-icon"></span>
              </button>
            </h2>
            <div id="content-${item.id}" class="accordion-content-wrapper">
              <div class="accordion-content">
                  <div>${item.content}</div>
              </div>
            </div>
        </div>`
        )
        .join('');
    return `<div class="accordion-container" style="${styleString}">${itemsHtml}</div>`;
}
