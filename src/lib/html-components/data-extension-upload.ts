
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
                  <button type="button" id="submit-btn-${componentId}" class="custom-button" style="background-color: ${buttonBgColor}; color: ${buttonTextColor};">${buttonContent}</button>
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
      </div>
      <script>
      (function() {
          const container = document.querySelector('.de-upload-v2-container');
          if (!container) return;
          const componentId = '${componentId}';
          const brandId = '${brandId}';
          const campaignGroupsData = ${JSON.stringify(campaignGroups)};
          const CHUNK_SIZE = 2000;

          const step1 = document.getElementById('step1-' + componentId);
          const step2 = document.getElementById('step2-' + componentId);
          const step3 = document.getElementById('step3-' + componentId);
          
          const dropZone = container.querySelector('.de-upload-v2-drop-zone');
          const fileInput = container.querySelector('#file-input-' + componentId);
          const submitBtn = document.getElementById('submit-btn-' + componentId);
          const cancelBtn = document.getElementById('cancel-btn-' + componentId);
          const backToStartBtn = document.getElementById('back-to-start-btn-' + componentId);
          const groupSelect = document.getElementById('campaign-group-select-' + componentId);
          const targetSelect = document.getElementById('upload-target-select-' + componentId);
          const targetContainer = document.getElementById('upload-target-container-' + componentId);
          const mappingContainer = document.getElementById('mapping-container-' + componentId);
          const mappingTable = document.getElementById('mapping-table-' + componentId);

          let currentFile;
          let csvHeaders = [];
          let allRecords = [];

          function showStep(step) {
            [step1, step2, step3].forEach(s => s.style.display = 'none');
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

                const table = document.createElement('table');
                table.className = 'de-upload-v2-mapping-table';
                
                const thead = table.createTHead();
                const headerRow = thead.insertRow();
                ['Coluna na Data Extension', 'Coluna no seu Arquivo'].forEach(text => {
                    const th = document.createElement('th');
                    th.textContent = text;
                    headerRow.appendChild(th);
                });
                
                const tbody = table.createTBody();

                target.columns.forEach(col => {
                    const row = tbody.insertRow();
                    
                    const cell1 = row.insertCell();
                    cell1.innerHTML = col.name + (col.isPrimaryKey ? ' <strong>(PK)</strong>' : '');

                    const cell2 = row.insertCell();
                    const select = document.createElement('select');
                    select.className = 'de-upload-v2-select';
                    select.dataset.deColumn = col.name;

                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = '-- Ignorar --';
                    select.appendChild(defaultOption);

                    csvHeaders.forEach(h => {
                        const option = document.createElement('option');
                        option.value = h;
                        option.textContent = h;
                        select.appendChild(option);
                    });
                    
                    // Simple auto-mapping by name
                    if (csvHeaders.map(h => h.toLowerCase()).includes(col.name.toLowerCase())) {
                        const matchedHeader = csvHeaders.find(h => h.toLowerCase() === col.name.toLowerCase());
                        select.value = matchedHeader;
                    }

                    cell2.appendChild(select);
                });
                
                mappingTable.innerHTML = '';
                mappingTable.appendChild(table);
            }

          function parseCsv(text) {
              const lines = text.split(/\\r\\n|\\n/).filter(l => l.trim() !== '');
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
              if (!file || !(file.type.match('text/csv') || file.name.endsWith('.csv'))) {
                  alert('Por favor, selecione um arquivo CSV.');
                  return;
              }
              currentFile = file;
              
              const reader = new FileReader();
              reader.onload = function(e) {
                  const { headers, records } = parseCsv(e.target.result);
                  csvHeaders = headers;
                  allRecords = records;
                  
                  document.getElementById('stat-rows-' + componentId).textContent = allRecords.length;
                  document.getElementById('stat-cols-' + componentId).textContent = csvHeaders.length;
                  document.getElementById('stat-size-' + componentId).textContent = (file.size / 1024).toFixed(2) + ' KB';
                  
                  const selectedTarget = getSelectedTarget();
                  renderMappingUI(selectedTarget);
                  
                  showStep(step2);
              };
              reader.readAsText(file, 'ISO-8859-1');
          }
          
          if(targetSelect) {
              targetSelect.addEventListener('change', () => {
                  const selectedTarget = getSelectedTarget();
                  renderMappingUI(selectedTarget);
              });
          }

          submitBtn.addEventListener('click', async function(e) {
                e.preventDefault();

                const selectedTarget = getSelectedTarget();
                if (!selectedTarget || !selectedTarget.deKey) { alert('Por favor, selecione um destino para o arquivo.'); return; }
                if (allRecords.length === 0) { alert('O arquivo está vazio ou não pôde ser lido.'); return; }

                const columnMapping = {};
                if (mappingTable && mappingContainer.style.display !== 'none') {
                    mappingTable.querySelectorAll('select').forEach(select => {
                        if (select.value) {
                            columnMapping[select.dataset.deColumn] = select.value;
                        }
                    });
                }

                showStep(step3);
                const statusEl = container.querySelector('.de-upload-v2-status');
                const progressBar = container.querySelector('.de-upload-v2-progress-bar');
                
                let totalProcessed = 0;
                const totalBatches = Math.ceil(allRecords.length / CHUNK_SIZE);
                
                for (let i = 0; i < allRecords.length; i += CHUNK_SIZE) {
                    const chunk = allRecords.slice(i, i + CHUNK_SIZE);
                    const batchNum = (i / CHUNK_SIZE) + 1;
                    
                    statusEl.className = 'de-upload-v2-status info';
                    statusEl.textContent = 'Enviando lote ' + batchNum + ' de ' + totalBatches + '...';

                    const payload = {
                        records: chunk, 
                        deKey: selectedTarget.deKey, 
                        brandId: brandId,
                        columnMapping: columnMapping
                    };

                    const form = document.createElement('form');
                    form.method = 'post';
                    form.action = "%%=RequestParameter('PAGEURL')=%%";
                    form.style.display = 'none';

                    const payloadInput = document.createElement('input');
                    payloadInput.type = 'hidden';
                    payloadInput.name = '__de_upload_payload';
                    payloadInput.value = JSON.stringify(payload);
                    form.appendChild(payloadInput);

                    document.body.appendChild(form);

                    try {
                       form.submit();
                       // Since the page reloads, we just show a final message.
                       // A more advanced version would use fetch and handle responses.
                       totalProcessed += chunk.length;
                       const progressPercent = (totalProcessed / allRecords.length) * 100;
                       progressBar.style.width = progressPercent + '%';

                    } catch(error) {
                        console.error('Submission Error:', error);
                        statusEl.className = 'de-upload-v2-status error';
                        statusEl.textContent = 'Erro ao enviar lote ' + batchNum + ': ' + error.message;
                        backToStartBtn.style.display = 'block';
                        document.body.removeChild(form);
                        return; // Stop on error
                    }
                    
                    document.body.removeChild(form);
                }

                 // This part will only be reached if submission logic is changed to be async without reload.
                 statusEl.className = 'de-upload-v2-status success';
                 statusEl.textContent = 'Envio concluído! ' + totalProcessed + ' registros foram enviados.';
                 backToStartBtn.style.display = 'block';
            });
      })();
      </script>
    `;
}
