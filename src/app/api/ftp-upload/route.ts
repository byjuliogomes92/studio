import { NextRequest, NextResponse } from 'next/server';
import { uploadToFtp } from '@/lib/ftp-service';
import { getBrand } from '@/lib/firestore';

// Lista de origens permitidas
const allowedOrigins = [
'https://cloud.hello.natura.com',
'https://cloudpagestudio.vercel.app'
];

// Função auxiliar para adicionar cabeçalhos CORS
function corsHeaders(request: NextRequest, response: NextResponse): NextResponse {
const origin = request.headers.get('origin');

// Verificar se a origem está na lista de permitidas
if (origin && allowedOrigins.includes(origin)) {
  response.headers.set('Access-Control-Allow-Origin', origin);
}

response.headers.set('Access-Control-Allow-Credentials', 'true');
response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
response.headers.set(
  'Access-Control-Allow-Headers',
  'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
);

return response;
}

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
const response = new NextResponse(null, { status: 200 });
return corsHeaders(request, response);
}

export async function POST(request: NextRequest) {
try {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const path = formData.get('path') as string | null;
  const filename = formData.get('filename') as string | null;
  const brandId = formData.get('brandId') as string | null;

  if (!file) {
    const response = new NextResponse(
      JSON.stringify({ success: false, message: 'Nenhum arquivo encontrado.' }), 
      { status: 400 }
    );
    return corsHeaders(request, response);
  }
  
  if (!path || !filename || !brandId) {
    const response = new NextResponse(
      JSON.stringify({ success: false, message: 'Caminho, nome do arquivo ou ID da marca faltando.' }), 
      { status: 400 }
    );
    return corsHeaders(request, response);
  }

  // Fetch brand details to get FTP credentials
  const brand = await getBrand(brandId);
  if (!brand || !brand.integrations?.ftp || !brand.integrations.ftp.host || !brand.integrations.ftp.user || !brand.integrations.ftp.encryptedPassword) {
    const response = new NextResponse(
      JSON.stringify({ success: false, message: 'Configurações de FTP não encontradas para esta marca.' }), 
      { status: 400 }
    );
    return corsHeaders(request, response);
  }
  
  // Convert file to buffer
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  // Upload to FTP using brand-specific credentials
  await uploadToFtp(fileBuffer, path, filename, brand.integrations.ftp);

  const response = new NextResponse(
    JSON.stringify({ success: true, message: 'Arquivo enviado com sucesso!' })
  );
  return corsHeaders(request, response);
} catch (error: any) {
  console.error('FTP Upload Error:', error);
  const response = new NextResponse(
    JSON.stringify({ success: false, message: `Erro no servidor: ${error.message}` }), 
    { status: 500 }
  );
  return corsHeaders(request, response);
}
}