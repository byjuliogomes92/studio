import { NextRequest, NextResponse } from 'next/server';
import { uploadToFtp } from '@/lib/ftp-service';
import { getBrand } from '@/lib/firestore';
import cors from 'cors';

// Helper to run middleware
function runMiddleware(req: NextRequest, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, new Response(), (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Initialize cors middleware
const corsMiddleware = cors({
  origin: '*', // Allow all origins
  methods: ['POST', 'OPTIONS'],
});


export async function OPTIONS(request: NextRequest) {
  await runMiddleware(request, corsMiddleware);
  return new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
   await runMiddleware(request, corsMiddleware);

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const path = formData.get('path') as string | null;
    const filename = formData.get('filename') as string | null;
    const brandId = formData.get('brandId') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'Nenhum arquivo encontrado.' }, { status: 400 });
    }
    
    if (!path || !filename || !brandId) {
      return NextResponse.json({ success: false, message: 'Caminho, nome do arquivo ou ID da marca faltando.' }, { status: 400 });
    }

    const brand = await getBrand(brandId);
    if (!brand || !brand.integrations?.ftp || !brand.integrations.ftp.host || !brand.integrations.ftp.user || !brand.integrations.ftp.encryptedPassword) {
      return NextResponse.json({ success: false, message: 'Configurações de FTP não encontradas para esta marca.' }, { status: 400 });
    }
    
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await uploadToFtp(fileBuffer, path, filename, brand.integrations.ftp);

    return NextResponse.json({ success: true, message: 'Arquivo enviado com sucesso!' });
  } catch (error: any) {
    console.error('FTP Upload Error:', error);
    return NextResponse.json({ success: false, message: `Erro no servidor: ${error.message}` }, { status: 500 });
  }
}