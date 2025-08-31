
import type { PageComponent } from '@/lib/types';

export function renderFooter(component: PageComponent): string {
    const {
        footerText1 = `© ${new Date().getFullYear()} Empresa. Todos os direitos reservados.`,
        footerText2 = 'Informações legais ou endereço da empresa.',
        footerText3 = 'Links úteis ou outros avisos.',
        styles = {}
    } = component.props;
    const styleString = getStyleString(styles);

    return `
    <footer style="${styleString}">
      <div class="MuiGrid-root natds602 MuiGrid-container">
          <div class="MuiGrid-root MuiGrid-item"><span class="MuiTypography-root MuiTypography-caption MuiTypography-colorInherit MuiTypography-alignCenter">${footerText1}</span></div>
          <div class="MuiGrid-root MuiGrid-item"><span class="MuiTypography-root MuiTypography-caption MuiTypography-colorInherit MuiTypography-alignCenter">${footerText2}</span></div>
          <div class="MuiGrid-root MuiGrid-item"><span class="MuiTypography-root MuiTypography-caption MuiTypography-colorInherit MuiTypography-alignCenter">${footerText3}</span></div>
      </div>
    </footer>`;
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
