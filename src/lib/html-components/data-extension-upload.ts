
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
                  <div class="de-upload-v2-columns-container" id="mapping-container-${componentId}">
                      <h5>Mapeamento de Colunas</h5>
                      <div id="mapping-table-${componentId}"></div>
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
                   <div class="de-upload-v2-actions">
                      <button type="button" id="back-to-start-btn-${componentId}" class="custom-button custom-button--outline" style="display: none;">Voltar ao Início</button>
                   </div>
              </div>
          </form>
      </div>
      <script>
      (function() {
          const form = document.getElementById('${formId}');
          if (!form) return;
          const componentId = '${componentId}';
          const brandId = '${brandId}';
          const apiBaseUrl = '${baseUrl}';
          const campaignGroupsData = ${JSON.stringify(campaignGroups)};
          const CHUNK_SIZE = 2000;

          const step1 = form.querySelector('#step1-' + componentId);
          const step2 = form.querySelector('#step2-' + componentId);
          const step3 = form.querySelector('#step3-' + componentId);
          
          const dropZone = form.querySelector('.de-upload-v2-drop-zone');
          const fileInput = form.querySelector('#file-input-' + componentId);
          const cancelBtn = form.querySelector('#cancel-btn-' + componentId);
          const backToStartBtn = form.querySelector('#back-to-start-btn-' + componentId);
          const groupSelect = form.querySelector('#campaign-group-select-' + componentId);
          const targetSelect = form.querySelector('#upload-target-select-' + componentId);
          const targetContainer = form.querySelector('#upload-target-container-' + componentId);
          const mappingContainer = form.querySelector('#mapping-container-' + componentId);
          const mappingTable = form.querySelector('#mapping-table-' + componentId);

          let currentFile;
          let csvHeaders = [];
          let allRecords = [];

          function showStep(step) {
            step1.style.display = 'none';
            step2.style.display = 'none';
            step3.style.display = 'none';
            step.style.display = 'block';
          };
          
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

          function resetAll() {
              currentFile = null;
              csvHeaders = [];
              allRecords = [];
              fileInput.value = '';
              if (groupSelect) groupSelect.value = '';
              if (targetSelect) targetSelect.innerHTML = '';
              if (targetContainer) targetContainer.style.display = 'none';
              backToStartBtn.style.display = 'none';
              showStep(step1);
          }
          cancelBtn.addEventListener('click', resetAll);
          backToStartBtn.addEventListener('click', resetAll);
          
          function detectDelimiter(header) {
              const commaCount = (header.match(/,/g) || []).length;
              const semicolonCount = (header.match(/;/g) || []).length;
              return semicolonCount > commaCount ? ';' : ',';
          }

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

          function renderMappingUI(target) {
              if (!target || !target.columns || target.columns.length === 0) {
                  mappingContainer.style.display = 'none';
                  return;
              }
              mappingContainer.style.display = 'block';

              const optionsHtml = csvHeaders.map(h => \`<option value="\${h}">\${h}</option>\`).join('');
              
              mappingTable.innerHTML = \`
                <table class="de-upload-v2-mapping-table">
                    <thead>
                        <tr><th>Coluna na Data Extension</th><th>Coluna no seu Arquivo</th></tr>
                    </thead>
                    <tbody>
                        \${target.columns.map(col => \`
                            <tr>
                                <td>\${col.name} \${col.isPrimaryKey ? '<strong>(PK)</strong>' : ''}</td>
                                <td>
                                    <select class="de-upload-v2-select" data-de-column="\${col.name}">
                                        <option value="">-- Ignorar --</option>
                                        \${optionsHtml}
                                    </select>
                                </td>
                            </tr>
                        \`).join('')}
                    </tbody>
                </table>
              \`;

              target.columns.forEach(col => {
                  const select = mappingTable.querySelector(\`select[data-de-column="\${col.name}"]\`);
                  if (select && csvHeaders.includes(col.name)) {
                      select.value = col.name;
                  }
              });
          }

          function parseCsv(text) {
              const lines = text.split('\\n').filter(l => l.trim() !== '');
              if (lines.length < 1) return { headers: [], records: [] };
              
              const delimiter = detectDelimiter(lines[0]);
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
              if (!file || !file.type.match('text/csv')) {
                  alert('Por favor, selecione um arquivo CSV.');
                  return;
              }
              currentFile = file;
              
              const reader = new FileReader();
              reader.onload = function(e) {
                  const { headers, records } = parseCsv(e.target.result);
                  csvHeaders = headers;
                  allRecords = records;
                  
                  form.querySelector('.de-upload-v2-filename-confirm').textContent = file.name;
                  form.querySelector('#stat-rows-' + componentId).textContent = allRecords.length;
                  form.querySelector('#stat-cols-' + componentId).textContent = csvHeaders.length;
                  form.querySelector('#stat-size-' + componentId).textContent = (file.size / 1024).toFixed(2) + ' KB';
                  
                  const selectedTarget = getSelectedTarget();
                  renderMappingUI(selectedTarget);
                  
                  showStep(step2);
              };
              reader.readAsText(file);
          }
          
          if(targetSelect) {
              targetSelect.addEventListener('change', () => {
                  const selectedTarget = getSelectedTarget();
                  renderMappingUI(selectedTarget);
              });
          }

          form.addEventListener('submit', async function(e) {
              e.preventDefault();
              
              const selectedTarget = getSelectedTarget();
              if (!selectedTarget || !selectedTarget.deKey) { alert('Por favor, selecione um destino para o arquivo.'); return; }
              if (allRecords.length === 0) { alert('O arquivo está vazio ou não pôde ser lido.'); return; }
              
              const columnMapping = {};
              if (mappingTable && mappingContainer.style.display !== 'none') {
                  mappingTable.querySelectorAll('select').forEach(select => {
                      if (select.value) columnMapping[select.dataset.deColumn] = select.value;
                  });
              }
              
              showStep(step3);
              const statusEl = form.querySelector('.de-upload-v2-status');
              const progressBar = form.querySelector('.de-upload-v2-progress-bar');
              
              let totalProcessed = 0;
              const totalBatches = Math.ceil(allRecords.length / CHUNK_SIZE);
              
              const functions = firebase.app().functions('us-central1');
              const proxySfmcUpload = functions.httpsCallable('proxySfmcUpload');

              for (let i = 0; i < allRecords.length; i += CHUNK_SIZE) {
                  const chunk = allRecords.slice(i, i + CHUNK_SIZE);
                  const batchNum = (i / CHUNK_SIZE) + 1;
                  
                  statusEl.className = 'de-upload-v2-status info';
                  statusEl.textContent = \`Processando lote \${batchNum} de \${totalBatches} (\${chunk.length} registros)...\`;
                  
                  try {
                      const result = await proxySfmcUpload({
                          records: chunk, 
                          deKey: selectedTarget.deKey, 
                          brandId: brandId,
                          columnMapping: columnMapping
                      });

                      if (!result.data.success) {
                          throw new Error(result.data.message || 'Erro retornado pela API de proxy.');
                      }

                      totalProcessed += chunk.length;
                      const progressPercent = (totalProcessed / allRecords.length) * 100;
                      progressBar.style.width = progressPercent + '%';

                  } catch (error) {
                      console.error('Proxy Upload Error:', error);
                      statusEl.className = 'de-upload-v2-status error';
                      statusEl.textContent = 'Erro no lote ' + batchNum + ': ' + error.message;
                      backToStartBtn.style.display = 'block';
                      return; // Stop processing on error
                  }
              }

              statusEl.className = 'de-upload-v2-status success';
              statusEl.textContent = \`Sucesso! \${totalProcessed} registros foram processados em \${totalBatches} lotes.\`;
              backToStartBtn.style.display = 'block';
          });
      })();
      </script>
    `;
}
