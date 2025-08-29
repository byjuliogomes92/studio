
import type { CloudPage, CustomFormField, FormFieldConfig } from './types';

export function getFormSubmissionScript(pageState: CloudPage): string {
    const formComponent = pageState.components.find(c => c.type === 'Form');
    if (!formComponent) {
        return '';
    }

    const standardFields = (formComponent.props.fields as Record<string, FormFieldConfig>) || {};
    const customFields = (formComponent.props.customFields as CustomFormField[]) || [];
    const abTestComponents = pageState.components.filter(c => c.abTestEnabled);

    // --- Build the field capture strings ---
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
        deFields.push('"OPTIN": optin_boolean'); // Will use a processed boolean
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
    
    const deFieldsString = deFields.join(',\n                        ');

    return `
<script runat="server">
    Platform.Load("Core", "1.1.1");
    var debug = false; 

    try {
        if (Request.Method == "POST") {
            var deKey = Request.GetFormField("__de");
            var deMethod = Request.GetFormField("__de_method") || 'key';
            var redirectUrl = Request.GetFormField("__successUrl");
            var showThanks = false;

            // --- Explicitly capture all possible form fields ---
            ${fieldVarDeclarations.length > 0 ? `var ${[...new Set(fieldVarDeclarations)].join(', ')};` : ''}
            ${fieldCaptureLines.join('\n            ')}

            // --- Logic for optional/boolean fields ---
            var optin_boolean = false;
            if (typeof optin !== 'undefined') {
                if (optin == "on") {
                   optin_boolean = true;
                }
            }

            // --- Attempt to save data only if essential fields are present ---
            if (deKey && deKey != "" && deKey != "CHANGE-ME" && email && email != "") {
                
                var de;
                if (deMethod == 'name') {
                    de = DataExtension.FromName(deKey);
                } else {
                    de = DataExtension.Init(deKey);
                }
                
                var status = de.Rows.Add({
                        ${deFieldsString}
                });
                
                // Set AMPScript variables for personalization on the thank you message
                ${setAmpscriptVarsLines.join('\n                ')}

                showThanks = true;

            } else {
                if (debug) {
                    Write("Debug: DE Key or Email field is missing. Data not saved.");
                    Write("DE Key: " + deKey);
                    Write("Email: " + email);
                }
            }

            if (showThanks && redirectUrl && !debug) {
                Platform.Response.Redirect(redirectUrl);
            } else if (showThanks) {
                Variable.SetValue("@showThanks", "true");
            }
        }
    } catch (e) {
        if (debug) {
            Write("<br><b>--- SSJS ERROR ---</b><br>" + Stringify(e));
        }
    }
</script>
`;
}