
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

    return `
        <div class="ftp-upload-container">
            <h3>Upload de Arquivo para FTP</h3>
            <p><strong>Destino:</strong> ${destinationPath}/${destinationFilename}</p>
            ${dataExtensionName ? `<p><strong>Data Extension Alvo:</strong> ${dataExtensionName}</p>` : ''}
            <form id="${formId}" class="ftp-upload-form">
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
                formData.append('filename', '%%=v(@finalFilename)=%%'); // Use AMPScript variable
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
        %%[
            /* This AMPScript block resolves the dynamic filename on the server before rendering */
            VAR @finalFilename
            SET @finalFilename = "${destinationFilename}"
        ]%%
    `;
}
