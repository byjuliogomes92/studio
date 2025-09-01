
import * as ftp from 'basic-ftp';
import { Readable } from 'stream';

export async function uploadToFtp(fileBuffer: Buffer, path: string, filename: string): Promise<void> {
  const client = new ftp.Client();
  // client.ftp.verbose = true; // Uncomment for debugging FTP connection

  try {
    const ftpHost = process.env.FTP_HOST;
    const ftpUser = process.env.FTP_USER;
    const ftpPassword = process.env.FTP_PASSWORD;

    if (!ftpHost || !ftpUser || !ftpPassword) {
      throw new Error('As credenciais de FTP não estão configuradas no servidor.');
    }

    await client.access({
      host: ftpHost,
      user: ftpUser,
      password: ftpPassword,
      secure: false, // Use true for FTPS
    });

    const remotePath = `${path}/${filename}`;
    const readableStream = Readable.from(fileBuffer);
    
    await client.uploadFrom(readableStream, remotePath);

  } catch (err: any) {
    console.error(`FTP Service Error: ${err.message}`, err);
    throw new Error(`Falha no upload para o FTP: ${err.message}`);
  } finally {
    if (!client.closed) {
      client.close();
    }
  }
}
