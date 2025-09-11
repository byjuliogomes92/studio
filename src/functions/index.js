

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const axios = require("axios");

admin.initializeApp();
const db = getFirestore();

// This is a standard onRequest function that receives a form submission.
exports.proxySfmcUpload = functions.https.onRequest(async (req, res) => {
    // Manually handle CORS preflight (OPTIONS) request
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

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
            columnMapping: JSON.parse(req.body.columnMapping)
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
