import type { PageComponent } from '@/lib/types';

export function renderCountdown(component: PageComponent): string {
    const {
        targetDate,
        style = 'blocks', // 'blocks', 'circles', 'simple'
        backgroundColor = '#000000',
        digitColor = '#FFFFFF',
        labelColor = '#374151',
        digitFontSize = '2rem',
        labelFontSize = '0.8rem',
        gap = '1rem',
        labelDays = 'Dias',
        labelHours = 'Horas',
        labelMinutes = 'Minutos',
        labelSeconds = 'Segundos'
    } = component.props;

    const finalTargetDate = targetDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    const countdownId = `countdown-${component.id}`;

    const styleString = getStyleString(component.props.styles);

    const labels = {
        days: labelDays,
        hours: labelHours,
        minutes: labelMinutes,
        seconds: labelSeconds
    };

    return `
        <div id="${countdownId}" class="countdown-container countdown-${style}" style="${styleString}"></div>
        <script>
            (function() {
                var target = new Date("${finalTargetDate}").getTime();
                var el = document.getElementById("${countdownId}");
                if (!el) return;

                var labels = ${JSON.stringify(labels)};
                var style = "${style}";
                var digitFontSize = "${digitFontSize}";
                var labelFontSize = "${labelFontSize}";
                var gap = "${gap}";
                var digitColor = "${digitColor}";
                var labelColor = "${labelColor}";
                var bgColor = "${backgroundColor}";

                var x = setInterval(function() {
                    var now = new Date().getTime();
                    var distance = target - now;

                    if (distance < 0) {
                        clearInterval(x);
                        el.innerHTML = "<div class='countdown-expired'>EXPIRADO</div>";
                        return;
                    }

                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    var timeParts = {
                        days: days,
                        hours: hours,
                        minutes: minutes,
                        seconds: seconds
                    };

                    if (style === 'simple') {
                        el.innerHTML = \`
                            <div style="font-size: \${digitFontSize}; color: \${digitColor};">
                                \${days}d \${hours}h \${minutes}m \${seconds}s
                            </div>\`;
                    } else {
                        var html = '<div class="countdown-wrapper" style="gap: ' + gap + ';">';
                        for (var key in timeParts) {
                            var value = String(timeParts[key]).padStart(2, '0');
                            html += \`
                                <div class="countdown-item">
                                    <div class="countdown-value" style="background-color: \${bgColor}; color: \${digitColor}; font-size: \${digitFontSize};">
                                        \${value}
                                        \${style === 'circles' ? '<svg class="countdown-circle-svg"><circle r="18" cx="20" cy="20"></circle><circle r="18" cx="20" cy="20" style="stroke-dashoffset: ' + (113 * (1 - (timeParts[key] / {days: 365, hours: 24, minutes: 60, seconds: 60}[key]))) + ';" class="countdown-circle-progress"></circle></svg>' : ''}
                                    </div>
                                    <div class="countdown-label" style="color: \${labelColor}; font-size: \${labelFontSize};">\${labels[key]}</div>
                                </div>\`;
                        }
                        html += '</div>';
                        el.innerHTML = html;
                    }
                }, 1000);
            })();
        </script>
    `;
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

    