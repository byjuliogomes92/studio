
import type { PageComponent } from '@/lib/types';

export function renderDataExtensionUpload(component: PageComponent): string {
    const { 
        title = "Upload de Arquivo (V2)",
        instructionText = "Arraste e solte o arquivo CSV aqui, ou clique para selecionar.",
        buttonText = "Processar Arquivo",
        dataExtensionKey = "",
        restBaseUrl = ""
    } = component.props;

    const formId = `de-upload-form-${component.id}`;

    return `
      <div class="de-upload-v2-container">
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
              showStatus('Iniciando upload...', 'info');
              progressContainer.style.display = 'block';
              progressBar.style.width = '0%';
              
              // This would ideally use Firebase SDK to get a signed URL
              // For now, we simulate calling a function that would do that.
              try {
                  // 1. Get Signed URL from a (hypothetical) Cloud Function or API endpoint
                  // const signedUrlResponse = await fetch('/api/get-upload-url', { method: 'POST', body: JSON.stringify({ filename: selectedFile.name, contentType: selectedFile.type }) });
                  // const { uploadUrl, fileId } = await signedUrlResponse.json();

                  // For prototype, we'll skip to calling the processing function
                  // In a real implementation, you'd upload to the signedUrl first.

                  // 2. Call the processing Cloud Function
                  showStatus('Arquivo enviado. Processando no servidor...', 'info');
                  
                  // This is a placeholder for a real API call.
                  // We can't actually call a cloud function from here, but this simulates the flow.
                  const processResponse = await new Promise(resolve => setTimeout(() => {
                    resolve({ ok: true, json: () => Promise.resolve({ success: true, message: 'Dados processados com sucesso!', rowsAdded: 1234 }) })
                  }, 3000));
                  
                  progressBar.style.width = '100%';

                  if (processResponse.ok) {
                      const result = await processResponse.json();
                      showStatus(result.message, 'success');
                  } else {
                      const error = await processResponse.json();
                      throw new Error(error.message || 'Falha no processamento do arquivo.');
                  }

              } catch (err) {
                  showStatus('Erro: ' + err.message, 'error');
              } finally {
                  // Re-enable button after a delay to show status
                  setTimeout(() => {
                      uploadBtn.disabled = false;
                      progressContainer.style.display = 'none';
                  }, 5000);
              }
          });

      })();
      </script>
    `;
}
