
import type { PageComponent } from '@/lib/types';

export function renderAccordion(component: PageComponent): string {
    const items = component.props.items || [];
    const styleString = getStyleString(component.props.styles);

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

function getStyleString(styles: any = {}): string {
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}
