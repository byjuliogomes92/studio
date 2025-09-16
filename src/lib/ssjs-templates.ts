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


export function getFormSubmissionScript(pageState: CloudPage): string {
    const formComponent = pageState.components.find(c => c.type === 'Form');
    if (!formComponent) return '';

    const standardFields = (formComponent.props.fields as Record<string, FormFieldConfig>) || {};
    const customFields = (formComponent.props.customFields as CustomFormField[]) || [];
    const abTestComponents = pageState.components.filter(c => c.props.abTestEnabled);

    const fieldVarDeclarations: string[] = [];
    const fieldCaptureLines: string[] = [];
    const deFields: string[] = [];
    const setAmpscriptVarsLines: string[] = [];

    const processField = (formName: string, deName: string) => {
        fieldVarDeclarations.push(formName.toLowerCase());
        fieldCaptureLines.push(`var ${formName.toLowerCase()} = Request.GetFormField("${formName.toUpperCase()}");`);
        deFields.push(`"${deName.toUpperCase()}": ${formName.toLowerCase()}`);
        setAmpscriptVarsLines.push(`Variable.SetValue("@${deName.toUpperCase()}", ${formName.toLowerCase()});`);
    };

    if (standardFields.name?.enabled) processField('NOME', 'NOME');
    if (standardFields.email?.enabled) processField('EMAIL', 'EMAIL');
    if (standardFields.phone?.enabled) processField('TELEFONE', 'TELEFONE');
    if (standardFields.cpf?.enabled) processField('CPF', 'CPF');
    if (standardFields.city?.enabled) processField('CIDADE', 'CIDADE');
    if (standardFields.birthdate?.enabled) processField('DATANASCIMENTO', 'DATANASCIMENTO');
    
    if (standardFields.optin?.enabled) {
        fieldVarDeclarations.push('optin');
        fieldCaptureLines.push('var optin = Request.GetFormField("OPTIN");');
        deFields.push('"OPTIN": optin_boolean');
    }
    
    customFields.forEach(field => {
        fieldVarDeclarations.push(field.name.toLowerCase());
        fieldCaptureLines.push(`var ${field.name.toLowerCase()} = Request.GetFormField("${field.name}");`);
        deFields.push(`"${field.name}": ${field.name.toLowerCase()}`);
        setAmpscriptVarsLines.push(`Variable.SetValue("@${field.name}", ${field.name.toLowerCase()});`);
    });

    abTestComponents.forEach(c => {
        const varName = `variante_${c.id.toLowerCase()}`;
        const fieldName = `VARIANTE_${c.id.toUpperCase()}`;
        fieldVarDeclarations.push(varName);
        fieldCaptureLines.push(`var ${varName} = Request.GetFormField("${fieldName}");`);
        deFields.push(`"${fieldName}": ${varName}`);
    });
    
    const deFieldsString = deFields.join(', ');

    const ssjsLogic = `
Platform.Load("Core", "1.1.1");
var debug = false; 
try {
    if (Request.Method == "POST") {
        if (Request.GetFormField("__isFormSubmission") == "true") {
            var deKey = Request.GetFormField("__de");
            var deMethod = Request.GetFormField("__de_method") || 'key';
            var redirectUrl = Request.GetFormField("__successUrl");
            var showThanks = false;
            ${fieldVarDeclarations.length > 0 ? `var ${[...new Set(fieldVarDeclarations)].join(', ')};` : ''}
            ${fieldCaptureLines.join(' ')}
            var optin_boolean = false;
            if (typeof optin !== 'undefined' && optin == "on") {
               optin_boolean = true;
            }
            if (deKey && deKey != "" && deKey != "CHANGE-ME" && email && email != "") {
                var de;
                if (deMethod == 'name') {
                    de = DataExtension.FromName(deKey);
                } else {
                    de = DataExtension.Init(deKey);
                }
                var status = de.Rows.Add({ ${deFieldsString} });
                ${setAmpscriptVarsLines.join(' ')}
                showThanks = true;
            } else {
                if (debug) {
                    Write("Debug: DE Key or Email field is missing. Data not saved. DEKey: " + deKey + ", Email: " + email);
                }
            }
            if (showThanks && redirectUrl && !debug && redirectUrl.indexOf('http') == 0) {
                Platform.Response.Redirect(redirectUrl);
            } else if (showThanks) {
                Variable.SetValue("@showThanks", "true");
            }
        }
    }
} catch (e) {
    if (debug) {
        Write("<br><b>--- SSJS ERROR ---</b><br>" + Stringify(e));
    }
}`;

    // Return the SSJS logic only, without script tags.
    return ssjsLogic;
}