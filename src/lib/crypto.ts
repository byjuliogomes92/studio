
"use server";

import crypto from 'crypto-js';

const getEncryptionKey = (): string => {
    const key = process.env.FTP_ENCRYPTION_KEY;
    if (!key) {
        // Em um ambiente de produção real, isso deve lançar um erro ou ter um fallback mais robusto.
        // Por segurança, NUNCA use uma chave padrão fixa no código.
        console.error("FATAL: FTP_ENCRYPTION_KEY não está definida no ambiente.");
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
