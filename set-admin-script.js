/**
 * INSTRUÇÕES PARA SE TORNAR UM ADMINISTRADOR
 * 
 * Este script deve ser executado no Google Cloud Shell para evitar os problemas de CORS
 * que estamos enfrentando. Siga os passos abaixo com atenção.
 *
 * --- PASSO A PASSO ---
 *
 * 1. ACESSE O GOOGLE CLOUD SHELL:
 *    - Vá para o Console do Firebase do seu projeto.
 *    - No canto superior direito, clique no ícone do Cloud Shell (parece um ">_").
 *    - Isso abrirá um terminal na parte inferior da tela. Aguarde ele inicializar.
 *
 * 2. CRIE O ARQUIVO DO SCRIPT:
 *    - No terminal do Cloud Shell, digite o seguinte comando e pressione Enter:
 *      nano setAdmin.js
 *
 * 3. COLE O CÓDIGO ABAIXO:
 *    - Copie TODO o código que está abaixo desta seção de instruções.
 *    - Cole o código na tela de edição do "nano" que apareceu.
 *
 * 4. EDITE O E-MAIL:
 *    - Dentro do editor, altere a linha `const userEmail = "seu-email-aqui@exemplo.com";`
 *      para o e-mail do usuário que você deseja tornar administrador.
 *
 * 5. SALVE E SAIA:
 *    - Pressione `Ctrl + X`.
 *    - Pressione `Y` para confirmar que deseja salvar.
 *    - Pressione `Enter` para confirmar o nome do arquivo.
 *
 * 6. EXECUTE O SCRIPT:
 *    - De volta ao terminal, digite o seguinte comando e pressione Enter:
 *      node setAdmin.js
 *
 * 7. VERIFIQUE O RESULTADO:
 *    - O terminal deverá exibir uma mensagem de sucesso.
 *
 * 8. FAÇA LOGIN NOVAMENTE:
 *    - Na sua aplicação, faça logout e login novamente para que as novas permissões
 *      de administrador sejam aplicadas.
 *
 * Após seguir estes passos, você terá acesso ao painel em /admin.
 */

// --- INÍCIO DO CÓDIGO PARA COLAR ---

const admin = require('firebase-admin');

// ATENÇÃO: Você precisa do ID do seu projeto Firebase. 
// Você pode encontrá-lo nas "Configurações do Projeto" no Console do Firebase.
const serviceAccount = {}; // Deixe vazio, o Cloud Shell infere as credenciais.

// Inicialize o app com o ID do seu projeto.
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT, // O Cloud Shell preenche isso
});

// ***** EDITE A LINHA ABAIXO *****
const userEmail = "seu-email-aqui@exemplo.com";
// ********************************

if (!userEmail || userEmail === "seu-email-aqui@exemplo.com") {
    console.error("\nERRO: Por favor, edite o arquivo e substitua 'seu-email-aqui@exemplo.com' pelo e-mail do usuário.\n");
    process.exit(1);
}

async function setAdminClaim() {
  try {
    console.log(`Buscando usuário para o e-mail: ${userEmail}...`);
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    
    console.log(`Usuário encontrado: ${userRecord.uid}. Atribuindo permissão de administrador...`);
    
    // Define o custom claim 'admin' como true
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    
    console.log(`\n✅ SUCESSO! ${userEmail} agora é um administrador.`);
    console.log("   Por favor, faça logout e login novamente na aplicação para que as alterações entrem em vigor.\n");
    
    process.exit(0);

  } catch (error) {
    console.error("\n❌ ERRO AO DEFINIR PERMISSÃO DE ADMINISTRADOR:");
    if (error.code === 'auth/user-not-found') {
        console.error(`   Nenhum usuário foi encontrado com o e-mail: ${userEmail}`);
    } else {
        console.error("   Ocorreu um erro inesperado:", error.message);
    }
    console.error("   Por favor, verifique se o e-mail está correto e se o usuário já está cadastrado.\n");
    process.exit(1);
  }
}

setAdminClaim();
