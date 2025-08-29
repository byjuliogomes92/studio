
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
            // Captura os dados do formulário
            var deKey = Request.GetFormField("__de");
            var email = Request.GetFormField("EMAIL");
            var nome = Request.GetFormField("NOME");
            var telefone = Request.GetFormField("TELEFONE");
            var cpf = Request.GetFormField("CPF");
            var optin = Request.GetFormField("OPTIN");

            // Apenas continua se a chave da DE e o email (chave primária) forem válidos
            if (deKey && deKey != "" && deKey != "CHANGE-ME" && email && email != "") {
                
                // Monta o payload de forma segura, adicionando APENAS os campos que foram preenchidos
                var payload = {
                    EMAIL: email
                };
                
                if (nome && nome != "") { payload.NOME = nome; }
                if (telefone && telefone != "") { payload.TELEFONE = telefone; }
                if (cpf && cpf != "") { payload.CPF = cpf; }
                if (optin == "on") { 
                    payload.OPTIN = true;
                } else {
                    payload.OPTIN = false;
                }
                
                // Usa UpsertData para inserir ou atualizar o registro na DE, usando EMAIL como chave
                var result = Platform.Function.UpsertData(deKey, ["EMAIL"], [email], 
                    Object.keys(payload), 
                    Object.keys(payload).map(function(key) { return payload[key]; })
                );
                
                // Se a inserção/atualização for bem-sucedida, sinaliza para mostrar a mensagem de agradecimento
                if (result > 0) {
                     Platform.Response.Redirect(Platform.Request.GetInfo().url + "?__success=true&NOME=" + nome);
                }
            }
        }
    } catch (e) {
        if (debug) {
            Write("<br><b>--- ERRO CRÍTICO NO SSJS ---</b><br>" + Stringify(e));
        }
        // Em caso de erro, redireciona para a própria página para evitar que o usuário veja uma página de erro do sistema
        Platform.Response.Redirect(Platform.Request.GetInfo().url + "?__success=false");
    }
</script>
`;
}
