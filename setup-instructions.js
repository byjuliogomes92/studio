
/**
 * ==================================================================
 * INSTRUÇÕES DE CONFIGURAÇÃO PÓS-CRIAÇÃO DO PROJETO
 * ==================================================================
 *
 * Este arquivo contém scripts e instruções para executar tarefas de
 * configuração essenciais diretamente no Google Cloud Shell.
 *
 * --- COMO USAR ---
 * 1. Abra o Console do Firebase do seu projeto.
 * 2. Clique no ícone do Cloud Shell (>_) no canto superior direito.
 * 3. Siga as instruções da tarefa que deseja executar.
 *
 * ==================================================================
 * TAREFA 1: TORNAR UM USUÁRIO ADMINISTRADOR
 * ==================================================================
 * Execute este script para conceder permissões de administrador a um
 * usuário, permitindo o acesso ao painel em /admin.
 *
 * --- PASSO A PASSO ---
 *
 * 1. No terminal do Cloud Shell, crie o arquivo do script:
 *    nano setAdmin.js
 *
 * 2. Cole TODO o código da seção "CÓDIGO PARA setAdmin.js" abaixo.
 *
 * 3. EDITE O E-MAIL:
 *    Altere a linha `const userEmail = "seu-email@exemplo.com";`
 *    para o e-mail do usuário desejado.
 *
 * 4. Salve e saia: Pressione `Ctrl + X`, depois `Y` e `Enter`.
 *
 * 5. Execute o script no terminal:
 *    node setAdmin.js
 *
 * 6. Após o sucesso, faça logout e login novamente na aplicação.
 *
 * ------------------------------------------------------------------
 * CÓDIGO PARA setAdmin.js
 * ------------------------------------------------------------------
 */

/*
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT,
});

const userEmail = "seu-email@exemplo.com";

if (!userEmail || userEmail === "seu-email@exemplo.com") {
    console.error("\nERRO: Por favor, edite o arquivo e substitua 'seu-email@exemplo.com' pelo e-mail do usuário.\n");
    process.exit(1);
}

async function setAdminClaim() {
  try {
    console.log(`Buscando usuário: ${userEmail}...`);
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    console.log(`\n✅ SUCESSO! ${userEmail} agora é um administrador.`);
    console.log("   Faça logout e login novamente na aplicação.\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERRO:", error.message);
    process.exit(1);
  }
}

setAdminClaim();
*/


/**
 * ==================================================================
 * TAREFA 2: CORRIGIR ERRO DE UPLOAD DE ARQUIVOS (CORS)
 * ==================================================================
 * Execute este procedimento para permitir que sua aplicação envie
 * arquivos para o Firebase Storage sem erros de CORS.
 *
 * --- PASSO A PASSO ---
 * 
 * 1. **(IMPORTANTE!) Ative o Firebase Storage primeiro:**
 *    - No menu lateral do Firebase Console, vá em "Storage".
 *    - Clique no botão "Começar" (Get Started).
 *    - Siga os passos de configuração (normalmente, apenas clique em "Próximo" e "Concluir").
 *    - **Este passo cria o "bucket" de armazenamento que o próximo comando precisa.**
 *
 * 2. No terminal do Cloud Shell, crie um arquivo de configuração:
 *    nano cors.json
 *
 * 3. Cole o conteúdo JSON abaixo no editor e salve (Ctrl+X, Y, Enter):
 *
[
  {
    "origin": ["https://cloudpagestudio.vercel.app", "http://localhost:9002"],
    "method": ["GET", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
 *
 * 4. Execute o comando abaixo no terminal. Ele aplica a configuração
 *    de CORS ao seu bucket de armazenamento.
 *    (O ID do projeto já é detectado automaticamente pelo Cloud Shell)
 *
gsutil cors set cors.json gs://$(gcloud config get-value project).appspot.com

 *
 * 5. Após a mensagem de sucesso, o upload de arquivos na biblioteca
 *    de mídia funcionará corretamente.
 *
 * ==================================================================
 */

