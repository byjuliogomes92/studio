
import type { PageComponent, CloudPage, CampaignGroup, UploadTarget } from '@/lib/types';

export function renderDataExtensionUpload(component: PageComponent, pageState: CloudPage, baseUrl: string): string {
    const { 
        title = "Upload para Data Extension",
        instructionText = "Arraste e solte o arquivo CSV aqui, ou clique para selecionar.",
        campaignGroups = [],
        buttonProps = {}
    } = component.props;
    
    const componentId = component.id;

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
          
          <form id="hidden-form-${componentId}" method="POST" action="%%=RequestParameter('PAGEURL')=%%" style="display:none;">
              <input type="hidden" name="__deKey" value="">
              <input type="hidden" name="__records" value="">
              <input type="hidden" name="__isDEUpload" value="true">
          </form>

      </div>
      <script>
      (function() {
          const container = document.querySelector('#${component.id}');
          if (!container) return;
          const componentId = '${componentId}';
          const campaignGroupsData = ${JSON.stringify(campaignGroups)};
          
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

          function parseCsv(text, callback) {
              const lines = text.split(/\\r\\n|\\n/).filter(l => l.trim() !== '');
              if (lines.length < 1) {
                callback([]);
                return;
              }
              
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
              callback(records);
          }

          function handleFileSelect(file) {
              if (!file || !(file.type.match('text/csv') || file.name.endsWith('.csv'))) {
                  alert('Por favor, selecione um arquivo CSV.');
                  return;
              }
              currentFile = file;
              filenameDisplay.textContent = file.name;
              filenameDisplay.style.display = 'block';
          }
          
          function submitData() {
                const selectedTarget = getSelectedTarget();
                if (!selectedTarget || !selectedTarget.deKey) { alert('Por favor, selecione um destino para o arquivo.'); return; }
                if (!currentFile) { alert('Por favor, selecione um arquivo CSV válido.'); return; }

                statusContainer.style.display = 'block';
                statusEl.className = 'de-upload-v2-status info';
                statusEl.textContent = 'Aguarde, estamos processando seu arquivo...';
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    parseCsv(e.target.result, function(parsedRecords) {
                        if (parsedRecords.length > 0) {
                            hiddenForm.elements['__deKey'].value = selectedTarget.deKey;
                            hiddenForm.elements['__records'].value = JSON.stringify(parsedRecords);
                            hiddenForm.submit();
                        } else {
                            alert('O arquivo CSV parece estar vazio ou mal formatado.');
                        }
                    });
                };
                reader.readAsText(currentFile, 'ISO-8859-1');
          }

          if (groupSelect) {
              groupSelect.addEventListener('change', () => {
                  const selectedGroupId = groupSelect.value;
                  const selectedGroup = campaignGroupsData.find(g => g.id === selectedGroupId);
                  if (selectedGroup && selectedGroup.uploadTargets) {
                      targetContainer.style.display = 'block';
                      targetSelect.innerHTML = '<option value="" disabled selected>-- Escolha um destino --</option>';
                      selectedGroup.uploadTargets.forEach(target => {
                          const option = document.createElement('option');
                          option.value = target.id;
                          option.textContent = target.name;
                          targetSelect.appendChild(option);
                      });
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
          fileInput.addEventListener('change', () => { if (fileInput.files.length) { handleFileSelect(fileInput.files[0]); } });
          
          if(submitBtn) {
            submitBtn.addEventListener('click', submitData);
          }
          
          const urlParams = new URLSearchParams(window.location.search);
          const uploadStatus = urlParams.get('resultado');
          if (uploadStatus) {
              statusContainer.style.display = 'block';
              const msg = urlParams.get('mensagem');
              if (uploadStatus === 'success') {
                  statusEl.className = 'de-upload-v2-status success';
                  statusEl.textContent = '✅ ' + decodeURIComponent(msg);
              } else {
                  statusEl.className = 'de-upload-v2-status error';
                  statusEl.textContent = '❌ ' + decodeURIComponent(msg);
              }
          }
      })();
      </script>
    `;
}

    