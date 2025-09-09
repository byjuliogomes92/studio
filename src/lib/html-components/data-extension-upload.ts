
import type { PageComponent, CloudPage, CampaignOption } from '@/lib/types';

export function renderDataExtensionUpload(component: PageComponent, pageState: CloudPage): string {
    const { 
        title = "Upload para Data Extension",
        instructionText = "Arraste e solte o arquivo CSV aqui, ou clique para selecionar.",
        campaigns = [],
        styles = {},
        animations = {},
        buttonProps = {}
    } = component.props;
    
    const { brandId } = pageState;
    const componentId = `de-upload-v2-${component.id}`;

    const {
        text: buttonText = "Processar Arquivo",
        icon: buttonIcon = "none",
        iconPosition = "left",
        bgColor: buttonBgColor = "var(--theme-color)",
        textColor: buttonTextColor = "#FFFFFF",
    } = buttonProps;
    
    const campaignOptionsHtml = campaigns.map((campaign: CampaignOption) => 
        `<option value="${campaign.deKey}">${campaign.name}</option>`
    ).join('');

    const campaignSelectorHtml = campaigns.length > 1 ? `
        <div class="de-upload-v2-campaign-selector">
            <label for="campaign-select-${component.id}">Selecione a campanha de destino:</label>
            <select id="campaign-select-${component.id}">
                <option value="" disabled selected>-- Escolha uma opção --</option>
                ${campaignOptionsHtml}
            </select>
        </div>
    ` : '';
    
    const iconUpload = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>`;
    const iconFile = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`;

    const lucideIconSvgs: Record<string, string> = {
        none: '',
        send: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
        'arrow-right': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
        'check-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
        'plus': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
        'download': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
        'star': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        'zap': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2z"/></svg>',
    };
    
    const iconHtml = buttonIcon && lucideIconSvgs[buttonIcon] ? lucideIconSvgs[buttonIcon] : '';
    const buttonContent = buttonIconPosition === 'right'
        ? `<span>${buttonText}</span>${iconHtml}`
        : `${iconHtml}<span>${buttonText}</span>`;
    
    const iconAnimationClass = animations.loop && animations.loop !== 'none' ? `animation-loop--${animations.loop}` : '';
    const iconHoverAnimationClass = animations.hover && animations.hover !== 'none' ? `animation-hover--${animations.hover}` : '';

    return `
      <div id="${componentId}" class="de-upload-v2-container">
          <h4>${title}</h4>
          
          <div class="de-upload-v2-instructions">
            <p><strong>Como funciona:</strong> Este componente faz o upload de um arquivo CSV para uma Data Extension no Marketing Cloud. Certifique-se de que a <strong>primeira linha (cabeçalho) do seu arquivo CSV</strong> contenha os nomes das colunas que correspondem exatamente aos campos da sua Data Extension de destino.</p>
          </div>

          ${campaignSelectorHtml}

          <div id="de-info-${component.id}" class="de-upload-v2-info" style="display:none;">
            <h5>Estrutura da Data Extension:</h5>
            <div id="de-info-table-wrapper-${component.id}" class="de-info-table-wrapper"></div>
          </div>
          
          <label for="file-input-${component.id}" id="drop-zone-${component.id}" class="de-upload-v2-drop-zone">
              <div class="de-upload-v2-drop-content initial">
                  <div class="de-upload-v2-icon ${iconAnimationClass} ${iconHoverAnimationClass}" style="color: ${styles.iconColor || '#6b7280'};">${iconUpload}</div>
                  <p>${instructionText}</p>
              </div>
              <div class="de-upload-v2-drop-content selected" style="display:none;">
                  <div class="de-upload-v2-icon" style="color: ${styles.iconColor || '#6b7280'};">${iconFile}</div>
                  <p><strong>Arquivo selecionado:</strong> <span id="filename-display-${component.id}"></span></p>
              </div>
          </label>
          <input type="file" id="file-input-${component.id}" accept=".csv" style="display:none;" />
          
          <div id="file-info-${component.id}" class="de-upload-v2-file-info">
            <div class="info-grid">
                <div class="info-item"><span class="info-label">Registros</span><span class="info-value" id="record-count-${component.id}">-</span></div>
                <div class="info-item"><span class="info-label">Colunas</span><span class="info-value" id="column-count-${component.id}">-</span></div>
                <div class="info-item"><span class="info-label">Tamanho</span><span class="info-value" id="filesize-display-${component.id}">-</span></div>
            </div>
            <div class="info-item-full">
              <span class="info-label">Nomes das Colunas do Arquivo</span>
              <div class="de-column-table-wrapper">
                 <table id="column-names-table-${component.id}">
                    <thead><tr><th>Nome da Coluna</th></tr></thead>
                    <tbody></tbody>
                 </table>
              </div>
            </div>
          </div>

          <div class="de-upload-v2-footer">
            <div id="feedback-container-${component.id}" class="de-upload-v2-feedback-container">
                <div id="progress-container-${component.id}" class="de-upload-v2-progress-container">
                    <div id="progress-bar-${component.id}" class="de-upload-v2-progress-bar" style="background-color: ${styles.progressBarColor || 'var(--theme-color)'};"></div>
                </div>
                <div id="status-message-${component.id}" class="de-upload-v2-status"></div>
            </div>

            <button id="upload-btn-${component.id}" class="custom-button" style="background-color: ${buttonBgColor}; color: ${buttonTextColor};" disabled>
               <span class="button-text">${buttonContent}</span>
               <div class="button-loader"></div>
            </button>
          </div>
      </div>

      <script>
      (function() {
          const container = document.querySelector('#${componentId}');
          if (!container || container.dataset.initialized) return; 
          container.dataset.initialized = 'true';

          const campaignSelect = document.getElementById('campaign-select-${component.id}');
          const dropZone = document.getElementById('drop-zone-${component.id}');
          const fileInput = document.getElementById('file-input-${component.id}');
          const filenameDisplay = document.getElementById('filename-display-${component.id}');
          const filesizeDisplay = document.getElementById('filesize-display-${component.id}');
          const recordCountDisplay = document.getElementById('record-count-${component.id}');
          const columnCountDisplay = document.getElementById('column-count-${component.id}');
          const columnTableBody = document.querySelector(\`#column-names-table-${component.id} tbody\`);
          const fileInfoContainer = document.getElementById('file-info-${component.id}');
          const uploadBtn = document.getElementById('upload-btn-${component.id}');
          const feedbackContainer = document.getElementById('feedback-container-${component.id}');
          const progressContainer = document.getElementById('progress-container-${component.id}');
          const progressBar = document.getElementById('progress-bar-${component.id}');
          const statusMessage = document.getElementById('status-message-${component.id}');
          const initialContent = dropZone.querySelector('.de-upload-v2-drop-content.initial');
          const selectedContent = dropZone.querySelector('.de-upload-v2-drop-content.selected');
          const submitBtnText = uploadBtn.querySelector('.button-text');
          const submitBtnLoader = uploadBtn.querySelector('.button-loader');
          const deInfoContainer = document.getElementById('de-info-${component.id}');
          const deInfoTableWrapper = document.getElementById('de-info-table-wrapper-${component.id}');
          
          const allCampaigns = JSON.parse('${JSON.stringify(campaigns)}');
          
          let selectedFile = null;

          function formatBytes(bytes, decimals = 2) {
            if (!bytes || bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
          }

          function showStatus(message, type) {
              feedbackContainer.style.display = 'block';
              statusMessage.textContent = message;
              if (type === 'success') {
                statusMessage.style.color = '${styles.successColor || '#16a34a'}';
              } else if (type === 'error') {
                statusMessage.style.color = '${styles.errorColor || '#dc2626'}';
              } else {
                statusMessage.style.color = 'var(--text-color)';
              }
          }
          
          function hideStatus() {
              feedbackContainer.style.display = 'none';
              statusMessage.textContent = '';
          }
          
          function setProgress(percentage) {
              progressContainer.style.display = 'block';
              progressBar.style.width = percentage + '%';
          }
          
          function checkCanUpload() {
              const campaignSelected = campaignSelect ? campaignSelect.value !== '' : (allCampaigns.length === 1);
              uploadBtn.disabled = !(selectedFile && campaignSelected);
          }

          function analyzeFile(file) {
              const reader = new FileReader();
              reader.onload = function(e) {
                  const text = e.target.result;
                  const lines = text.split(/[\\r\\n]+/).filter(line => line.trim() !== '');
                  const recordCount = lines.length > 0 ? lines.length - 1 : 0;
                  const header = lines[0] || '';
                  const columns = header.split(',').map(h => h.trim().replace(/"/g, ''));
                  
                  recordCountDisplay.textContent = recordCount;
                  columnCountDisplay.textContent = columns.length;
                  columnTableBody.innerHTML = columns.map(c => \`<tr><td>\${c}</td></tr>\`).join('');
                  fileInfoContainer.style.display = 'flex';
              };
              reader.onerror = function() {
                  showStatus('Erro ao ler o arquivo para análise.', 'error');
                  fileInfoContainer.style.display = 'none';
              };
              reader.readAsText(file);
          }

          function handleFileSelect(file) {
              if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
                  selectedFile = file;
                  filenameDisplay.textContent = file.name;
                  filesizeDisplay.textContent = formatBytes(file.size);
                  initialContent.style.display = 'none';
                  selectedContent.style.display = 'block';
                  analyzeFile(file);
                  checkCanUpload();
                  hideStatus();
                  setProgress(0);
                  feedbackContainer.style.display = 'none';
              } else {
                  resetState();
                  showStatus('Por favor, selecione um arquivo .csv válido.', 'error');
              }
          }

          function resetState() {
              selectedFile = null;
              fileInput.value = '';
              filenameDisplay.textContent = '';
              initialContent.style.display = 'block';
              selectedContent.style.display = 'none';
              fileInfoContainer.style.display = 'none';
              uploadBtn.disabled = true;
              submitBtnText.style.display = 'flex';
              submitBtnLoader.style.display = 'none';
              hideStatus();
              setProgress(0);
              progressContainer.style.display = 'none';
          }

          function displayDeInfo(deKey) {
            const campaign = allCampaigns.find(c => c.deKey === deKey);
            if (!campaign || !campaign.columns || campaign.columns.length === 0) {
              deInfoContainer.style.display = 'none';
              return;
            }

            const tableRows = campaign.columns.map(col => \`
              <tr>
                <td>\${col.name} \${col.isPrimaryKey ? '<span class="pk-badge">PK</span>' : ''}</td>
                <td>\${col.dataType}</td>
                <td>\${col.isNullable ? 'Sim' : 'Não'}</td>
              </tr>
            \`).join('');

            deInfoTableWrapper.innerHTML = \`
              <table>
                <thead>
                  <tr>
                    <th>Nome da Coluna</th>
                    <th>Tipo de Dado</th>
                    <th>Pode ser Nulo?</th>
                  </tr>
                </thead>
                <tbody>
                  \${tableRows}
                </tbody>
              </table>
            \`;
            deInfoContainer.style.display = 'block';
          }

          if(campaignSelect) {
            campaignSelect.addEventListener('change', () => {
                checkCanUpload();
                displayDeInfo(campaignSelect.value);
            });
          }
          
          if (!campaignSelect && allCampaigns.length === 1) {
              displayDeInfo(allCampaigns[0].deKey);
          }
          
          dropZone.addEventListener('click', () => fileInput.click());
          fileInput.addEventListener('change', () => handleFileSelect(fileInput.files[0]));
          
          ['dragenter', 'dragover'].forEach(eventName => {
              dropZone.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); dropZone.classList.add('active'); });
          });
          ['dragleave', 'drop'].forEach(eventName => {
              dropZone.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); dropZone.classList.remove('active'); });
          });
          
          dropZone.addEventListener('drop', (e) => {
              handleFileSelect(e.dataTransfer.files[0]);
          });

          uploadBtn.addEventListener('click', async () => {
              if (!selectedFile) return;
              const selectedDeKey = campaignSelect ? campaignSelect.value : (allCampaigns.length > 0 ? allCampaigns[0].deKey : '');
              if (!selectedDeKey) {
                  showStatus('Por favor, selecione uma campanha de destino.', 'error');
                  return;
              }

              uploadBtn.disabled = true;
              submitBtnText.style.display = 'none';
              submitBtnLoader.style.display = 'block';
              hideStatus();
              setProgress(10); 
              
              const reader = new FileReader();
              reader.readAsText(selectedFile);

              reader.onload = async () => {
                try {
                  const csvData = reader.result;
                  setProgress(30);
                  const response = await fetch('/api/sfmc-upload', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      csvData: csvData,
                      deKey: selectedDeKey,
                      brandId: '${brandId}'
                    }),
                  });
                  
                  setProgress(70);
                  const result = await response.json();

                  if (!response.ok) {
                    throw new Error(result.message || 'Erro desconhecido no servidor.');
                  }
                  
                  setProgress(100);
                  showStatus(result.message, 'success');
                  setTimeout(resetState, 5000);

                } catch (err) {
                    showStatus('Erro: ' + err.message, 'error');
                } finally {
                    uploadBtn.disabled = false;
                    submitBtnText.style.display = 'flex';
                    submitBtnLoader.style.display = 'none';
                }
              };

              reader.onerror = () => {
                 showStatus('Erro ao ler o arquivo.', 'error');
                 uploadBtn.disabled = false;
                 submitBtnText.style.display = 'flex';
                 submitBtnLoader.style.display = 'none';
              };
          });
      })();
      </script>
    `;
}
