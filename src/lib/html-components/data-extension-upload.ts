
import type { PageComponent, CloudPage, CampaignGroup, UploadTarget } from '@/lib/types';

export function renderDataExtensionUpload(component: PageComponent, pageState: CloudPage, baseUrl: string): string {
    const { 
        title = "Upload para Data Extension",
        instructionText = "Arraste e solte o arquivo CSV aqui, ou clique para selecionar.",
        campaignGroups = [],
        buttonProps = {}
    } = component.props;
    
    const { brandId } = pageState;
    const componentId = component.id;
    const functionUrl = `https://us-central1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net/proxySfmcUpload`;

    const {
        text: buttonText = "Processar Arquivo",
        bgColor: buttonBgColor = "var(--theme-color, #3b82f6)",
        textColor: buttonTextColor = "#FFFFFF",
        icon: buttonIcon = "send"
    } = buttonProps;
    
    const campaignGroupOptionsHtml = campaignGroups.map((group: CampaignGroup) => 
        `<option value="${group.id}">${group.name}</option>`
    ).join('');

    const campaignSelectorHtml = campaignGroups.length > 1 ? `
        <div class="de-upload-v2-campaign-selector">
            <label for="campaign-group-select-${componentId}">1. Selecione a campanha:</label>
            <select id="campaign-group-select-${componentId}" class="de-upload-v2-select">
                <option value="" disabled selected>-- Escolha uma opção --</option>
                ${campaignGroupOptionsHtml}
            </select>
        </div>
        <div class="de-upload-v2-campaign-selector" id="upload-target-container-${componentId}" style="display: none;">
            <label for="upload-target-select-${componentId}">2. Selecione o destino do arquivo:</label>
            <select id="upload-target-select-${componentId}" class="de-upload-v2-select"></select>
        </div>
    ` : (campaignGroups.length === 1 && campaignGroups[0].uploadTargets.length > 1 ? `
        <div class="de-upload-v2-campaign-selector">
            <label for="upload-target-select-${componentId}">1. Selecione o destino do arquivo:</label>
            <select id="upload-target-select-${componentId}" class="de-upload-v2-select">
                <option value="" disabled selected>-- Escolha uma opção --</option>
                ${campaignGroups[0].uploadTargets.map((target: UploadTarget) => `<option value="${target.id}">${target.name}</option>`).join('')}
            </select>
        </div>
    ` : '');
    
    const lucideIconSvgs: Record<string, string> = {
        none: '',
        send: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    };
    
    const iconHtml = buttonIcon && lucideIconSvgs[buttonIcon] ? lucideIconSvgs[buttonIcon] : '';
    const buttonContent = `${iconHtml}<span>${buttonText}</span>`;

    return `
      <div class="de-upload-v2-container">
          <div id="step1-${componentId}">
              <h4>${title}</h4>
              ${campaignSelectorHtml}
              <div class="de-upload-v2-drop-zone">
                  <input type="file" id="file-input-${componentId}" accept=".csv, text/csv" required style="display: none;">
                  <div class="de-upload-v2-drop-content">
                      <div class="de-upload-v2-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                      </div>
                      <p>${instructionText}</p>
                      <p class="de-upload-v2-filename-display" style="display:none; margin-top: 10px; font-weight: bold;"></p>
                  </div>
              </div>
              <div class="de-upload-v2-actions" style="margin-top: 1rem;">
                  <button type="button" id="submit-btn-${componentId}" class="custom-button" style="background-color: ${buttonBgColor}; color: ${buttonTextColor};">${buttonContent}</button>
              </div>
              <div id="status-container-${componentId}" class="de-upload-v2-feedback" style="display: none; margin-top: 1rem;">
                   <p class="de-upload-v2-status"></p>
              </div>
          </div>
          
          <form id="hidden-form-${componentId}" method="POST" action="${functionUrl}" style="display:none;">
              <input type="hidden" name="deKey">
              <input type="hidden" name="brandId">
              <input type="hidden" name="columnMapping">
              <input type="hidden" name="records">
              <input type="hidden" name="returnUrl" value="%%=RequestParameter('PAGEURL')=%%">
          </form>

      </div>
      <script>
      (function() {
          const container = document.querySelector('.de-upload-v2-container');
          if (!container) return;
          const componentId = '${componentId}';
          const brandId = '${brandId}';
          const campaignGroupsData = ${JSON.stringify(campaignGroups)};
          const CHUNK_SIZE = 5000;

          const dropZone = container.querySelector('.de-upload-v2-drop-zone');
          const fileInput = container.querySelector('#file-input-' + componentId);
          const submitBtn = document.getElementById('submit-btn-' + componentId);
          const groupSelect = document.getElementById('campaign-group-select-' + componentId);
          const targetSelect = document.getElementById('upload-target-select-' + componentId);
          const targetContainer = document.getElementById('upload-target-container-' + componentId);
          const statusContainer = document.getElementById('status-container-' + componentId);
          const statusEl = statusContainer.querySelector('.de-upload-v2-status');
          const hiddenForm = document.getElementById('hidden-form-' + componentId);
          const filenameDisplay = dropZone.querySelector('.de-upload-v2-filename-display');


          let currentFile;
          let allRecords = [];

          function updateTargetOptions(targets) {
              targetSelect.innerHTML = '<option value="" disabled selected>-- Escolha um destino --</option>';
              targets.forEach(target => {
                  const option = document.createElement('option');
                  option.value = target.id;
                  option.textContent = target.name;
                  targetSelect.appendChild(option);
              });
              targetContainer.style.display = 'block';
          }
          
          if (groupSelect) {
              groupSelect.addEventListener('change', () => {
                  const selectedGroupId = groupSelect.value;
                  const selectedGroup = campaignGroupsData.find(g => g.id === selectedGroupId);
                  if (selectedGroup && selectedGroup.uploadTargets) {
                      updateTargetOptions(selectedGroup.uploadTargets);
                  } else {
                       targetContainer.style.display = 'none';
                  }
              });
          } else if (campaignGroupsData.length === 1 && campaignGroupsData[0].uploadTargets.length > 1) {
              updateTargetOptions(campaignGroupsData[0].uploadTargets);
          }

          dropZone.addEventListener('click', () => fileInput.click());
          dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('highlight'); });
          dropZone.addEventListener('dragleave', () => dropZone.classList.remove('highlight'));
          dropZone.addEventListener('drop', (e) => {
              e.preventDefault();
              dropZone.classList.remove('highlight');
              if (e.dataTransfer.files.length) {
                  handleFileSelect(e.dataTransfer.files[0]);
              }
          });
          fileInput.addEventListener('change', () => { if (fileInput.files.length) { handleFileSelect(fileInput.files[0]); } });
          
          function getSelectedTarget() {
              let selectedTargetId;
              if (targetSelect && targetSelect.value) {
                 selectedTargetId = targetSelect.value;
              } else if (campaignGroupsData.length === 1 && campaignGroupsData[0].uploadTargets.length === 1) {
                 return campaignGroupsData[0].uploadTargets[0];
              }

              for(const group of campaignGroupsData) {
                  const found = group.uploadTargets.find(t => t.id === selectedTargetId);
                  if (found) return found;
              }
              return null;
          }

          function parseCsv(text) {
              const lines = text.split(/\\r\\n|\\n/).filter(l => l.trim() !== '');
              if (lines.length < 1) return { headers: [], records: [] };
              
              const delimiter = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ';' : ',';
              const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
              const records = [];

              for (let i = 1; i < lines.length; i++) {
                  const values = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
                  const record = {};
                  headers.forEach((header, index) => {
                      record[header] = values[index];
                  });
                  records.push(record);
              }
              return { headers, records };
          }

          function handleFileSelect(file) {
              if (!file || !(file.type.match('text/csv') || file.name.endsWith('.csv'))) {
                  alert('Por favor, selecione um arquivo CSV.');
                  return;
              }
              currentFile = file;
              filenameDisplay.textContent = file.name;
              filenameDisplay.style.display = 'block';
              
              const reader = new FileReader();
              reader.onload = function(e) {
                  const { records } = parseCsv(e.target.result);
                  allRecords = records;
              };
              reader.readAsText(file, 'ISO-8859-1');
          }
          
          submitBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                const selectedTarget = getSelectedTarget();
                if (!selectedTarget || !selectedTarget.deKey) { alert('Por favor, selecione um destino para o arquivo.'); return; }
                if (!currentFile || allRecords.length === 0) { alert('Por favor, selecione um arquivo CSV válido.'); return; }

                statusContainer.style.display = 'block';
                statusEl.className = 'de-upload-v2-status info';
                statusEl.textContent = 'Iniciando upload...';
                submitBtn.disabled = true;

                // Simple column mapping based on what's configured, assuming direct match for now
                const columnMapping = {}; 
                const totalChunks = Math.ceil(allRecords.length / CHUNK_SIZE);
                let processedChunks = 0;
                let totalSuccess = 0;

                for (let i = 0; i < allRecords.length; i += CHUNK_SIZE) {
                    const chunk = allRecords.slice(i, i + CHUNK_SIZE);
                    
                    statusEl.textContent = 'Enviando lote ' + (processedChunks + 1) + ' de ' + totalChunks + '...';
                    
                    // Populate and submit the hidden form for each chunk
                    hiddenForm.deKey.value = selectedTarget.deKey;
                    hiddenForm.brandId.value = brandId;
                    hiddenForm.columnMapping.value = JSON.stringify(columnMapping);
                    hiddenForm.records.value = JSON.stringify(chunk);
                    
                    // We need a way to know when the form submission is "done"
                    // The easiest way is to use an iframe as a target
                    const iframeId = 'upload-iframe-' + componentId;
                    let iframe = document.getElementById(iframeId);
                    if (!iframe) {
                        iframe = document.createElement('iframe');
                        iframe.id = iframeId;
                        iframe.name = iframeId;
                        iframe.style.display = 'none';
                        document.body.appendChild(iframe);
                    }
                    hiddenForm.target = iframeId;
                    
                    // Submit the form
                    hiddenForm.submit();
                    
                    processedChunks++;
                    totalSuccess += chunk.length;
                }

                // Since we can't get a direct response, we assume success after submission
                statusEl.className = 'de-upload-v2-status success';
                statusEl.textContent = 'Envio concluído! ' + totalSuccess + ' registros foram enviados para processamento.';
                submitBtn.disabled = false;
          });
          
          // Logic to show status from URL after redirection
          const urlParams = new URLSearchParams(window.location.search);
          const uploadStatus = urlParams.get('uploadStatus');
          if (uploadStatus) {
              statusContainer.style.display = 'block';
              if (uploadStatus === 'success') {
                  const count = urlParams.get('count');
                  statusEl.className = 'de-upload-v2-status success';
                  statusEl.textContent = 'Upload bem-sucedido! ' + count + ' registros processados.';
              } else {
                  const errorMsg = urlParams.get('error') || 'Ocorreu um erro desconhecido.';
                  statusEl.className = 'de-upload-v2-status error';
                  statusEl.textContent = 'Falha no upload: ' + decodeURIComponent(errorMsg);
              }
          }
      })();
      </script>
    `;
}
