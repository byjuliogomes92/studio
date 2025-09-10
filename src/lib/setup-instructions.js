
/**
 * ==================================================================
 * INSTRUÇÕES DE CONFIGURAÇÃO PÓS-CRIAÇÃO DO PROJETO
 * ==================================================================
 *
 * Este arquivo contém scripts e instruções para executar tarefas de
 * configuração essenciais diretamente no Google Cloud Shell ou na Vercel.
 *
 * --- COMO USAR ---
 * 1. Para tarefas do Firebase/Google Cloud, abra o Cloud Shell.
 * 2. Para tarefas da Vercel, acesse o painel do seu projeto.
 * 3. Siga as instruções da tarefa que deseja executar.
 *
 * ==================================================================
 * TAREFA 1: TORNAR UM USUÁRIO ADMINISTRADOR
 * ==================================================================
 * Execute este script para conceder permissões de administrador a um
 * usuário, permitindo o acesso ao painel em /admin.
 *
 * --- PASSO A PASSO (NO GOOGLE CLOUD SHELL) ---
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
 * --- PASSO A PASSO (NO GOOGLE CLOUD SHELL) ---
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
 * 4. **Descubra o nome exato do seu bucket.** Execute o comando abaixo.
 *    Ele listará todos os seus buckets de armazenamento. Copie o nome 
 *    que aparecer (deve começar com "gs://").
 * 
gsutil ls
 *
 * 5. Execute o comando abaixo no terminal, **substituindo [SEU_BUCKET_URL]**
 *    pelo nome que você copiou no passo anterior.
 *
gsutil cors set cors.json [SEU_BUCKET_URL]

 *
 *    Exemplo: Se o comando anterior retornou "gs://meu-projeto-12345.appspot.com",
 *    o comando final será:
 *    gsutil cors set cors.json gs://meu-projeto-12345.appspot.com
 *
 * 6. Após a mensagem de sucesso, o upload de arquivos na biblioteca
 *    de mídia funcionará corretamente.
 *
 * ==================================================================
 */
 
 
/**
 * ==================================================================
 * TAREFA 3: CONFIGURAR VARIÁVEIS DE AMBIENTE NA VERCEL
 * ==================================================================
 * Para que funcionalidades como a IA Generativa e a criptografia de
 * senhas (FTP, Bitly, SFMC) funcionem no site publicado, você precisa
 * adicionar as chaves secretas no painel da Vercel.
 *
 * --- PASSO A PASSO (NO PAINEL DA VERCEL) ---
 *
 * 1. Acesse o dashboard do seu projeto na Vercel.
 *
 * 2. Vá para a aba "Settings" (Configurações).
 *
 * 3. No menu lateral, clique em "Environment Variables" (Variáveis de Ambiente).
 *
 * 4. Adicione as seguintes variáveis, uma de cada vez:
 *
 *    - **Para a Chave de Criptografia (Obrigatória):**
 *      - **Name:** `SECRET_ENCRYPTION_KEY`
 *      - **Value:** Cole o valor que está no arquivo `.env` do seu projeto.
 *        (É uma chave longa e aleatória, como: b9c1...d5d5b)
 *
 *    - **Para a IA Generativa (Opcional):**
 *      - **Name:** `GEMINI_API_KEY`
 *      - **Value:** Cole a sua chave de API do Google AI Studio (Gemini).
 *
 * 5. Deixe as outras opções como estão e clique em "Save" (Salvar) para cada uma.
 *
 * 6. **IMPORTANTE:** Após salvar as variáveis, você precisa fazer um novo
 *    "deploy" (publicação) para que as alterações entrem em vigor.
 *    - Vá para a aba "Deployments".
 *    - Encontre o último deploy, clique nos três pontinhos (...) e selecione "Redeploy".
 *
 * ==================================================================
 */
