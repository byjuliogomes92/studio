
import type { PageComponent, CloudPage, CampaignOption } from '@/lib/types';

export function renderDataExtensionUpload(component: PageComponent, pageState: CloudPage): string {
    const { 
        title = "Upload para Data Extension",
        instructionText = "Arraste e solte o arquivo CSV aqui, ou clique para selecionar.",
        campaigns = [],
        buttonProps = {}
    } = component.props;
    
    const { brandId } = pageState;
    const formId = `ftp-upload-form-${component.id}`; // Reusing ftp class names for style consistency

    const {
        text: buttonText = "Processar Arquivo",
        bgColor: buttonBgColor = "var(--theme-color, #3b82f6)",
        textColor: buttonTextColor = "#FFFFFF",
        icon: buttonIcon = "send",
        iconPosition: buttonIconPosition = "left"
    } = buttonProps;
    
    const campaignOptionsHtml = campaigns.map((campaign: CampaignOption) => 
        `<option value="${campaign.deKey}">${campaign.name}</option>`
    ).join('');

    const campaignSelectorHtml = campaigns.length > 1 ? `
        <div class="ftp-upload-group">
            <label for="campaign-select-${component.id}">Selecione a campanha de destino:</label>
            <select id="campaign-select-${component.id}" class="ftp-upload-select">
                <option value="" disabled selected>-- Escolha uma opção --</option>
                ${campaignOptionsHtml}
            </select>
        </div>
    ` : '';

    const lucideIconSvgs: Record<string, string> = {
        none: '',
        send: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    };
    
    const iconHtml = buttonIcon && lucideIconSvgs[buttonIcon] ? lucideIconSvgs[buttonIcon] : '';
    const buttonContent = buttonIconPosition === 'right'
        ? `<span>${buttonText}</span>${iconHtml}`
        : `${iconHtml}<span>${buttonText}</span>`;

    return `
      <div class="ftp-upload-container">
          <form id="${formId}" class="ftp-upload-form">
              <div class="ftp-upload-header">
                  <h4>${title}</h4>
              </div>
              
              ${campaignSelectorHtml}

              <div class="ftp-upload-group">
                <label for="file-input-${component.id}" class="ftp-upload-drop-area">
                    <div class="ftp-upload-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    </div>
                    <p class="ftp-upload-instruction">${instructionText}</p>
                    <input type="file" id="file-input-${component.id}" name="file" accept=".csv, text/csv" required>
                    <span class="ftp-upload-filename"></span>
                </label>
              </div>

              <div class="ftp-upload-footer">
                  <div class="ftp-upload-status"></div>
                   <div class="ftp-upload-progress-wrapper">
                        <div class="ftp-upload-progress-bar"></div>
                    </div>
                  <button type="submit" class="custom-button" style="background-color: ${buttonBgColor}; color: ${buttonTextColor};">
                      ${buttonContent}
                  </button>
              </div>
          </form>
      </div>
      <script>
      (function() {
          const form = document.getElementById('${formId}');
          if (!form) return;

          const dropArea = form.querySelector('.ftp-upload-drop-area');
          const fileInput = form.querySelector('#file-input-${component.id}');
          const fileNameDisplay = form.querySelector('.ftp-upload-filename');
          const statusEl = form.querySelector('.ftp-upload-status');
          const progressWrapper = form.querySelector('.ftp-upload-progress-wrapper');
          const progressBar = form.querySelector('.ftp-upload-progress-bar');
          const submitBtn = form.querySelector('button[type="submit"]');
          const campaignSelect = form.querySelector('#campaign-select-${component.id}');

          const setActive = (active) => dropArea.classList.toggle('active', active);
          dropArea.addEventListener('dragenter', (e) => { e.preventDefault(); setActive(true); });
          dropArea.addEventListener('dragover', (e) => { e.preventDefault(); setActive(true); });
          dropArea.addEventListener('dragleave', (e) => { e.preventDefault(); setActive(false); });
          dropArea.addEventListener('drop', (e) => {
              e.preventDefault();
              setActive(false);
              if (e.dataTransfer.files.length) {
                  fileInput.files = e.dataTransfer.files;
                  updateFileName(fileInput.files[0]);
              }
          });

          fileInput.addEventListener('change', () => {
              if (fileInput.files.length) {
                  updateFileName(fileInput.files[0]);
              }
          });

          function updateFileName(file) {
              if (file) {
                  fileNameDisplay.textContent = file.name;
              }
          }

          form.addEventListener('submit', async function(e) {
              e.preventDefault();

              const selectedDeKey = campaignSelect ? campaignSelect.value : ('${campaigns.length > 0 ? campaigns[0].deKey : ''}');

              if (!selectedDeKey) {
                  statusEl.textContent = 'Por favor, selecione uma campanha.';
                  statusEl.style.color = 'red';
                  return;
              }
              if (!fileInput.files || fileInput.files.length === 0) {
                  statusEl.textContent = 'Por favor, selecione um arquivo.';
                  statusEl.style.color = 'red';
                  return;
              }

              statusEl.textContent = 'Enviando...';
              statusEl.style.color = 'inherit';
              submitBtn.disabled = true;
              progressWrapper.style.display = 'block';
              progressBar.style.width = '0%';

              const reader = new FileReader();
              reader.readAsText(fileInput.files[0]);

              reader.onload = async () => {
                try {
                  const csvData = reader.result;
                  const response = await fetch('/api/sfmc-upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ csvData, deKey: selectedDeKey, brandId: '${brandId}' }),
                  });
                  
                  const result = await response.json();
                  if (!response.ok) throw new Error(result.message || 'Erro no servidor.');

                  progressBar.style.width = '100%';
                  statusEl.textContent = result.message || 'Sucesso!';
                  statusEl.style.color = 'green';
                  form.reset();
                  fileNameDisplay.textContent = '';
                
                } catch (error) {
                    statusEl.textContent = 'Erro: ' + error.message;
                    statusEl.style.color = 'red';
                } finally {
                    submitBtn.disabled = false;
                }
              };
               reader.onerror = () => {
                 statusEl.textContent = 'Erro ao ler o arquivo.';
                 statusEl.style.color = 'red';
                 submitBtn.disabled = false;
              };
          });
      })();
      </script>
    `;
}
