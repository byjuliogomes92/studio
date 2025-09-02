
import type { PageComponent, CloudPage } from '@/lib/types';

export function renderFTPUpload(component: PageComponent, pageState: CloudPage): string {
    const { 
        title = "Upload de Arquivo para FTP",
        instructionText = "Arraste e solte o arquivo aqui, ou clique para selecionar.",
        destinationPath = "/Import",
        destinationFilename = "uploaded_file.csv",
        dataExtensionName = "",
        buttonProps = {}
    } = component.props;

    const { brandId } = pageState;
    const formId = `ftp-upload-form-${component.id}`;

    const {
        text: buttonText = "Enviar Arquivo",
        bgColor: buttonBgColor = "var(--theme-color)",
        textColor: buttonTextColor = "#FFFFFF",
        icon: buttonIcon = "none",
        iconPosition: buttonIconPosition = "left"
    } = buttonProps;
    
    const ampscriptBlock = `%%[
      VAR @finalFilename
      SET @finalFilename = Concat("${destinationFilename}")
    ]%%`;

    const lucideIconSvgs: Record<string, string> = {
        none: '',
        send: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
        'arrow-right': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
        'check-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
        'plus': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
        'download': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
        'star': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        'zap': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2z"/></svg>',
    };
    
    const iconHtml = buttonIcon && lucideIconSvgs[buttonIcon] ? lucideIconSvgs[buttonIcon] : '';
    const buttonContent = buttonIconPosition === 'right' 
        ? `<span>${buttonText}</span>${iconHtml}`
        : `${iconHtml}<span>${buttonText}</span>`;

    return `
        ${ampscriptBlock}
        <div class="ftp-upload-container">
            <form id="${formId}" class="ftp-upload-form">
                <input type="hidden" name="resolvedFilename" value="%%=v(@finalFilename)=%%">
                <div class="ftp-upload-header">
                    <h4>${title}</h4>
                    <p><strong>Destino:</strong> ${destinationPath}/%%=v(@finalFilename)=%%</p>
                    ${dataExtensionName ? `<p><strong>Data Extension Alvo:</strong> ${dataExtensionName}</p>` : ''}
                </div>

                <label for="file-input-${component.id}" class="ftp-upload-drop-area">
                    <div class="ftp-upload-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    </div>
                    <p class="ftp-upload-instruction">${instructionText}</p>
                    <input type="file" id="file-input-${component.id}" name="file" accept=".csv, text/csv" required>
                    <span class="ftp-upload-filename"></span>
                </label>

                <div class="ftp-upload-progress-wrapper">
                    <div class="ftp-upload-progress-bar"></div>
                </div>

                <div class="ftp-upload-footer">
                    <div class="ftp-upload-status"></div>
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
            const resolvedFilenameInput = form.querySelector('input[name="resolvedFilename"]');
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
                }
            }

            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                if (!fileInput.files || fileInput.files.length === 0) {
                    statusEl.textContent = 'Por favor, selecione um arquivo.';
                    statusEl.style.color = 'red';
                    return;
                }

                statusEl.textContent = 'Enviando...';
                statusEl.style.color = 'orange';
                submitBtn.disabled = true;
                progressWrapper.style.display = 'block';
                progressBar.style.width = '0%';

                const formData = new FormData();
                formData.append('file', fileInput.files[0]);
                formData.append('path', '${destinationPath}');
                formData.append('filename', resolvedFilenameInput.value);
                formData.append('brandId', '${brandId}');

                try {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', '/api/ftp-upload', true);

                    xhr.upload.onprogress = function(event) {
                        if (event.lengthComputable) {
                            const percentComplete = (event.loaded / event.total) * 100;
                            progressBar.style.width = percentComplete + '%';
                        }
                    };

                    xhr.onload = function() {
                        const result = JSON.parse(xhr.responseText);
                        if (xhr.status >= 200 && xhr.status < 300) {
                            statusEl.textContent = result.message || 'Arquivo enviado com sucesso!';
                            statusEl.style.color = 'green';
                            form.reset();
                            fileNameDisplay.textContent = '';
                            setTimeout(() => { progressWrapper.style.display = 'none'; progressBar.style.width = '0%'; }, 2000);
                        } else {
                            throw new Error(result.message || 'Falha no envio.');
                        }
                    };

                    xhr.onerror = function() {
                        throw new Error('Erro de rede ou de servidor.');
                    };
                    
                    xhr.send(formData);

                } catch (error) {
                    statusEl.textContent = 'Erro: ' + error.message;
                    statusEl.style.color = 'red';
                } finally {
                    submitBtn.disabled = false;
                }
            });
        })();
        </script>
    `;
}
