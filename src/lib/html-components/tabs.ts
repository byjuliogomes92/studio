
import type { PageComponent } from '@/lib/types';

export function renderTabs(component: PageComponent): string {
    const items = component.props.items || [];
    const tabsId = `tabs-${component.id}`;
    const styleString = getStyleString(component.props.styles);

    const triggersHtml = items
      .map(
        (item: { id: string; title: string }, index: number) => `
      <button class="tab-trigger" data-tab="${item.id}" role="tab" aria-controls="panel-${item.id}" aria-selected="${index === 0 ? 'true' : 'false'}">
        ${item.title}
      </button>`
      )
      .join('');
    const panelsHtml = items
      .map(
        (item: { id: string; content: string }, index: number) => `
      <div id="panel-${item.id}" class="tab-panel" role="tabpanel" ${index !== 0 ? 'hidden' : ''}>
        ${item.content}
      </div>`
      )
      .join('');
    return `
      <div class="tabs-container" id="${tabsId}" style="${styleString}">
        <div class="tab-list" role="tablist">${triggersHtml}</div>
        ${panelsHtml}
      </div>`;
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
