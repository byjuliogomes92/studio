
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  // Check if the request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "A solicitação deve ser feita por um usuário autenticado."
    );
  }

  // Check if the user making the request is already an admin (optional, but good practice for production)
  // For this prototype, we'll allow any authenticated user to use this function for setup purposes.
  // if (context.auth.token.admin !== true) {
  //   throw new functions.https.HttpsError(
  //     'permission-denied',
  //     'Apenas administradores podem adicionar outros administradores.'
  //   );
  // }


  const email = data.email;
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    return { message: `Sucesso! ${email} agora é um administrador.` };
  } catch (error) {
    console.error("Error setting admin claim:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Erro ao definir a permissão de administrador."
    );
  }
});
