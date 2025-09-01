
import type { PageComponent, CloudPage } from '@/lib/types';

export function renderFTPUpload(component: PageComponent, pageState: CloudPage): string {
    const { 
        label = "Enviar Arquivo CSV",
        destinationPath = "/Import",
        destinationFilename = "uploaded_file.csv",
        dataExtensionName = ""
    } = component.props;

    const { brandId } = pageState;
    const formId = `ftp-upload-form-${component.id}`;

    // This AMPScript block will execute on the SFMC server, resolving any dynamic variables in the filename.
    const ampscriptBlock = `%%[
      VAR @finalFilename
      SET @finalFilename = Concat("${destinationFilename}")
    ]%%`;

    return `
        ${ampscriptBlock}
        <div class="ftp-upload-container">
            <h3>Upload de Arquivo para FTP</h3>
            <p><strong>Destino:</strong> ${destinationPath}/%%=v(@finalFilename)=%%</p>
            ${dataExtensionName ? `<p><strong>Data Extension Alvo:</strong> ${dataExtensionName}</p>` : ''}
            <form id="${formId}" class="ftp-upload-form">
                <input type="hidden" name="resolvedFilename" value="%%=v(@finalFilename)=%%">
                <label for="file-input-${component.id}">${label}</label>
                <input type="file" id="file-input-${component.id}" name="file" accept=".csv" required>
                <button type="submit">Enviar</button>
                <div class="upload-status" id="status-${component.id}"></div>
            </form>
        </div>
        <script>
        (function() {
            const form = document.getElementById('${formId}');
            if (!form) return;

            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                const statusEl = document.getElementById('status-${component.id}');
                const fileInput = document.getElementById('file-input-${component.id}');
                const resolvedFilenameInput = form.querySelector('input[name="resolvedFilename"]');
                const submitBtn = form.querySelector('button');

                if (!fileInput.files || fileInput.files.length === 0) {
                    statusEl.textContent = 'Por favor, selecione um arquivo.';
                    statusEl.style.color = 'red';
                    return;
                }

                statusEl.textContent = 'Enviando...';
                statusEl.style.color = 'orange';
                submitBtn.disabled = true;

                const formData = new FormData();
                formData.append('file', fileInput.files[0]);
                formData.append('path', '${destinationPath}');
                formData.append('filename', resolvedFilenameInput.value); // Use the resolved filename
                formData.append('brandId', '${brandId}');


                try {
                    const response = await fetch('/api/ftp-upload', {
                        method: 'POST',
                        body: formData,
                    });

                    const result = await response.json();

                    if (response.ok) {
                        statusEl.textContent = result.message || 'Arquivo enviado com sucesso!';
                        statusEl.style.color = 'green';
                        form.reset();
                    } else {
                        throw new Error(result.message || 'Falha no envio.');
                    }
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
