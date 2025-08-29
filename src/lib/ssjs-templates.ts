import type { CloudPage } from './types';

export function getFormSubmissionScript(pageState: CloudPage): string {
    // Este script foi ajustado para corresponder exatamente à Data Extension fornecida.
    // Ele é robusto e só enviará os dados que realmente existem e foram preenchidos.
    return `
<script runat="server">
    Platform.Load("Core", "1.1.1");
    
    // Mantenha como 'false' em produção. Mude para 'true' apenas se precisar depurar.
    var debug = false; 

    try {
        if (Request.Method == "POST") {
            var deKey = Request.GetFormField("__de");
            
            // 1. Capturar APENAS os campos que existem na sua DE
            var nome = Request.GetFormField("NOME");
            var email = Request.GetFormField("EMAIL");
            var telefone = Request.GetFormField("TELEFONE");
            var cpf = Request.GetFormField("CPF");
            var optin = Request.GetFormField("OPTIN");
            
            // Passa o nome para o AMPScript, útil para a mensagem de agradecimento
            if (nome) {
                Variable.SetValue("@NOME", nome);
            }

            // Apenas continua se a chave da DE for válida
            if (deKey && deKey != "" && deKey != "CHANGE-ME") {
                
                var de = DataExtension.Init(deKey);

                // 2. Montar o payload de forma segura, adicionando APENAS os campos que existem E que foram preenchidos
                var deFields = {};
                
                if (email) { deFields["EMAIL"] = email; }
                if (nome) { deFields["NOME"] = nome; }
                if (telefone) { deFields["TELEFONE"] = telefone; }
                if (cpf) { deFields["CPF"] = cpf; }

                // Lógica para tratar o checkbox de opt-in
                if (optin) {
                    deFields["OPTIN"] = (optin == "on") ? "True" : "False";
                }
                
                // 3. Inserir os dados na Data Extension
                // A variável 'deFields' agora contém apenas dados válidos e esperados pela DE.
                var status = de.Rows.Add(deFields);
                
                // 4. Se a inserção for bem-sucedida, sinaliza para mostrar a mensagem de agradecimento
                if (status == 1) {
                    Variable.SetValue("@showThanks", "true");
                }
            }
        }
    } catch (e) {
        if (debug) {
            Write("<br><b>--- ERRO CRÍTICO NO SSJS ---</b><br>" + Stringify(e));
        }
    }
</script>
`;
}