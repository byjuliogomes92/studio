
import type { CloudPage, CustomFormField, FormFieldConfig } from './types';

export function getFormSubmissionScript(pageState: CloudPage): string {
    const formComponent = pageState.components.find(c => c.type === 'Form');
    if (!formComponent) {
        return '';
    }

    // This script now dynamically collects all form fields and ignores control fields.
    // It is robust and adapts to the fields configured in the form component.

    const allStandardFields = ['NOME', 'EMAIL', 'TELEFONE', 'CPF', 'CIDADE', 'DATANASCIMENTO', 'OPTIN'];
    const customFields = (formComponent.props.customFields as CustomFormField[] || []);
    const hasNPS = pageState.components.some(c => c.type === 'NPS');
    const abTestComponents = pageState.components.filter(c => c.abTestEnabled);

    let ssjs = `
<script runat="server">
    Platform.Load("Core", "1.1.1");
    // Mude para 'true' para ver os logs de depuração na página
    var debug = false; 

    try {
        if (Request.Method == "POST") {
            var deKey = Request.GetFormField("__de");
            var redirectUrl = Request.GetFormField("__successUrl");
            var showThanks = false;
            
            // Lista de campos de controle que NÃO devem ir para a Data Extension
            var controlFields = ["__de", "__de_method", "__successUrl", "__isPost"];
            var deFields = {};
            var formFields = Request.GetFormFields();

            // 1. Coleta todos os campos do formulário dinamicamente
            for (var key in formFields) {
                var isControlField = false;
                for (var i = 0; i < controlFields.length; i++) {
                    if (key.toLowerCase() == controlFields[i].toLowerCase()) {
                        isControlField = true;
                        break;
                    }
                }

                if (!isControlField) {
                    var value = formFields[key];
                    // Converte o valor do checkbox 'optin' para o formato do SFMC
                    if (key.toUpperCase() == 'OPTIN' && value == "on") {
                        value = "True";
                    }
                    deFields[key] = value;
                }
            }

            // Garante que o Optin tenha um valor padrão se não for marcado
            if (!deFields["OPTIN"]) {
                deFields["OPTIN"] = "False";
            }

            var emailToLookup = deFields["EMAIL"];

            // 2. Procede apenas se tivermos um email e uma chave de DE válidos
            if (emailToLookup != null && emailToLookup != "" && deKey != null && deKey != "") {
                 var de = DataExtension.Init(deKey);
                 var existing = de.Rows.Lookup(["EMAIL"], [emailToLookup]);

                 // 3. A LÓGICA CRUCIAL
                 if (existing.length > 0) {
                    // SE O REGISTRO EXISTE (UPDATE):
                    // Removemos a chave primária do payload antes de atualizar.
                    delete deFields["EMAIL"]; 
                    
                    de.Rows.Update(deFields, ["EMAIL"], [emailToLookup]);

                 } else {
                    // SE O REGISTRO É NOVO (ADD):
                    // Mantemos o payload completo, incluindo o email.
                    de.Rows.Add(deFields);
                 }

                showThanks = true;
            }

            // 4. Lógica de exibição da mensagem de agradecimento ou redirecionamento
            if (showThanks && redirectUrl && redirectUrl.length > 0 && !debug) {
                Platform.Response.Redirect(redirectUrl);
            } else if (showThanks) {
                Variable.SetValue("@showThanks", "true");
            }
        }
    } catch (e) {
        // Bloco de erro para ajudar na depuração
        Variable.SetValue("@errorMessage", Stringify(e));
        if (debug) {
            Write("<br><b>--- ERRO ---</b><br>" + Stringify(e));
        } else {
            Variable.SetValue("@showThanks", "true");
        }
    }
</script>
`;
    return ssjs;
}

