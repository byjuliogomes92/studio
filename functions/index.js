
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

admin.initializeApp();
const db = getFirestore();

/**
 * Sets a custom claim on a user account to make them an admin.
 * This function is callable directly from the client.
 */
exports.setAdminClaim = functions.https.onCall(async (data, context) => {
    // Check if the request is made by an authenticated user.
    // In a real-world scenario, you'd want to add another layer of security here,
    // like checking if the caller is already an admin. For this tool, we'll allow any authenticated user.
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

        // Also update the 'users' collection for consistency, if you have one.
        const userDocRef = db.collection('users').doc(userRecord.uid);
        await userDocRef.set({
            isAdmin: true
        }, { merge: true });

        return { message: `Sucesso! ${email} agora é um administrador.` };

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
                "Ocorreu um erro inesperado ao definir a permissão de administrador. Verifique os logs do servidor."
            );
        }
    }
});


/**
 * Gets a list of all users from Firebase Authentication.
 * This function should only be callable by an admin.
 */
exports.getAllUsers = functions.https.onCall(async (data, context) => {
    // Check if the user is an admin.
    if (context.auth.token.admin !== true) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Apenas administradores podem listar usuários."
        );
    }

    try {
        const listUsersResult = await admin.auth().listUsers(1000); // Batches of 1000
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
