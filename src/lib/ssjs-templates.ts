import type { CloudPage } from './types';

export function getFormSubmissionScript(pageState: CloudPage): string {
    const { meta, components } = pageState;
    const deKey = meta.dataExtensionKey;
    
    // Lista definitiva das colunas que existem na sua Data Extension.
    // Isso garante que nunca tentaremos salvar um campo que não existe.
    const allowedColumns = ['EMAIL', 'NOME', 'CPF', 'TELEFONE', 'OPTIN'];

    // Gera o código para capturar apenas os campos permitidos.
    const fieldCaptures = allowedColumns.map(fieldName => {
        return `var ${fieldName.toLowerCase()} = Request.GetFormField("${fieldName}");`;
    }).join('\n            ');

    // Gera o código para construir o payload de forma segura.
    const payloadBuilder = allowedColumns.map(fieldName => {
        // A lógica do OPTIN será tratada separadamente.
        if (fieldName === 'OPTIN') return ''; 
        return `if (${fieldName.toLowerCase()}) { payload["${fieldName}"] = ${fieldName.toLowerCase()}; }`;
    }).join('\n            ');

    return `
<script runat="server">
    Platform.Load("Core", "1.1.1");

    var debug = false; // Mude para true para ver erros detalhados na tela

    if (Request.Method == "POST") {
        try {
            var deKey = "${deKey}";
            var honeypot = Request.GetFormField("honeypot");

            // 1. Defesa Anti-Bot (Honeypot)
            if (honeypot != "") { return; }

            // 2. Captura e Validação dos Campos Essenciais
            ${fieldCaptures}

            if (!deKey || deKey == "" || deKey == "CHANGE-ME" || !email || email == "") {
                 if(debug) { Write("Debug: DE Key ou Email (campo obrigatório) está faltando."); }
                 return;
            }

            var de = DataExtension.Init(deKey);
            
            // 3. Construção Segura do Payload
            // O payload só conterá campos que existem na DE e que foram preenchidos.
            var payload = {};
            ${payloadBuilder}

            // Lógica específica e segura para o campo OPTIN (booleano)
            if (optin == "on") {
                payload["OPTIN"] = true;
            }

            // Opcional: Adicionar data de criação, se a coluna existir na DE
            // Se sua DE não tem a coluna "CreatedDate", delete ou comente a linha abaixo.
            // payload["CreatedDate"] = new Date();

            // 4. Inserção do Dado na Data Extension
            var status = de.Rows.Add(payload);

            // 5. Lógica de Redirecionamento (Post/Redirect/Get)
            // CORREÇÃO CRÍTICA: O status de sucesso é o número 1, não o texto "OK".
            if (status > 0) {
                // SUCESSO: Redireciona para a mesma página com parâmetro de sucesso.
                // Isso evita o reenvio do formulário ao atualizar a página.
                var redirectURL = Platform.Request.GetInfo().url;
                var params = "?__success=true";
                if (nome) {
                    params += "&NOME=" + URLEncode(nome);
                }
                Redirect(redirectURL + params);

            } else {
                 if(debug) { Write("Debug: Falha ao adicionar a linha na DE. Status retornado: " + status); }
                 // Opcional: Redirecionar para uma página de erro
                 // Redirect("URL_DA_PAGINA_DE_ERRO");
            }

        } catch (e) {
            if (debug) {
                Write("Debug: Ocorreu um erro crítico no bloco try/catch: " + Stringify(e));
            }
            // Opcional: Redirecionar para uma página de erro genérica
            // Redirect("URL_DA_PAGINA_DE_ERRO");
        }
    }
</script>
`;
}