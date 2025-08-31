
import type { PageComponent } from '@/lib/types';

export function renderFooter(component: PageComponent): string {
    const styleString = getStyleString(component.props.styles);
    return `
    <footer style="${styleString}">
      <div class="MuiGrid-root natds602 MuiGrid-container">
          <div class="MuiGrid-root MuiGrid-item"><span class="MuiTypography-root MuiTypography-caption MuiTypography-colorInherit MuiTypography-alignCenter">${component.props.footerText1 || `© ${new Date().getFullYear()} Natura. Todos os direitos reservados.`}</span></div>
          <div class="MuiGrid-root MuiGrid-item"><span class="MuiTypography-root MuiTypography-caption MuiTypography-colorInherit MuiTypography-alignCenter">${component.props.footerText2 || 'NATURA COSMÉTICOS S/A...'}</span></div>
          <div class="MuiGrid-root MuiGrid-item"><span class="MuiTypography-root MuiTypography-caption MuiTypography-colorInherit MuiTypography-alignCenter">${component.props.footerText3 || 'Todos os preços e condições...'}</span></div>
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
