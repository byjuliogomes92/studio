
import * as ftp from 'basic-ftp';
import { Readable } from 'stream';
import type { FtpConfig } from './types';
import { decryptPassword } from './crypto';

export async function uploadToFtp(fileBuffer: Buffer, path: string, filename: string, ftpConfig: FtpConfig): Promise<void> {
  const client = new ftp.Client();
  // client.ftp.verbose = true; // Uncomment for debugging FTP connection

  try {
    const { host, user, encryptedPassword } = ftpConfig;
    
    if (!host || !user || !encryptedPassword) {
      throw new Error('As credenciais de FTP não estão configuradas para esta marca.');
    }

    // Decrypt the password right before use
    const password = decryptPassword(encryptedPassword);

    await client.access({
      host: host,
      user: user,
      password: password,
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
