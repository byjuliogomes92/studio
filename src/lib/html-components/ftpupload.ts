
import type { PageComponent, CloudPage, CampaignGroup, UploadTarget } from '@/lib/types';

export function renderFTPUpload(component: PageComponent, pageState: CloudPage): string {
    const { 
        title = "Upload de Arquivo para FTP",
        instructionText = "Arraste e solte o arquivo ou clique para selecionar.",
        campaignGroups = [],
        buttonProps = {}
    } = component.props;

    const { brandId } = pageState;
    const formId = `ftp-upload-form-${component.id}`;
    const componentId = component.id;

    const {
        text: buttonText = "Enviar Arquivo",
        bgColor: buttonBgColor = "var(--theme-color)",
        textColor: buttonTextColor = "#FFFFFF",
        icon: buttonIcon = "none"
    } = buttonProps;

    const campaignGroupOptionsHtml = campaignGroups.map((group: CampaignGroup) => 
        `<option value="${group.id}">${group.name}</option>`
    ).join('');

    const campaignSelectorHtml = campaignGroups.length > 1 ? `
        <div class="ftp-upload-campaign-selector">
            <label for="campaign-group-select-${componentId}">1. Selecione a campanha:</label>
            <select id="campaign-group-select-${componentId}" class="ftp-upload-select">
                <option value="" disabled selected>-- Escolha uma opção --</option>
                ${campaignGroupOptionsHtml}
            </select>
        </div>
        <div class="ftp-upload-campaign-selector" id="upload-target-container-${componentId}" style="display: none;">
            <label for="upload-target-select-${componentId}">2. Selecione o destino do arquivo:</label>
            <select id="upload-target-select-${componentId}" class="ftp-upload-select"></select>
        </div>
    ` : (campaignGroups.length === 1 && campaignGroups[0].uploadTargets.length > 1 ? `
        <div class="ftp-upload-campaign-selector">
            <label for="upload-target-select-${componentId}">1. Selecione o destino do arquivo:</label>
            <select id="upload-target-select-${componentId}" class="ftp-upload-select">
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
        <div class="ftp-upload-container">
            <form id="${formId}" class="ftp-upload-form">
                <div class="ftp-upload-step" id="step1-${componentId}">
                    <h4>${title}</h4>
                    <p id="ftp-destination-info-${componentId}" class="ftp-destination-info"></p>
                    ${campaignSelectorHtml}
                    <label for="file-input-${componentId}" class="ftp-upload-drop-area">
                        <div class="ftp-upload-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                        </div>
                        <p class="ftp-upload-instruction">${instructionText}</p>
                        <input type="file" id="file-input-${componentId}" name="file" accept=".csv, text/csv" required style="display: none;">
                        <span class="ftp-upload-filename"></span>
                    </label>
                </div>

                <div class="ftp-upload-step" id="step2-${componentId}" style="display: none;">
                    <h4>Confirmar Envio</h4>
                    <div class="ftp-upload-file-info">
                        <p><strong>Arquivo:</strong> <span id="confirm-filename-${componentId}"></span></p>
                        <p><strong>Tamanho:</strong> <span id="confirm-filesize-${componentId}"></span></p>
                    </div>
                     <div class="ftp-upload-footer">
                        <button type="button" id="cancel-btn-${componentId}" class="custom-button custom-button--outline">Trocar Arquivo</button>
                        <button type="submit" class="custom-button" style="background-color: ${buttonBgColor}; color: ${buttonTextColor};">
                            ${buttonContent}
                        </button>
                    </div>
                </div>

                <div class="ftp-upload-progress-wrapper" style="display: none;">
                    <div class="ftp-upload-progress-bar"></div>
                </div>
                <div class="ftp-upload-status"></div>
            </form>
        </div>
        <script>
        (function() {
            const form = document.getElementById('${formId}');
            if (!form) return;
            const componentId = '${componentId}';
            const brandId = '${brandId}';
            const campaignGroupsData = ${JSON.stringify(campaignGroups)};

            const step1 = form.querySelector('#step1-' + componentId);
            const step2 = form.querySelector('#step2-' + componentId);
            const dropArea = form.querySelector('.ftp-upload-drop-area');
            const fileInput = form.querySelector('#file-input-' + componentId);
            const fileNameDisplay = form.querySelector('.ftp-upload-filename');
            const statusEl = form.querySelector('.ftp-upload-status');
            const progressWrapper = form.querySelector('.ftp-upload-progress-wrapper');
            const progressBar = form.querySelector('.ftp-upload-progress-bar');
            const submitBtn = form.querySelector('button[type="submit"]');
            const cancelBtn = form.querySelector('#cancel-btn-' + componentId);

            const groupSelect = form.querySelector('#campaign-group-select-' + componentId);
            const targetSelect = form.querySelector('#upload-target-select-' + componentId);
            const targetContainer = form.querySelector('#upload-target-container-' + componentId);
            const destinationInfo = form.querySelector('#ftp-destination-info-' + componentId);
            
            let currentFile = null;

            function showStep(stepNum) {
                step1.style.display = 'none';
                step2.style.display = 'none';
                if (stepNum === 1) step1.style.display = 'block';
                if (stepNum === 2) step2.style.display = 'block';
            }

            function updateDestinationInfo() {
                const selectedTarget = getSelectedTarget();
                if (selectedTarget && destinationInfo) {
                    const filename = selectedTarget.destinationFilename.replace('%%Date%%', new Date().toISOString().split('T')[0]);
                    destinationInfo.innerHTML = \`<strong>Destino:</strong> \${selectedTarget.destinationPath}/\${filename}\`;
                } else if (destinationInfo) {
                    destinationInfo.innerHTML = '';
                }
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
                    updateDestinationInfo();
                    if (selectedGroup && selectedGroup.uploadTargets) {
                        updateTargetOptions(selectedGroup.uploadTargets);
                    } else {
                        targetContainer.style.display = 'none';
                    }
                });
            } else if (campaignGroupsData.length === 1 && campaignGroupsData[0].uploadTargets.length > 1) {
                updateTargetOptions(campaignGroupsData[0].uploadTargets);
            }

            if (targetSelect) {
                targetSelect.addEventListener('change', updateDestinationInfo);
            }
            
            updateDestinationInfo();


            function handleFileSelect(file) {
                 if (!file) return;
                currentFile = file;
                document.getElementById('confirm-filename-' + componentId).textContent = file.name;
                document.getElementById('confirm-filesize-' + componentId).textContent = (file.size / 1024).toFixed(2) + ' KB';
                showStep(2);
            }

            dropArea.addEventListener('click', () => fileInput.click());
            dropArea.addEventListener('dragover', (e) => { e.preventDefault(); dropArea.classList.add('active'); });
            dropArea.addEventListener('dragleave', (e) => { e.preventDefault(); dropArea.classList.remove('active'); });
            dropArea.addEventListener('drop', (e) => {
                e.preventDefault();
                dropArea.classList.remove('active');
                if (e.dataTransfer.files.length) {
                    fileInput.files = e.dataTransfer.files;
                    handleFileSelect(fileInput.files[0]);
                }
            });
            fileInput.addEventListener('change', () => { if (fileInput.files.length) { handleFileSelect(fileInput.files[0]); } });

            cancelBtn.addEventListener('click', () => {
                currentFile = null;
                fileInput.value = '';
                showStep(1);
            });


            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                const selectedTarget = getSelectedTarget();
                if (!selectedTarget) {
                    alert('Por favor, selecione um destino para o upload.'); return;
                }
                if (!currentFile) {
                    statusEl.textContent = 'Por favor, selecione um arquivo.'; statusEl.style.color = 'red'; return;
                }
                statusEl.textContent = 'Enviando...'; statusEl.style.color = 'orange'; submitBtn.disabled = true; progressWrapper.style.display = 'block'; progressBar.style.width = '0%';
                
                const formData = new FormData();
                const filename = selectedTarget.destinationFilename.replace('%%Date%%', new Date().toISOString().split('T')[0]);
                
                formData.append('file', currentFile);
                formData.append('path', selectedTarget.destinationPath);
                formData.append('filename', filename);
                formData.append('brandId', brandId);

                try {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', '/api/ftp-upload', true);
                    xhr.upload.onprogress = function(event) { if (event.lengthComputable) { const percent = (event.loaded / event.total) * 100; progressBar.style.width = percent + '%'; } };
                    xhr.onload = function() {
                        const result = JSON.parse(xhr.responseText);
                        if (xhr.status >= 200 && xhr.status < 300) {
                            statusEl.textContent = result.message || 'Arquivo enviado!'; statusEl.style.color = 'green'; form.reset(); fileNameDisplay.textContent = '';
                            setTimeout(() => { progressWrapper.style.display = 'none'; progressBar.style.width = '0%'; showStep(1); currentFile = null; }, 3000);
                        } else { throw new Error(result.message || 'Falha no envio.'); }
                    };
                    xhr.onerror = function() { throw new Error('Erro de rede.'); };
                    xhr.send(formData);
                } catch (error) {
                    statusEl.textContent = 'Erro: ' + error.message; statusEl.style.color = 'red';
                } finally {
                    submitBtn.disabled = false;
                }
            });
        })();
        </script>
    `;
}
