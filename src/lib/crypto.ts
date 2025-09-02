
import crypto from 'crypto-js';

const getEncryptionKey = (): string => {
    const key = process.env.FTP_ENCRYPTION_KEY || process.env.NEXT_PUBLIC_CRYPTO_FALLBACK_KEY;
    if (!key) {
        console.error("FATAL: Encryption key is not defined in the environment.");
        throw new Error("A chave de criptografia do servidor não está configurada.");
    }
    return key;
};

export function encryptPassword(password: string): string {
    const key = getEncryptionKey();
    return crypto.AES.encrypt(password, key).toString();
}

export function decryptPassword(encryptedPassword: string): string {
    const key = getEncryptionKey();
    const bytes = crypto.AES.decrypt(encryptedPassword, key);
    return bytes.toString(crypto.enc.Utf8);
}
