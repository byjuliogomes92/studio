
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const axios = require("axios");
const { parse } = require("csv-parse/sync");
const crypto = require('crypto-js');

admin.initializeApp();
const db = getFirestore();


const getEncryptionKey = () => {
    // This environment variable is crucial and must be set in the Firebase Functions environment.
    // e.g., firebase functions:config:set keys.encryption="your-very-long-secret-key"
    const key = functions.config().keys?.encryption;
    if (!key) {
        console.error("FATAL: Encryption key is not defined in Firebase Functions config.");
        throw new functions.https.HttpsError("internal", "Server is not configured for encryption.");
    }
    return key;
};

const decryptPassword = (encrypted) => {
    const key = getEncryptionKey();
    const bytes = crypto.AES.decrypt(encrypted, key);
    return bytes.toString(crypto.enc.Utf8);
};


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
 * Processes a CSV file from Storage and uploads it to SFMC.
 */
exports.processCsvToSfmc = functions
    .region('us-central1')
    .https.onCall(async (data, context) => {
        const { filePath, deKey, brandId } = data;
        if (!filePath || !deKey || !brandId) {
            throw new functions.https.HttpsError("invalid-argument", "Parâmetros faltando (filePath, deKey, brandId).");
        }

        try {
            // 1. Get brand credentials from Firestore
            const brandRef = db.collection('brands').doc(brandId);
            const brandDoc = await brandRef.get();
            if (!brandDoc.exists || !brandDoc.data().integrations?.sfmcApi) {
                throw new functions.https.HttpsError("not-found", "Configurações da API do SFMC não encontradas para esta marca.");
            }
            const { clientId, encryptedClientSecret, authBaseUrl } = brandDoc.data().integrations.sfmcApi;
            if (!clientId || !encryptedClientSecret || !authBaseUrl) {
                 throw new functions.https.HttpsError("not-found", "Credenciais da API do SFMC incompletas.");
            }
            
            const clientSecret = decryptPassword(encryptedClientSecret);

            // 2. Get an SFMC Auth Token
            const tokenResponse = await axios.post(`${authBaseUrl}v2/token`, {
                grant_type: "client_credentials",
                client_id: clientId,
                client_secret: clientSecret,
            });
            const accessToken = tokenResponse.data.access_token;
            const restBaseUrl = tokenResponse.data.rest_instance_url;

            // 3. Download the file from Firebase Storage
            const bucket = admin.storage().bucket();
            const fileContents = await bucket.file(filePath).download();
            const csvData = fileContents[0].toString('utf8');

            // 4. Parse the CSV content
            const records = parse(csvData, { 
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });

            if (records.length === 0) {
                return { success: true, message: 'Arquivo CSV vazio ou sem dados. Nada foi adicionado.' };
            }

            // 5. Prepare data for SFMC API (add ContactKey if missing)
            // This assumes the DE is sendable and uses a specific field as the Subscriber Key.
            // For simplicity, we'll use a field named 'ContactKey'.
            const sfmcPayload = records.map(record => ({
                keys: { ContactKey: record.ContactKey || record.EmailAddress || record.CPF }, // Adjust key logic as needed
                values: record,
            }));

            // 6. Send data in batches to SFMC REST API
            const sfmcApiUrl = `${restBaseUrl}hub/v1/dataevents/key:${deKey}/rowset`;
            const results = await axios.post(sfmcApiUrl, sfmcPayload, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            return { 
                success: true, 
                message: `Sucesso! ${records.length} registros foram adicionados/atualizados na Data Extension.`,
                rowsProcessed: records.length,
            };

        } catch (error) {
            console.error("SFMC Process Error:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.message || 'Ocorreu um erro desconhecido.';
             throw new functions.https.HttpsError("internal", `Falha no processamento para o SFMC: ${errorMessage}`);
        }
    });

