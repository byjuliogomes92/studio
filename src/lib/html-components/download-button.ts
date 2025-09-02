
import type { PageComponent } from '@/lib/types';

export function renderDownloadButton(component: PageComponent): string {
    const { text = 'Download', fileUrl = '', fileName = '', align = 'center', conditionalDisplay } = component.props;
    const containerId = `download-container-${component.id}`;
    const buttonId = `download-btn-${component.id}`;
    
    const isConditional = conditionalDisplay?.enabled && conditionalDisplay?.trigger === 'form_submission';
    const containerStyle = isConditional ? 'display: none;' : '';
    const styleString = getStyleString(component.props.styles);

    return `
        <div id="${containerId}" class="download-component-container" style="${containerStyle}">
            <div style="text-align: ${align}; ${styleString}">
                <button id="${buttonId}" class="custom-button">${text}</button>
                <div id="progress-container-${component.id}" class="progress-container" style="display: none;">
                    <div id="progress-bar-${component.id}" class="progress-bar"></div>
                </div>
            </div>
        </div>
        <script>
        (function() {
            const downloadBtn = document.getElementById('${buttonId}');
            if (!downloadBtn) return;
            
            downloadBtn.addEventListener('click', async function() {
                const url = '${fileUrl}';
                const filename = '${fileName}';
                if (!url) {
                    alert('URL do arquivo não definida.');
                    return;
                }

                const progressContainer = document.getElementById('progress-container-${component.id}');
                const progressBar = document.getElementById('progress-bar-${component.id}');
                
                if (progressContainer) progressContainer.style.display = 'block';
                if (downloadBtn) downloadBtn.style.display = 'none';

                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error('Falha na rede ao tentar baixar o arquivo.');
                    }

                    const contentLength = response.headers.get('content-length');
                    const total = contentLength ? parseInt(contentLength, 10) : 0;
                    let loaded = 0;

                    const stream = new ReadableStream({
                        async start(controller) {
                            const reader = response.body.getReader();
                            for (;;) {
                                const { done, value } = await reader.read();
                                if (done) break;
                                loaded += value.byteLength;
                                if(total && progressBar) {
                                   const percentage = Math.round((loaded / total) * 100);
                                   progressBar.style.width = percentage + '%';
                                   progressBar.textContent = percentage + '%';
                                }
                                controller.enqueue(value);
                            }
                            controller.close();
                        },
                    });

                    const newResponse = new Response(stream);
                    const blob = await newResponse.blob();
                    const blobUrl = window.URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = blobUrl;
                    a.download = filename || url.split('/').pop();
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(blobUrl);
                    document.body.removeChild(a);

                } catch (error) {
                    console.error('Erro no download:', error);
                    alert('Não foi possível baixar o arquivo.');
                } finally {
                    if (progressContainer) progressContainer.style.display = 'none';
                    if (downloadBtn) downloadBtn.style.display = 'inline-block';
                    if (progressBar) {
                        progressBar.style.width = '0%';
                        progressBar.textContent = '';
                    }
                }
            });
        })();
        </script>`;
}

function getStyleString(styles: any = {}): string {
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}
