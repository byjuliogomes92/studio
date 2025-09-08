
import type { PageComponent, CloudPage } from '@/lib/types';

export function renderDataExtensionUpload(component: PageComponent, pageState: CloudPage): string {
    const { 
        title = "Upload para Data Extension (V2)",
        instructionText = "Arraste e solte o arquivo CSV aqui, ou clique para selecionar.",
        buttonText = "Processar Arquivo",
        dataExtensionKey = "",
        environment = "prod" // 'prod' or 'test'
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

    return `
      ${authCheckHtml}
      <div class="de-upload-v2-container">
          <h4>${title}</h4>
          <div id="drop-zone-${component.id}" class="de-upload-v2-drop-zone">
              <div class="de-upload-v2-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              </div>
              <p>${instructionText}</p>
              <input type="file" id="file-input-${component.id}" accept=".csv" style="display:none;" />
              <span id="filename-display-${component.id}" class="de-upload-v2-filename"></span>
          </div>
          <div id="progress-container-${component.id}" class="de-upload-v2-progress-container" style="display:none;">
              <div id="progress-bar-${component.id}" class="de-upload-v2-progress-bar"></div>
          </div>
          <div id="status-message-${component.id}" class="de-upload-v2-status"></div>
          <button id="upload-btn-${component.id}" class="custom-button" disabled>${buttonText}</button>
      </div>

      <script>
      (function() {
          const dropZone = document.getElementById('drop-zone-${component.id}');
          const fileInput = document.getElementById('file-input-${component.id}');
          const filenameDisplay = document.getElementById('filename-display-${component.id}');
          const uploadBtn = document.getElementById('upload-btn-${component.id}');
          const progressContainer = document.getElementById('progress-container-${component.id}');
          const progressBar = document.getElementById('progress-bar-${component.id}');
          const statusMessage = document.getElementById('status-message-${component.id}');
          const deKey = "${finalDeKey}";
          const restBaseUrl = "${pageState.brand?.integrations?.sfmcApi?.authBaseUrl || ''}";
          const brandId = "${brandId}";

          let selectedFile = null;

          function showStatus(message, type) {
              statusMessage.textContent = message;
              statusMessage.className = 'de-upload-v2-status ' + type;
          }

          function handleFileSelect(file) {
              if (file && file.type === 'text/csv') {
                  selectedFile = file;
                  filenameDisplay.textContent = file.name;
                  uploadBtn.disabled = false;
                  showStatus('', 'info');
              } else {
                  selectedFile = null;
                  filenameDisplay.textContent = '';
                  uploadBtn.disabled = true;
                  showStatus('Por favor, selecione um arquivo .csv', 'error');
              }
          }
          
          if (!dropZone || !fileInput) return; // Exit if not authenticated and elements don't exist

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

              uploadBtn.disabled = true;
              showStatus('Iniciando...', 'info');
              progressContainer.style.display = 'block';
              progressBar.style.width = '0%';
              
              // This is a placeholder for a real API call.
              // In a real app, you would call a Firebase Function to get a signed URL,
              // upload the file there, and then call another function to process it.
              // This simulation shows the user feedback loop.
              try {
                  showStatus('Enviando arquivo para o servidor...', 'info');
                  progressBar.style.width = '25%';

                  // Simulate calling a function that processes the file.
                  // The actual implementation would be in a Firebase Cloud Function.
                  // For the prototype, we use a placeholder that resolves after a delay.
                  setTimeout(() => {
                      showStatus('Arquivo recebido. Processando no servidor...', 'info');
                      progressBar.style.width = '75%';
                      
                      setTimeout(() => {
                          const randomRows = Math.floor(Math.random() * 10000) + 500;
                          showStatus('Sucesso! ' + randomRows + ' registros foram adicionados à Data Extension.', 'success');
                          progressBar.style.width = '100%';
                          uploadBtn.disabled = false;
                          selectedFile = null;
                          filenameDisplay.textContent = '';
                      }, 4000);

                  }, 2000);

              } catch (err) {
                  showStatus('Erro: ' + err.message, 'error');
                  uploadBtn.disabled = false;
              }
          });
      })();
      </script>
      ${authCheckEndHtml}
    `;
}
