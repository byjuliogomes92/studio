
import { NextRequest, NextResponse } from 'next/server';
import { uploadToFtp } from '@/lib/ftp-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const path = formData.get('path') as string | null;
    const filename = formData.get('filename') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'Nenhum arquivo encontrado.' }, { status: 400 });
    }
    if (!path || !filename) {
      return NextResponse.json({ success: false, message: 'Caminho ou nome do arquivo de destino faltando.' }, { status: 400 });
    }
    
    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to FTP
    await uploadToFtp(fileBuffer, path, filename);

    return NextResponse.json({ success: true, message: 'Arquivo enviado com sucesso!' });
  } catch (error: any) {
    console.error('FTP Upload Error:', error);
    return NextResponse.json({ success: false, message: `Erro no servidor: ${error.message}` }, { status: 500 });
  }
}
