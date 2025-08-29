
import type { CloudPage, CustomFormField, FormFieldConfig } from './types';
export function getFormSubmissionScript(pageState: CloudPage): string {
    const formComponent = pageState.components.find(c => c.type === 'Form');
    if (!formComponent) {
        return '';
    }

    // This function now returns a static, robust template.
    // The logic is handled inside the SSJS string itself.
    return `
<script runat="server">
    Platform.Load("Core", "1.1.1");
    var debug = false; 

    try {
        if (Request.Method == "POST") {
            var deKey = Request.GetFormField("__de");
            var deMethod = Request.GetFormField("__de_method") || 'key';
            var redirectUrl = Request.GetFormField("__successUrl");
            
            // MAPA: Mapeia o 'name' do campo do formulário para o nome da coluna na Data Extension
            // IMPORTANTE: Ajuste as chaves (à direita) para corresponderem EXATAMENTE às suas colunas na DE.
            var fieldMap = {
                "NOME": "NOME",
                "EMAIL": "EMAIL",
                "TELEFONE": "TELEFONE",
                "CPF": "CPF",
                "CIDADE": "CIDADE",
                "DATANASCIMENTO": "DATANASCIMENTO",
                "OPTIN": "OPTIN",
                "NPS_SCORE": "NPS_SCORE"
                // Adicione aqui seus campos customizados, se necessário. Ex:
                // "NOME_CAMPO_CUSTOMIZADO": "ColunaNaDEParaCustomizado"
            };

            var allFields = Request.GetFormFields();
            var payload = {};
            var primaryKeyName = null;
            var primaryKeyValue = null;
            
            for (var i = 0; i < allFields.length; i++) {
                var fieldName = allFields[i].Name;
                var fieldValue = allFields[i].Value;

                // Usa o mapa para encontrar o nome correto da coluna na DE
                var deColumnName = fieldMap[fieldName.toUpperCase()];

                if (deColumnName) {
                    // Trata o caso do checkbox Optin
                    if (fieldName.toUpperCase() === 'OPTIN' && fieldValue === 'on') {
                        payload[deColumnName] = 'True';
                    } else {
                        payload[deColumnName] = fieldValue;
                    }
                }

                // Identifica a chave primária para o Upsert
                if (fieldName.toUpperCase() === "EMAIL") {
                    primaryKeyName = "EMAIL"; // Garante que a chave primária para o Upsert seja "EMAIL"
                    primaryKeyValue = fieldValue;
                }
            }
            
            // Adiciona campos que não vêm diretamente do formulário mas devem ser calculados
            // Apenas adiciona NPS_DATE se NPS_SCORE tiver sido enviado.
            if (payload["NPS_SCORE"] != null && payload["NPS_SCORE"] != "") {
                payload["NPS_DATE"] = Now(1);
            } else {
                // Remove NPS_SCORE do payload se estiver vazio para evitar erro no Upsert
                delete payload["NPS_SCORE"];
            }
            
            // Garante que o Opt-in tenha um valor 'False' se não for marcado
            if (fieldMap["OPTIN"]) {
                var optinExists = false;
                for (var key in payload) {
                    if (key.toUpperCase() == "OPTIN") {
                        optinExists = true;
                        break;
                    }
                }
                if (!optinExists) {
                    payload["OPTIN"] = "False";
                }
            }


            if (deKey && primaryKeyName && primaryKeyValue) {
                var de;
                if (deMethod === 'name') {
                    de = DataExtension.FromName(deKey);
                } else {
                    de = DataExtension.Init(deKey);
                }
                
                var status = de.Rows.Upsert(payload, [primaryKeyName]);

                Variable.SetValue("@showThanks", "true");

                if (redirectUrl && !debug) {
                    Platform.Response.Redirect(redirectUrl);
                }
            } else {
                 if(debug) {
                    Write("<br><b>Debug:</b> Chave da DE ou Chave Primária não encontrada. DE Key: " + deKey + ", PK Name: " + primaryKeyName + ", PK Value: " + primaryKeyValue);
                 }
                 Variable.SetValue("@showThanks", "true"); // Still show thanks to not lose lead
            }
        }
    } catch (e) {
        if (debug) {
            Write("<br><b>--- ERRO ---</b><br>" + Stringify(e));
        }
        // In case of error, still show thanks to not lose the lead
        Variable.SetValue("@showThanks", "true");
    }
</script>
`;
}
