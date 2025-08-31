
import type { PageComponent } from '@/lib/types';

export function renderCountdown(component: PageComponent): string {
    const targetDate = component.props.targetDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    const styleString = getStyleString(component.props.styles);
    return `
        <div id="countdown-${component.id}" class="countdown" style="${styleString}"></div>
        <script>
          (function() {
            var target = new Date("${targetDate}").getTime();
            var el = document.getElementById("countdown-${component.id}");
            if (!el) return;
            var x = setInterval(function() {
              var now = new Date().getTime();
              var distance = target - now;
              var days = Math.floor(distance / (1000 * 60 * 60 * 24));
              var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / 1000 / 60 / 60);
              var minutes = Math.floor((distance % (1000 * 60 * 60)) / 1000 / 60);
              var seconds = Math.floor((distance % (1000 * 60)) / 1000);
              el.innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
              if (distance < 0) {
                clearInterval(x);
                el.innerHTML = "EXPIRADO";
              }
            }, 1000);
          })();
        </script>`;
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
