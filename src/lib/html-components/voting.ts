
import type { PageComponent } from '@/lib/types';

export function renderVoting(component: PageComponent): string {
    const { question, options = [] } = component.props;
    const votingId = `voting-${component.id}`;
    const styleString = getStyleString(component.props.styles);

    const optionsHtml = options.map((opt: { id: string; text: string; }) => `
        <button class="voting-option" data-option-id="${opt.id}">${opt.text}</button>
    `).join('');

    const resultsHtml = options.map((opt: { id: string; text: string; }) => `
        <div class="voting-result">
            <div class="result-label">${opt.text}</div>
            <div class="result-bar-container">
                <div class="result-bar" id="result-bar-${opt.id}" style="width: 0%;"></div>
            </div>
            <div class="result-percentage" id="result-percentage-${opt.id}">0%</div>
        </div>
    `).join('');

    return `
        <div id="${votingId}" class="voting-container" style="${styleString}">
            <h3 class="voting-question">${question || 'Sua pergunta aqui'}</h3>
            <div class="voting-options">${optionsHtml}</div>
            <div class="voting-results" style="display: none;">${resultsHtml}</div>
        </div>
        <script>
            (function() {
                const votingContainer = document.getElementById('${votingId}');
                if (!votingContainer) return;

                const optionsContainer = votingContainer.querySelector('.voting-options');
                const resultsContainer = votingContainer.querySelector('.voting-results');
                const storageKey = 'voting_data_${votingId}';
                const hasVotedKey = 'has_voted_${votingId}';

                let votes = JSON.parse(localStorage.getItem(storageKey)) || {};
                const hasVoted = localStorage.getItem(hasVotedKey) === 'true';

                function updateResults() {
                    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
                    if (totalVotes === 0) return;

                    Object.keys(votes).forEach(optionId => {
                        const voteCount = votes[optionId] || 0;
                        const percentage = ((voteCount / totalVotes) * 100).toFixed(1);
                        const bar = resultsContainer.querySelector(\`#result-bar-\${optionId}\`);
                        const percentageEl = resultsContainer.querySelector(\`#result-percentage-\${optionId}\`);

                        if (bar) bar.style.width = \`\${percentage}%\`;
                        if (percentageEl) percentageEl.textContent = \`\${percentage}%\`;
                    });
                }

                function showResults() {
                    optionsContainer.style.display = 'none';
                    resultsContainer.style.display = 'block';
                    updateResults();
                }

                if (hasVoted) {
                    showResults();
                }

                optionsContainer.addEventListener('click', function(event) {
                    if (event.target.classList.contains('voting-option')) {
                        if (localStorage.getItem(hasVotedKey) === 'true') {
                            alert('Você já votou.');
                            return;
                        }
                        
                        const optionId = event.target.dataset.optionId;
                        votes[optionId] = (votes[optionId] || 0) + 1;
                        
                        localStorage.setItem(storageKey, JSON.stringify(votes));
                        localStorage.setItem(hasVotedKey, 'true');
                        
                        showResults();
                    }
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
