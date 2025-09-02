
import type { PageComponent } from '@/lib/types';

export function renderNPS(component: PageComponent): string {
    const { question, type = 'numeric', lowLabel, highLabel, thankYouMessage } = component.props;
    const npsId = `nps-${component.id}`;
    const styleString = getStyleString(component.props.styles);

    let optionsHtml = '';
    if (type === 'numeric') {
        for (let i = 0; i <= 10; i++) {
            optionsHtml += `<button class="nps-option nps-numeric" data-score="${i}">${i}</button>`;
        }
    } else { // faces
        const faces = ['😡', '😠', '😑', '😐', '🙂', '😄', '😁'];
        optionsHtml = faces.map((face, i) => `<button class="nps-option nps-face" data-score="${i}">${face}</button>`).join('');
    }
    
    return `
        <div id="${npsId}" class="nps-container" style="${styleString}">
            <div class="nps-content">
                <p class="nps-question">${question}</p>
                <div class="nps-options-wrapper">${optionsHtml}</div>
                <div class="nps-labels">
                    <span>${lowLabel}</span>
                    <span>${highLabel}</span>
                </div>
            </div>
            <div class="nps-thanks" style="display: none;">
                <p>${thankYouMessage}</p>
            </div>
        </div>
        <script>
            (function() {
                const npsContainer = document.getElementById('${npsId}');
                if (!npsContainer) return;
                
                const mainForm = document.querySelector('form[id^="smartcapture-form-"]');
                let npsScoreInput;

                if (mainForm) {
                    npsScoreInput = mainForm.querySelector('input[name="NPS_SCORE"]');
                    if (!npsScoreInput) {
                        npsScoreInput = document.createElement('input');
                        npsScoreInput.type = 'hidden';
                        npsScoreInput.name = 'NPS_SCORE';
                        mainForm.appendChild(npsScoreInput);
                    }
                }

                const options = npsContainer.querySelectorAll('.nps-option');
                options.forEach(option => {
                    option.addEventListener('click', function() {
                        const score = this.dataset.score;
                        
                        if (npsScoreInput) {
                            npsScoreInput.value = score;
                        }

                        // Visual feedback
                        options.forEach(opt => opt.classList.remove('selected'));
                        this.classList.add('selected');
                        
                        // Show thanks message
                        const content = npsContainer.querySelector('.nps-content');
                        const thanks = npsContainer.querySelector('.nps-thanks');
                        if (content) content.style.display = 'none';
                        if (thanks) thanks.style.display = 'block';
                    });
                });
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
