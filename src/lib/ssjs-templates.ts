
import type { CloudPage, CustomFormField, FormFieldConfig } from './types';

export function getFormSubmissionScript(pageState: CloudPage): string {
    const formComponent = pageState.components.find(c => c.type === 'Form');
    const deUploadComponent = pageState.components.find(c => c.type === 'DataExtensionUpload');

    let script = `
<script runat="server">
    Platform.Load("Core", "1.1.1");
    var debug = false; 

    try {
        if (Request.Method == "POST") {`;

    // CSV Upload Logic
    if (deUploadComponent) {
        script += `
            if (Request.GetFormField("__isCsvUpload") == "true") {
                var deKey = Request.GetFormField("__deKey");
                var jsonData = Request.GetFormField("userdata");
                
                if (deKey && jsonData) {
                    var de = DataExtension.Init(deKey);
                    var data = Platform.Function.ParseJSON(jsonData);

                    for (var i = 0; i < data.length; i++) {
                        // The InsertData function can take a JSON object directly
                        // if the keys match the DE column names.
                        de.Rows.Add(data[i]);
                    }
                    Variable.SetValue("@showThanks", "true");
                }
            }
        `;
    }

    // Standard Form Submission Logic
    if (formComponent) {
        const standardFields = (formComponent.props.fields as Record<string, FormFieldConfig>) || {};
        const customFields = (formComponent.props.customFields as CustomFormField[]) || [];
        const abTestComponents = pageState.components.filter(c => c.abTestEnabled);

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
        
        const deFieldsString = deFields.join(',\n                        ');

        script += `
            if (Request.GetFormField("__isFormSubmission") == "true") {
                var deKey = Request.GetFormField("__de");
                var deMethod = Request.GetFormField("__de_method") || 'key';
                var redirectUrl = Request.GetFormField("__successUrl");
                var showThanks = false;

                ${fieldVarDeclarations.length > 0 ? `var ${[...new Set(fieldVarDeclarations)].join(', ')};` : ''}
                ${fieldCaptureLines.join('\n                ')}

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
                    
                    var status = de.Rows.Add({
                            ${deFieldsString}
                    });
                    
                    ${setAmpscriptVarsLines.join('\n                    ')}
                    showThanks = true;
                } else {
                    if (debug) {
                        Write("Debug: DE Key or Email field is missing. Data not saved. DEKey: " + deKey + ", Email: " + email);
                    }
                }

                if (showThanks && redirectUrl && !debug) {
                    Platform.Response.Redirect(redirectUrl);
                } else if (showThanks) {
                    Variable.SetValue("@showThanks", "true");
                }
            }
        `;
    }

    script += `
        }
    } catch (e) {
        if (debug) {
            Write("<br><b>--- SSJS ERROR ---</b><br>" + Stringify(e));
        }
    }
</script>
`;

    return script;
}
