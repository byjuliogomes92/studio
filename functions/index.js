

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const axios = require("axios");
const { parse } = require("csv-parse/sync");
const crypto = require('crypto-js');
const cors = require('cors')({ origin: true });

admin.initializeApp();
const db = getFirestore();

exports.proxySfmcUpload = functions.https.onCall(async (data, context) => {
    // Note: 'onCall' handles CORS automatically.
    // It also provides auth context if the user is logged in.
    
    // For security, you might want to check for auth:
    // if (!context.auth) {
    //     throw new functions.https.HttpsError('unauthenticated', 'Apenas usuários autenticados podem fazer upload.');
    // }

    try {
        const vercelApiUrl = functions.config().vercel.api_url;
        if (!vercelApiUrl) {
            throw new functions.https.HttpsError('internal', 'A URL da API da Vercel não está configurada nas variáveis de ambiente da função.');
        }

        const response = await axios.post(
            `${vercelApiUrl}/api/sfmc-upload`,
            { payload: data }, // Encapsulate the data in a 'payload' object as the Vercel API expects
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 300000 // 5 minutes timeout for potentially long processes
            }
        );

        // Forward the response from the Vercel API back to the client
        return response.data;

    } catch (error) {
        console.error("Erro no proxy para a Vercel API:", error.response ? error.response.data : error.message);
        
        if (axios.isAxiosError(error) && error.response) {
            // Forward the specific error from Vercel API if available
            throw new functions.https.HttpsError(
                'internal', 
                error.response.data.message || 'Erro desconhecido na API da Vercel.',
                error.response.data
            );
        }
        
        // Generic error
        throw new functions.https.HttpsError('internal', 'Ocorreu um erro ao conectar-se ao serviço de upload.');
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

