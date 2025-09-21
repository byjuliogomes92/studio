

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const axios = require("axios");
const crypto = require('crypto-js');

admin.initializeApp();
const db = getFirestore();

// Helper para descriptografar senhas
// A chave é obtida das configurações de ambiente da Firebase Function.
const getEncryptionKey = () => {
    // No ambiente do Firebase Functions, as variáveis são acessadas via functions.config()
    const key = functions.config().keys?.secret_encryption_key;
    if (!key) {
        console.error("FATAL: SECRET_ENCRYPTION_KEY não está configurada nas Firebase Functions.");
        // Use `firebase functions:config:set keys.secret_encryption_key="SUA_CHAVE_AQUI"` para configurar
        throw new functions.https.HttpsError('internal', 'O servidor não está configurado corretamente para segurança.');
    }
    return key;
};

// Descriptografa a senha usando a chave de ambiente.
const decryptPassword = (encryptedPassword) => {
    const key = getEncryptionKey();
    try {
        const bytes = crypto.AES.decrypt(encryptedPassword, key);
        const originalText = bytes.toString(crypto.enc.Utf8);
        if (!originalText) {
            throw new Error("A descriptografia resultou em uma string vazia (chave provavelmente incorreta).");
        }
        return originalText;
    } catch (error) {
        console.error("Erro ao descriptografar:", error);
        return "DECRYPTION_ERROR"; 
    }
};


// This is a standard onRequest function that receives a form submission.
exports.proxySfmcUpload = functions.https.onRequest(async (req, res) => {
    // Manually handle CORS preflight (OPTIONS) request
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const returnUrl = req.body.returnUrl;
    if (!returnUrl) {
        res.status(400).send('returnUrl is required.');
        return;
    }

    try {
        const vercelApiUrl = functions.config().vercel.api_url;
        if (!vercelApiUrl) {
            throw new Error('A URL da API da Vercel não está configurada.');
        }

        // Reconstruct the payload exactly as the Vercel API expects it
        const payload = {
            records: JSON.parse(req.body.records),
            deKey: req.body.deKey,
            brandId: req.body.brandId,
            columnMapping: req.body.columnMapping ? JSON.parse(req.body.columnMapping) : {}
        };

        const response = await axios.post(
            `${vercelApiUrl}/api/sfmc-upload`,
            { payload: payload }, // Nest inside another 'payload' object
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 300000 
            }
        );
        
        // Redirect back to the CloudPage with success status
        const count = response.data.rowsProcessed || 0;
        res.redirect(`${returnUrl}?uploadStatus=success&count=${count}`);

    } catch (error) {
        console.error("Erro no proxy para a Vercel API:", error.response ? error.response.data : error.message);
        const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido.';
        res.redirect(`${returnUrl}?uploadStatus=error&error=${encodeURIComponent(errorMessage)}`);
    }
});


/**
 * Sets a custom claim on a user account to make them an admin.
 */
exports.setAdminClaim = functions
    .region('us-central1')
    .https.onCall(async (data, context) => {
        // This check ensures that only authenticated users can call this function.
        // For extra security, you could check if context.auth.token.admin === true
        // to ensure only admins can make other users admins.
        if (!context.auth) {
            throw new functions.https.HttpsError(
                "unauthenticated",
                "A solicitação deve ser feita por um usuário autenticado."
            );
        }

        const email = data.email;
        if (!email || typeof email !== 'string') {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "O e-mail é obrigatório e deve ser uma string."
            );
        }

        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            
            await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

            const userDocRef = db.collection('users').doc(userRecord.uid);
            await userDocRef.set({
                isAdmin: true
            }, { merge: true });

            return { 
                message: `Sucesso! ${email} agora é um administrador.`
            };

        } catch (error) {
            console.error("Error setting admin claim for email:", email, "Error:", error);
            
            if (error.code === 'auth/user-not-found') {
                throw new functions.https.HttpsError(
                    "not-found",
                    "Nenhum usuário encontrado com este e-mail."
                );
            } else {
                 throw new functions.https.HttpsError(
                    "internal",
                    "Ocorreu um erro inesperado ao definir a permissão de administrador."
                );
            }
        }
    });

/**
 * Gets a list of all users from Firebase Authentication.
 */
exports.getAllUsers = functions
    .region('us-central1')
    .https.onCall(async (data, context) => {
        if (!context.auth || context.auth.token.admin !== true) {
            throw new functions.https.HttpsError(
                "permission-denied",
                "Apenas administradores podem listar usuários."
            );
        }

        try {
            const listUsersResult = await admin.auth().listUsers(1000);
            const users = listUsersResult.users.map((userRecord) => ({
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                photoURL: userRecord.photoURL,
                disabled: userRecord.disabled,
                creationTime: userRecord.metadata.creationTime,
                lastSignInTime: userRecord.metadata.lastSignInTime,
                isAdmin: userRecord.customClaims?.admin === true,
            }));
            
            return users;

        } catch (error) {
            console.error("Error listing users:", error);
            throw new functions.https.HttpsError(
                "internal",
                "Ocorreu um erro ao buscar a lista de usuários."
            );
        }
    });

/**
 * Valida as credenciais de acesso a uma página protegida.
 * Esta função é chamada pelo lado do cliente (pela página publicada).
 * Ela usa o Admin SDK, que tem acesso privilegiado ao Firestore,
 * ignorando as regras de segurança para poder ler a coleção `pageAccess`.
 */
exports.verifyPageAccess = functions
    .region('us-central1')
    .https.onCall(async (data, context) => {
        const { pageId, identifier, password } = data;

        if (!pageId || !identifier || !password) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "pageId, identifier e password são obrigatórios."
            );
        }

        try {
            // STEP 1: Consultar a coleção 'pageAccess' usando o Admin SDK.
            // O Admin SDK bypassa as regras de segurança do Firestore, permitindo a leitura.
            const accessQuery = await db.collection('pageAccess')
                .where('pageId', '==', pageId)
                .where('identifier', '==', identifier)
                .limit(1)
                .get();

            if (accessQuery.empty) {
                // Usuário não encontrado, retorna uma mensagem genérica para segurança.
                return { success: false, message: 'Identificador ou senha inválidos.' };
            }

            // STEP 2: Obter a senha criptografada do banco de dados.
            const accessDoc = accessQuery.docs[0].data();
            const storedEncryptedPassword = accessDoc.encryptedPassword;

            if (!storedEncryptedPassword) {
                 throw new functions.https.HttpsError('internal', 'Erro de configuração de segurança para este usuário.');
            }

            // STEP 3: Descriptografar a senha armazenada.
            const decryptedPassword = decryptPassword(storedEncryptedPassword);

            if (decryptedPassword === "DECRYPTION_ERROR") {
                // Erro na chave de criptografia ou no dado.
                throw new functions.https.HttpsError('internal', 'Erro interno do servidor ao verificar credenciais.');
            }

            // STEP 4: Comparar a senha enviada com a senha descriptografada.
            if (password === decryptedPassword) {
                // Sucesso! Retorna sucesso para o cliente.
                return { success: true };
            } else {
                // Senha incorreta.
                return { success: false, message: 'Identificador ou senha inválidos.' };
            }

        } catch (error) {
            console.error("Erro na função verifyPageAccess:", error);
            throw new functions.https.HttpsError(
                "internal",
                "Ocorreu um erro inesperado durante a autenticação."
            );
        }
    });
