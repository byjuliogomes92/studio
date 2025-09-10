
import type { PageComponent, CloudPage, CampaignGroup, UploadTarget } from '@/lib/types';

export function renderDataExtensionUpload(component: PageComponent, pageState: CloudPage): string {
    const { 
        title = "Upload para Data Extension",
        instructionText = "Arraste e solte o arquivo CSV aqui, ou clique para selecionar.",
        campaignGroups = [],
        buttonProps = {}
    } = component.props;
    
    const { brandId } = pageState;
    const componentId = component.id;
    const formId = `de-upload-form-${componentId}`;

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
                ${campaignGroups[0].uploadTargets.map((target: UploadTarget) => `<option value="${target.deKey}">${target.name}</option>`).join('')}
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
          <form id="${formId}">
              <div class="de-upload-v2-step" id="step1-${componentId}">
                  <h4>${title}</h4>
                  ${campaignSelectorHtml}
                  <div class="de-upload-v2-drop-zone">
                      <input type="file" id="file-input-${componentId}" accept=".csv, text/csv" required style="display: none;">
                      <div class="de-upload-v2-drop-content">
                          <div class="de-upload-v2-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                          </div>
                          <p>${instructionText}</p>
                      </div>
                  </div>
              </div>

              <div class="de-upload-v2-step" id="step2-${componentId}" style="display: none;">
                  <h4>Confirmar Arquivo</h4>
                  <p class="de-upload-v2-filename-confirm"></p>
                  <div class="de-upload-v2-stats-grid">
                      <div class="de-upload-v2-stat-card"><h5>Registros</h5><p id="stat-rows-${componentId}">-</p></div>
                      <div class="de-upload-v2-stat-card"><h5>Colunas</h5><p id="stat-cols-${componentId}">-</p></div>
                      <div class="de-upload-v2-stat-card"><h5>Tamanho</h5><p id="stat-size-${componentId}">-</p></div>
                  </div>
                  <div class="de-upload-v2-columns-container">
                      <h5>Colunas Detectadas:</h5>
                      <div class="de-upload-v2-columns-list" id="columns-list-${componentId}"></div>
                  </div>
                  <div class="de-upload-v2-actions">
                      <button type="button" id="cancel-btn-${componentId}" class="custom-button custom-button--outline">Trocar Arquivo</button>
                      <button type="submit" class="custom-button" style="background-color: ${buttonBgColor}; color: ${buttonTextColor};">${buttonContent}</button>
                  </div>
              </div>

              <div class="de-upload-v2-step" id="step3-${componentId}" style="display: none;">
                   <h4>Processando</h4>
                   <div class="de-upload-v2-feedback">
                       <div class="de-upload-v2-progress-container"><div class="de-upload-v2-progress-bar"></div></div>
                       <p class="de-upload-v2-status info">Aguarde, estamos processando seu arquivo...</p>
                   </div>
              </div>
          </form>
      </div>
      <script>
      (function() {
          const form = document.getElementById('${formId}');
          if (!form) return;
          const componentId = '${componentId}';
          const campaignGroupsData = ${JSON.stringify(campaignGroups)};

          const step1 = form.querySelector('#step1-' + componentId);
          const step2 = form.querySelector('#step2-' + componentId);
          const step3 = form.querySelector('#step3-' + componentId);
          
          const dropZone = form.querySelector('.de-upload-v2-drop-zone');
          const fileInput = form.querySelector('#file-input-' + componentId);
          const cancelBtn = form.querySelector('#cancel-btn-' + componentId);
          const groupSelect = form.querySelector('#campaign-group-select-' + componentId);
          const targetSelect = form.querySelector('#upload-target-select-' + componentId);
          const targetContainer = form.querySelector('#upload-target-container-' + componentId);

          let currentFile;

          const showStep = (step) => {
            step1.style.display = 'none';
            step2.style.display = 'none';
            step3.style.display = 'none';
            step.style.display = 'block';
          };
          
          if (groupSelect && targetContainer) {
              groupSelect.addEventListener('change', () => {
                  const selectedGroupId = groupSelect.value;
                  const selectedGroup = campaignGroupsData.find(g => g.id === selectedGroupId);
                  if (selectedGroup && selectedGroup.uploadTargets) {
                      targetSelect.innerHTML = '<option value="" disabled selected>-- Escolha um destino --</option>';
                      selectedGroup.uploadTargets.forEach(target => {
                          const option = document.createElement('option');
                          option.value = target.deKey;
                          option.textContent = target.name;
                          targetSelect.appendChild(option);
                      });
                      targetContainer.style.display = 'block';
                  } else {
                       targetContainer.style.display = 'none';
                  }
              });
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
          fileInput.addEventListener('change', () => {
              if (fileInput.files.length) {
                  handleFileSelect(fileInput.files[0]);
              }
          });

          cancelBtn.addEventListener('click', () => {
              currentFile = null;
              fileInput.value = '';
              showStep(step1);
          });
          
          function detectDelimiter(header) {
              const commaCount = (header.match(/,/g) || []).length;
              const semicolonCount = (header.match(/;/g) || []).length;
              return semicolonCount > commaCount ? ';' : ',';
          }

          function handleFileSelect(file) {
              if (!file || !file.type.match('text/csv')) {
                  alert('Por favor, selecione um arquivo CSV.');
                  return;
              }
              currentFile = file;
              
              const reader = new FileReader();
              reader.onload = function(e) {
                  const text = e.target.result;
                  const lines = text.split('\\n').filter(l => l.trim() !== '');
                  const rowCount = lines.length > 0 ? lines.length - 1 : 0;
                  
                  const headerLine = lines[0] || '';
                  const delimiter = detectDelimiter(headerLine);
                  const headers = headerLine.split(delimiter).map(h => h.trim().replace(/"/g, ''));
                  
                  form.querySelector('.de-upload-v2-filename-confirm').textContent = file.name;
                  form.querySelector('#stat-rows-' + componentId).textContent = rowCount;
                  form.querySelector('#stat-cols-' + componentId).textContent = headers.length;
                  form.querySelector('#stat-size-' + componentId).textContent = (file.size / 1024).toFixed(2) + ' KB';
                  
                  const columnsList = form.querySelector('#columns-list-' + componentId);
                  columnsList.innerHTML = headers.map(h => \`<span class="de-upload-v2-column-tag">\${h}</span>\`).join('');

                  showStep(step2);
              };
              reader.readAsText(file);
          }

          form.addEventListener('submit', async function(e) {
              e.preventDefault();
              
              let selectedDeKey;
              if (campaignGroupsData.length === 1 && campaignGroupsData[0].uploadTargets.length === 1) {
                  selectedDeKey = campaignGroupsData[0].uploadTargets[0].deKey;
              } else {
                  selectedDeKey = targetSelect ? targetSelect.value : null;
              }

              if (!selectedDeKey) {
                  alert('Por favor, selecione um destino para o arquivo.');
                  return;
              }
              if (!currentFile) {
                  alert('Por favor, selecione um arquivo.');
                  return;
              }
              
              showStep(step3);
              const statusEl = form.querySelector('.de-upload-v2-status');
              const progressBar = form.querySelector('.de-upload-v2-progress-bar');
              const submitBtn = step2.querySelector('button[type="submit"]');
              submitBtn.disabled = true;

              statusEl.className = 'de-upload-v2-status info';
              statusEl.textContent = 'Lendo arquivo...';

              const reader = new FileReader();
              reader.readAsText(currentFile);

              reader.onload = async () => {
                try {
                  statusEl.textContent = 'Enviando dados...';
                  progressBar.style.width = '50%';
                  const csvData = reader.result;
                  const response = await fetch('/api/sfmc-upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ csvData, deKey: selectedDeKey, brandId: '${brandId}' }),
                  });
                  
                  const result = await response.json();
                  if (!response.ok) throw new Error(result.message || 'Erro no servidor.');

                  progressBar.style.width = '100%';
                  statusEl.className = 'de-upload-v2-status success';
                  statusEl.textContent = result.message || 'Sucesso!';

                  setTimeout(() => {
                      showStep(step1);
                      submitBtn.disabled = false;
                      currentFile = null;
                      fileInput.value = '';
                  }, 3000);
                
                } catch (error) {
                    statusEl.className = 'de-upload-v2-status error';
                    statusEl.textContent = 'Erro: ' + error.message;
                    submitBtn.disabled = false; // Allow retry
                }
              };

               reader.onerror = () => {
                 statusEl.className = 'de-upload-v2-status error';
                 statusEl.textContent = 'Erro ao ler o arquivo.';
                 submitBtn.disabled = false;
              };
          });
      })();
      </script>
    `;
}
