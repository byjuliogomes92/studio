
import type { CloudPage, CustomFormField, FormFieldConfig } from './types';

export function getPrefillAmpscript(pageState: CloudPage): string {
    const formComponent = pageState.components.find(c => c.type === 'Form');
    if (!formComponent) return '';

    const fieldsToPrefill = [];
    const standardFieldsMap: Record<keyof FormFieldConfig, string> = {
        name: 'NOME',
        email: 'EMAIL',
        phone: 'TELEFONE',
        cpf: 'CPF',
        city: 'CIDADE',
        birthdate: 'DATANASCIMENTO',
        optin: 'OPTIN'
    };

    const standardFieldsConfig = formComponent.props.fields || {};
    for (const key in standardFieldsConfig) {
        if (standardFieldsConfig[key as keyof FormFieldConfig]?.prefillFromUrl) {
            fieldsToPrefill.push(standardFieldsMap[key as keyof FormFieldConfig]);
        }
    }
    
    if (fieldsToPrefill.length === 0) return '';

    const prefillLines = fieldsToPrefill.map(fieldName => `SET @${fieldName} = QueryParameter("${fieldName.toLowerCase()}")`);
    
    return `/* --- Prefill --- */\n${prefillLines.join('\n')}`;
}

export const getDEUploadSSJS = (): string => {
    return `
<script runat="server">
    Platform.Load("Core", "1.1.1");
    var debug = false;
    try {
        if (Request.Method == "POST" && Request.GetFormField("__is_de_upload_submission") == "true") {
            var deKey = Request.GetFormField("deKey");
            var jsonDataStr = Request.GetFormField("jsonData");
            var redirectURL = Request.GetQueryStringParameter("PAGEURL") || Request.GetURL();
            var status = "";
            var message = "";

            if (deKey && jsonDataStr) {
                var de = DataExtension.Init(deKey);
                var jsonData = Platform.Function.ParseJSON(jsonDataStr);
                
                if (jsonData.length > 0) {
                    status = de.Rows.Add(jsonData);
                    message = "Foram inseridos " + jsonData.length + " registros.";
                } else {
                     message = "Nenhum registro para inserir.";
                }
                
                redirectURL = TreatAsContent(redirectURL + "?resultado=success&mensagem=" + Platform.Function.URLEncode(message));
            } else {
                throw new Error("Parâmetros 'deKey' ou 'jsonData' não encontrados na requisição.");
            }
        }
    } catch(e) {
        message = "Ocorreu um erro: " + Stringify(e.message);
        redirectURL = TreatAsContent(redirectURL + "?resultado=error&mensagem=" + Platform.Function.URLEncode(message));
    }

    if (Request.Method == "POST" && Request.GetFormField("__is_de_upload_submission") == "true") {
        Platform.Response.Redirect(redirectURL);
    }
</script>
`;
};
