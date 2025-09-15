
import type { PageComponent, CloudPage, CampaignGroup, UploadTarget } from '@/lib/types';

export function renderDataExtensionUpload(component: PageComponent, pageState: CloudPage, baseUrl: string): string {
    const { 
        title = "Upload para Data Extension",
        instructionText = "Arraste e solte o arquivo CSV aqui, ou clique para selecionar.",
        campaignGroups = [],
        buttonProps = {}
    } = component.props;
    
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
            <select name="deKey" id="upload-target-select-${componentId}" class="de-upload-v2-select"></select>
        </div>
    ` : (campaignGroups.length === 1 && campaignGroups[0].uploadTargets.length > 1 ? `
        <div class="de-upload-v2-campaign-selector">
            <label for="upload-target-select-${componentId}">1. Selecione o destino do arquivo:</label>
            <select name="deKey" id="upload-target-select-${componentId}" class="de-upload-v2-select">
                <option value="" disabled selected>-- Escolha uma opção --</option>
                ${campaignGroups[0].uploadTargets.map((target: UploadTarget) => `<option value="${target.deKey}">${target.name}</option>`).join('')}
            </select>
        </div>
    ` : `<input type="hidden" name="deKey" value="${campaignGroups[0]?.uploadTargets[0]?.deKey || ''}">`);
    
    const lucideIconSvgs: Record<string, string> = {
        none: '',
        send: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    };
    
    const iconHtml = buttonIcon && lucideIconSvgs[buttonIcon] ? lucideIconSvgs[buttonIcon] : '';
    const buttonContent = `${iconHtml}<span>${buttonText}</span>`;

    return `
      <div class="de-upload-v2-container">
          <form id="${formId}" method="POST" action="%%=RequestParameter('PAGEURL')=%%">
            <input type="hidden" name="__is_de_upload_submission" value="true">
            <input type="hidden" id="json-payload-${componentId}" name="jsonData">
            
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
                <div class="de-upload-v2-actions">
                    <button type="button" id="cancel-btn-${componentId}" class="custom-button custom-button--outline">Trocar Arquivo</button>
                    <button type="submit" id="submit-btn-${componentId}" class="custom-button" style="background-color: ${buttonBgColor}; color: ${buttonTextColor};">${buttonContent}</button>
                </div>
            </div>
          </form>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/papaparse@5.3.0/papaparse.min.js"></script>
      <script>
      (function() {
          const container = document.querySelector('#${formId}');
          if (!container) return;
          const componentId = '${componentId}';
          const campaignGroupsData = ${JSON.stringify(campaignGroups)};

          const step1 = container.querySelector('#step1-' + componentId);
          const step2 = container.querySelector('#step2-' + componentId);
          
          const dropZone = container.querySelector('.de-upload-v2-drop-zone');
          const fileInput = container.querySelector('#file-input-' + componentId);
          const jsonPayloadInput = container.querySelector('#json-payload-' + componentId);
          const submitBtn = container.querySelector('#submit-btn-' + componentId);
          const cancelBtn = container.querySelector('#cancel-btn-' + componentId);

          const groupSelect = container.querySelector('#campaign-group-select-' + componentId);
          const targetSelect = container.querySelector('#upload-target-select-' + componentId);
          const targetContainer = container.querySelector('#upload-target-container-' + componentId);

          let currentFile;

          function showStep(step) {
            [step1, step2].forEach(s => s.style.display = 'none');
            step.style.display = 'block';
          };
          
          function updateTargetOptions(targets) {
              targetSelect.innerHTML = '<option value="" disabled selected>-- Escolha um destino --</option>';
              targets.forEach(target => {
                  const option = document.createElement('option');
                  option.value = target.deKey;
                  option.textContent = target.name;
                  targetSelect.appendChild(option);
              });
              if (targetContainer) targetContainer.style.display = 'block';
          }
          
          if (groupSelect) {
              groupSelect.addEventListener('change', () => {
                  const selectedGroupId = groupSelect.value;
                  const selectedGroup = campaignGroupsData.find(g => g.id === selectedGroupId);
                  if (selectedGroup && selectedGroup.uploadTargets) {
                      updateTargetOptions(selectedGroup.uploadTargets);
                  } else if (targetContainer) {
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
              fileInput.value = '';
              if (groupSelect) groupSelect.value = '';
              if (targetSelect) targetSelect.innerHTML = '';
              if (targetContainer) targetContainer.style.display = 'none';
              showStep(step1);
          }
          cancelBtn.addEventListener('click', resetAll);
          
          function handleFileSelect(file) {
              if (!file || !(file.type.match('text/csv') || file.name.endsWith('.csv'))) {
                  alert('Por favor, selecione um arquivo CSV.');
                  return;
              }
              currentFile = file;
              
              Papa.parse(file, {
                  header: true,
                  skipEmptyLines: true,
                  complete: function(results) {
                      jsonPayloadInput.value = JSON.stringify(results.data);
                      
                      container.querySelector('#stat-rows-' + componentId).textContent = results.data.length;
                      container.querySelector('#stat-cols-' + componentId).textContent = results.meta.fields.length;
                      container.querySelector('#stat-size-' + componentId).textContent = (file.size / 1024).toFixed(2) + ' KB';
                      container.querySelector('.de-upload-v2-filename-confirm').textContent = file.name;
                      
                      showStep(step2);
                  },
                  error: function(err) {
                      alert("Erro ao processar o CSV: " + err.message);
                      resetAll();
                  }
              });
          }

          container.addEventListener('submit', function(e) {
              if (submitBtn) {
                  submitBtn.disabled = true;
                  submitBtn.innerHTML = 'Enviando...';
              }
          });
      })();
      </script>
    `;
}
