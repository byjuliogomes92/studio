
import type { PageComponent } from '@/lib/types';

export function renderDataExtensionUpload(component: PageComponent): string {
    const { 
        title = "Upload para Data Extension",
        instructionText = "Arraste e solte o arquivo CSV aqui, ou clique para selecionar.",
        dataExtensionKey = "",
        buttonText = "Processar Arquivo"
    } = component.props;

    const formId = `de-upload-form-${component.id}`;

    return `
        %%[ IF @showThanks != "true" THEN ]%%
        <div class="de-upload-container">
            <form id="${formId}" class="de-upload-form" method="post" action="%%=RequestParameter('PAGEURL')=%%">
                <input type="hidden" name="__isCsvUpload" value="true">
                <input type="hidden" name="__deKey" value="${dataExtensionKey}">
                <textarea name="userdata" style="display:none;"></textarea>

                <div class="de-upload-header">
                    <h4>${title}</h4>
                    <p><strong>Data Extension Alvo:</strong> ${dataExtensionKey}</p>
                </div>

                <label for="csv-file-input-${component.id}" class="de-upload-drop-area">
                    <div class="de-upload-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    </div>
                    <p class="de-upload-instruction">${instructionText}</p>
                    <input type="file" id="csv-file-input-${component.id}" accept=".csv, text/csv" required>
                    <span class="de-upload-filename"></span>
                </label>

                <div class="de-upload-progress-wrapper">
                    <div class="de-upload-progress-bar"></div>
                </div>

                 <div class="de-upload-footer">
                    <div class="de-upload-status"></div>
                    <button type="submit" class="custom-button">${buttonText}</button>
                </div>
            </form>
        </div>
        %%[ ELSE ]%%
            <div class="thank-you-message" style="text-align: center;">
                <h2>Upload Concluído!</h2>
                <p>Os dados do seu arquivo CSV foram enviados para processamento no Marketing Cloud.</p>
            </div>
        %%[ ENDIF ]%%

        <script>
        (function() {
            const form = document.getElementById('${formId}');
            if (!form) return;

            const fileInput = form.querySelector('#csv-file-input-${component.id}');
            const userdataTextarea = form.querySelector('textarea[name="userdata"]');
            const dropArea = form.querySelector('.de-upload-drop-area');
            const fileNameDisplay = form.querySelector('.de-upload-filename');
            const statusEl = form.querySelector('.de-upload-status');
            const progressWrapper = form.querySelector('.de-upload-progress-wrapper');
            const progressBar = form.querySelector('.de-upload-progress-bar');
            const submitBtn = form.querySelector('button[type="submit"]');

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
                    statusEl.textContent = '';
                }
            }

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const file = fileInput.files[0];
                if (!file) {
                    statusEl.textContent = 'Por favor, selecione um arquivo CSV.';
                    statusEl.style.color = 'red';
                    return;
                }

                submitBtn.disabled = true;
                statusEl.textContent = 'Processando arquivo...';
                statusEl.style.color = 'orange';

                const reader = new FileReader();
                reader.onload = function(event) {
                    const csv = event.target.result;
                    const lines = csv.split(/\\r\\n|\\n/);
                    const result = [];
                    const headers = lines[0].split(/,|;/).map(h => h.trim().replace(/^"|"$/g, ''));
                    for (let i = 1; i < lines.length; i++) {
                        if (!lines[i]) continue;
                        const obj = {};
                        const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)|;(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                        for (let j = 0; j < headers.length; j++) {
                            obj[headers[j]] = currentline[j] ? currentline[j].trim().replace(/^"|"$/g, '') : '';
                        }
                        result.push(obj);
                    }
                    
                    const jsonString = JSON.stringify(result);
                    
                    if (jsonString.length > 4000000) { // Check payload size
                        statusEl.textContent = 'Erro: Arquivo muito grande. O limite é de 4MB.';
                        statusEl.style.color = 'red';
                        submitBtn.disabled = false;
                        return;
                    }

                    userdataTextarea.value = jsonString;
                    
                    // Now submit the form to the CloudPage
                    statusEl.textContent = 'Enviando para o Marketing Cloud...';
                    form.submit();
                };
                
                reader.onerror = function() {
                    statusEl.textContent = 'Erro ao ler o arquivo.';
                    statusEl.style.color = 'red';
                    submitBtn.disabled = false;
                }

                reader.readAsText(file);
            });
        })();
        </script>
    `;
}
