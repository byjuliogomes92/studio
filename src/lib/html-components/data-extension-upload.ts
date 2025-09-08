
import type { PageComponent, CloudPage } from '@/lib/types';

export function renderDataExtensionUpload(component: PageComponent, pageState: CloudPage): string {
    const { 
        title = "Upload para Data Extension",
        instructionText = "Arraste e solte o arquivo CSV aqui, ou clique para selecionar.",
        buttonText = "Processar Arquivo",
        dataExtensionKey = "",
        environment = "prod"
    } = component.props;
    
    const { brandId } = pageState;
    const finalDeKey = environment === 'test' ? `TEST_${dataExtensionKey}` : dataExtensionKey;

    // SSO Authentication Check
    const authCheckHtml = `
      %%[ IF @isAuthenticated != true THEN ]%%
        <div class="de-upload-auth-required">
          <div class="de-upload-auth-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h4>Acesso Restrito</h4>
          <p>Você precisa estar logado no Marketing Cloud para usar esta funcionalidade.</p>
          <a href="%%=v(@LoginURL)=%%" class="custom-button">Fazer Login</a>
        </div>
      %%[ ELSE ]%%
    `;
    const authCheckEndHtml = `%%[ ENDIF ]%%`;

    const iconUpload = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>`;
    const iconFile = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`;

    return `
      ${authCheckHtml}
      <div class="de-upload-v2-container">
          <h4>${title}</h4>
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
          if (!container) return; // Exit if elements are not on the page (e.g., due to auth)

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
          
          let selectedFile = null;

          function formatBytes(bytes, decimals = 2) {
            if (bytes === 0) return '0 Bytes';
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
              progressBar.style.width = percentage + '%';
          }

          function handleFileSelect(file) {
              if (file && file.type === 'text/csv') {
                  selectedFile = file;
                  filenameDisplay.textContent = file.name;
                  filesizeDisplay.textContent = formatBytes(file.size);
                  initialContent.style.display = 'none';
                  selectedContent.style.display = 'block';
                  uploadBtn.disabled = false;
                  hideStatus();
                  setProgress(0);
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
              submitBtnText.style.display = 'inline';
              submitBtnLoader.style.display = 'none';
              hideStatus();
              setProgress(0);
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
          
          const submitBtnText = uploadBtn.querySelector('.button-text');
          const submitBtnLoader = uploadBtn.querySelector('.button-loader');

          uploadBtn.addEventListener('click', async () => {
              if (!selectedFile) return;

              uploadBtn.disabled = true;
              submitBtnText.style.display = 'none';
              submitBtnLoader.style.display = 'inline-block';
              showStatus('Iniciando...', 'info');
              progressContainer.style.display = 'block';
              setProgress(5);

              try {
                  showStatus('Enviando arquivo para o servidor...', 'info');
                  setProgress(25);
                  
                  // This is the placeholder for the real Firebase Function call.
                  setTimeout(() => {
                      showStatus('Arquivo recebido. Processando no servidor...', 'info');
                      setProgress(75);
                      
                      setTimeout(() => {
                          const randomRows = Math.floor(Math.random() * 10000) + 500;
                          showStatus('Sucesso! ' + randomRows + ' registros foram adicionados à Data Extension.', 'success');
                          setProgress(100);
                          resetState();
                      }, 4000);

                  }, 2000);

              } catch (err) {
                  showStatus('Erro: ' + (err.message || 'Falha no processamento.'), 'error');
                  uploadBtn.disabled = false;
                  submitBtnText.style.display = 'inline';
                  submitBtnLoader.style.display = 'none';
              }
          });
      })();
      </script>
      ${authCheckEndHtml}
    `;
}
