
import { NextRequest, NextResponse } from 'next/server';
import { uploadToFtp } from '@/lib/ftp-service';
import { getBrand } from '@/lib/firestore';

const getCorsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { headers: getCorsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const path = formData.get('path') as string | null;
    const filename = formData.get('filename') as string | null;
    const brandId = formData.get('brandId') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'Nenhum arquivo encontrado.' }, { status: 400, headers: getCorsHeaders() });
    }
    
    if (!path || !filename || !brandId) {
      return NextResponse.json({ success: false, message: 'Caminho, nome do arquivo ou ID da marca faltando.' }, { status: 400, headers: getCorsHeaders() });
    }

    const brand = await getBrand(brandId);
    if (!brand || !brand.integrations?.ftp || !brand.integrations.ftp.host || !brand.integrations.ftp.user || !brand.integrations.ftp.encryptedPassword) {
      return NextResponse.json({ success: false, message: 'Configurações de FTP não encontradas para esta marca.' }, { status: 400, headers: getCorsHeaders() });
    }
    
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await uploadToFtp(fileBuffer, path, filename, brand.integrations.ftp);

    return NextResponse.json({ success: true, message: 'Arquivo enviado com sucesso!' }, { headers: getCorsHeaders() });
  } catch (error: any) {
    console.error('FTP Upload Error:', error);
    return NextResponse.json({ success: false, message: `Erro no servidor: ${error.message}` }, { status: 500, headers: getCorsHeaders() });
  }
}
