
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const axios = require("axios");
const { parse } = require("csv-parse/sync");
const crypto = require('crypto-js');
const cors = require('cors')({ origin: true });

admin.initializeApp();
const db = getFirestore();

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
 * Acts as a proxy to the Vercel API for SFMC uploads to bypass CORS issues.
 */
exports.proxySfmcUpload = functions
    .region('us-central1')
    .https.onRequest((req, res) => {
        cors(req, res, async () => {
            if (req.method !== 'POST') {
                return res.status(405).send('Method Not Allowed');
            }

            const vercelApiUrl = process.env.NEXT_PUBLIC_BASE_URL 
                ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/sfmc-upload`
                : 'http://localhost:9002/api/sfmc-upload';

            try {
                const response = await axios.post(vercelApiUrl, req.body, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                return res.status(200).send(response.data);

            } catch (error) {
                console.error("Proxy Error to Vercel:", {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });

                const statusCode = error.response?.status || 500;
                const errorMessage = `Erro ao se comunicar com a API de upload: ${error.response?.data?.message || error.message}`;
                
                return res.status(statusCode).send({ success: false, message: errorMessage });
            }
        });
    });
