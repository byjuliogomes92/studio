
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

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
 * Processes a CSV file from Storage and uploads it to SFMC.
 */
exports.processCsvToSfmc = functions
    .region('us-central1')
    .https.onCall(async (data, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "Usuário não autenticado.");
        }
        
        const { filePath, deKey, restBaseUrl, brandId } = data;
        if (!filePath || !deKey || !restBaseUrl || !brandId) {
            throw new functions.https.HttpsError("invalid-argument", "Parâmetros faltando (filePath, deKey, restBaseUrl, brandId).");
        }

        // --- In a real implementation, you would: ---
        // 1. Get SFMC API credentials securely (e.g., from Firestore, decrypting them).
        // const brandRef = db.collection('brands').doc(brandId);
        // const brandDoc = await brandRef.get();
        // const { clientId, clientSecret } = decryptCredentials(brandDoc.data().sfmcApi);
        
        // 2. Get an SFMC Auth Token.
        // const token = await getSfmcAuthToken(restBaseUrl, clientId, clientSecret);
        
        // 3. Download the file from Firebase Storage.
        // const bucket = admin.storage().bucket();
        // const fileContents = await bucket.file(filePath).download();
        
        // 4. Parse the CSV content.
        // const records = parse(fileContents.toString(), { columns: true });
        
        // 5. Send data in batches to SFMC REST API.
        // const results = await sendDataToSfmc(restBaseUrl, token, deKey, records);
        
        // For this prototype, we'll simulate the process.
        console.log(`Simulating processing of ${filePath} for DE ${deKey}`);
        
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 5000)); 
        
        const simulatedRowCount = Math.floor(Math.random() * 10000) + 500;

        return { 
            success: true, 
            message: `Sucesso! ${simulatedRowCount} registros foram adicionados à Data Extension.`,
            rowsAdded: simulatedRowCount,
        };
    });

