
import crypto from 'crypto-js';

// No ambiente de produção da Vercel, as variáveis devem ser configuradas
// diretamente no painel do projeto. Esta função garante que, mesmo que
// a variável de servidor não seja encontrada, usamos um fallback seguro.
const getEncryptionKey = (): string => {
    const key = process.env.SECRET_ENCRYPTION_KEY;
    if (!key) {
        // Este erro não deve acontecer se as variáveis estiverem configuradas corretamente.
        console.error("FATAL: Nenhuma chave de criptografia foi definida no ambiente.");
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
    try {
        const bytes = crypto.AES.decrypt(encryptedPassword, key);
        const originalText = bytes.toString(crypto.enc.Utf8);
        if (!originalText) {
            // Isso acontece se a chave estiver incorreta ou o dado corrompido.
            throw new Error("A descriptografia resultou em uma string vazia.");
        }
        return originalText;
    } catch (error) {
        console.error("Erro ao descriptografar:", error);
        // Retorna um valor inválido para causar falha em vez de erro silencioso.
        return "DECRYPTION_ERROR"; 
    }
}
