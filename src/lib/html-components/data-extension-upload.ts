

import type { PageComponent, CloudPage, CampaignOption } from '@/lib/types';

export function renderDataExtensionUpload(component: PageComponent, pageState: CloudPage): string {
    const { 
        title = "Upload para Data Extension",
        instructionText = "Arraste e solte o arquivo CSV aqui, ou clique para selecionar.",
        buttonText = "Processar Arquivo",
        campaigns = [],
        styles = {}
    } = component.props;
    
    const { brandId } = pageState;
    const componentId = `de-upload-${component.id}`;

    const iconUpload = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>`;
    const iconFile = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`;

    const campaignOptionsHtml = campaigns.map((campaign: CampaignOption) => 
        `<option value="${campaign.deKey}">${campaign.name}</option>`
    ).join('');

    const campaignSelectorHtml = campaigns.length > 0 ? `
        <div class="de-upload-v2-campaign-selector">
            <label for="campaign-select-${component.id}">Selecione a campanha de destino:</label>
            <select id="campaign-select-${component.id}">
                <option value="" disabled selected>-- Escolha uma opção --</option>
                ${campaignOptionsHtml}
            </select>
        </div>
    ` : '';
    
    const styleVariables = `
      --de-upload-drop-zone-bg: ${styles.dropZoneBg || 'hsla(var(--primary-hsl), 0.05)'};
      --de-upload-drop-zone-border: ${styles.dropZoneBorder || 'hsl(var(--border-hsl))'};
      --de-upload-drop-zone-bg-hover: ${styles.dropZoneBgHover || 'hsla(var(--primary-hsl), 0.15)'};
      --de-upload-drop-zone-border-hover: ${styles.dropZoneBorderHover || 'hsl(var(--primary-hsl))'};
      --de-upload-icon-color: ${styles.iconColor || '#6b7280'};
      --de-upload-text-color: ${styles.textColor || '#6b7280'};
      --de-upload-progress-bar-color: ${styles.progressBarColor || 'hsl(var(--primary-hsl))'};
      --de-upload-success-color: ${styles.successColor || '#16a34a'};
      --de-upload-error-color: ${styles.errorColor || '#dc2626'};
    `;

    return `
      <div class="de-upload-v2-container" style="${styleVariables}" data-campaigns='${JSON.stringify(campaigns)}'>
          <h4>${title}</h4>
          ${campaignSelectorHtml}

          <div id="de-info-${component.id}" class="de-upload-v2-info" style="display:none;">
            <h5>Estrutura da Data Extension:</h5>
            <div id="de-info-table-wrapper-${component.id}" class="de-info-table-wrapper"></div>
          </div>
          
          <div id="drop-zone-${component.id}" class="de-upload-v2-drop-zone">
              <div class="de-upload-v2-drop-content initial">
                  <div class="de-upload-v2-icon">${iconUpload}</div>
                  <p>${instructionText}</p>
              </div>
              <div class="de-upload-v2-drop-content selected" style="display:none;">
                  <div class="de-upload-v2-icon">${iconFile}</div>
                  <p><strong id="filename-display-${component.id}"></strong><br><span id="filesize-display-${component.id}"></span></p>
              </div>
          </div>
          <input type="file" id="file-input-${component.id}" accept=".csv" style="display:none;" />
          
          <div id="feedback-container-${component.id}" class="de-upload-v2-feedback" style="display:none;">
              <div id="progress-container-${component.id}" class="de-upload-v2-progress-container">
                  <div id="progress-bar-${component.id}" class="de-upload-v2-progress-bar"></div>
              </div>
              <div id="status-message-${component.id}" class="de-upload-v2-status"></div>
          </div>

          <button id="upload-btn-${component.id}" class="custom-button" disabled>
             <span class="button-text">${buttonText}</span>
             <div class="button-loader"></div>
          </button>
      </div>

      <script>
      (function() {
          const container = document.querySelector('.de-upload-v2-container');
          if (!container || container.dataset.initialized) return; 
          container.dataset.initialized = 'true';

          const campaignSelect = document.getElementById('campaign-select-${component.id}');
          const dropZone = document.getElementById('drop-zone-${component.id}');
          const fileInput = document.getElementById('file-input-${component.id}');
          const filenameDisplay = document.getElementById('filename-display-${component.id}');
          const filesizeDisplay = document.getElementById('filesize-display-${component.id}');
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
          
          const allCampaigns = JSON.parse(container.dataset.campaigns || '[]');
          
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
              statusMessage.className = 'de-upload-v2-status ' + type;
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
              const campaignSelected = campaignSelect ? campaignSelect.value !== '' : true;
              uploadBtn.disabled = !(selectedFile && campaignSelected);
          }

          function handleFileSelect(file) {
              if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
                  selectedFile = file;
                  filenameDisplay.textContent = file.name;
                  filesizeDisplay.textContent = formatBytes(file.size);
                  initialContent.style.display = 'none';
                  selectedContent.style.display = 'block';
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
              fileInput.value = ''; // Reset file input
              filenameDisplay.textContent = '';
              filesizeDisplay.textContent = '';
              initialContent.style.display = 'block';
              selectedContent.style.display = 'none';
              uploadBtn.disabled = true;
              submitBtnText.style.display = 'inline-block';
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
          dropZone.addEventListener('click', () => fileInput.click());
          fileInput.addEventListener('change', () => handleFileSelect(fileInput.files[0]));
          
          ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
              dropZone.addEventListener(eventName, e => {
                  e.preventDefault();
                  e.stopPropagation();
              });
          });
          
          ['dragenter', 'dragover'].forEach(eventName => {
              dropZone.addEventListener(eventName, () => dropZone.classList.add('highlight'));
          });

          ['dragleave', 'drop'].forEach(eventName => {
              dropZone.addEventListener(eventName, () => dropZone.classList.remove('highlight'));
          });

          dropZone.addEventListener('drop', e => {
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
              submitBtnLoader.style.display = 'inline-block';
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
                    submitBtnText.style.display = 'inline-block';
                    submitBtnLoader.style.display = 'none';
                }
              };

              reader.onerror = () => {
                 showStatus('Erro ao ler o arquivo.', 'error');
                 uploadBtn.disabled = false;
                 submitBtnText.style.display = 'inline-block';
                 submitBtnLoader.style.display = 'none';
              };
          });
      })();
      </script>
    `;
}
