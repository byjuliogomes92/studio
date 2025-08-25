
// src/app/api/preview/route.tsx

import { type NextRequest, NextResponse } from 'next/server';

// This is a simple server-side endpoint to render the preview HTML.
// It avoids the issues with blobs and data URIs by serving a proper HTML document.
export async function GET(req: NextRequest) {

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Preview da Página</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: #f0f2f5; }
          iframe { width: 100%; height: 100%; border: none; }
        </style>
      </head>
      <body>
        <iframe id="preview-frame"></iframe>
        <script>
          // This script runs in the new tab.
          // It retrieves the page state from localStorage and generates the preview HTML.
          try {
            const pageStateString = localStorage.getItem('cloudPagePreviewState');
            if (pageStateString) {
              const pageState = JSON.parse(pageStateString);
              
              // We need to simulate the html-generator logic here on the client-side
              // This is a simplified version for the preview.
              // We will just pass the raw HTML content to the iframe.
              const previewHtml = pageState.previewHtml; // We'll store the pre-generated HTML

              const iframe = document.getElementById('preview-frame');
              if (iframe) {
                iframe.setAttribute('srcdoc', previewHtml);
              }
              // Clean up local storage after use
              localStorage.removeItem('cloudPagePreviewState');
            } else {
               document.body.innerHTML = '<p>Não foi possível carregar o preview. Por favor, tente novamente.</p>';
            }
          } catch (e) {
            console.error('Error loading preview:', e);
            document.body.innerHTML = '<p>Ocorreu um erro ao carregar o preview.</p>';
          }
        </script>
      </body>
    </html>
  `;

  return new NextResponse(htmlContent, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
