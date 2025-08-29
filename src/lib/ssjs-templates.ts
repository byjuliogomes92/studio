
import type { CloudPage, CustomFormField, FormFieldConfig } from './types';
export function getFormSubmissionScript(pageState: CloudPage): string {
<<<<<<< HEAD
    // This script now combines the robust data handling with the correct state signaling for the thank you message.
=======
    const formComponent = pageState.components.find(c => c.type === 'Form');
    if (!formComponent) {
        return '';
    }

    const standardFields = formComponent.props.fields as Record<string, FormFieldConfig> || {};
    const customFields = formComponent.props.customFields as CustomFormField[] || [];
    const hasNPS = pageState.components.some(c => c.type === 'NPS');
    const hasABTest = pageState.components.some(c => c.abTestEnabled);
    const getFormFieldLines = Object.keys(standardFields)
        .filter(key => standardFields[key]?.enabled)
        .map(key => {
            const fieldNameMap: { [key: string]: string } = {
                name: 'NOME',
                email: 'EMAIL',
                phone: 'TELEFONE',
                cpf: 'CPF',
                city: 'CIDADE',
                birthdate: 'DATANASCIMENTO',
                optin: 'OPTIN'
            };
            return `var ${fieldNameMap[key].toLowerCase()} = Request.GetFormField("${fieldNameMap[key]}");`;
        }).join('\n            ');
    const getCustomFormFieldLines = customFields.map(field => {
        return `var ${field.name.toLowerCase()} = Request.GetFormField("${field.name}");`;
    }).join('\n            ');
    const getAbTestFieldLines = hasABTest ? pageState.components
        .filter(c => c.abTestEnabled)
        .map(c => `var variante_${c.id.toLowerCase()} = Request.GetFormField("VARIANTE_${c.id.toUpperCase()}");`)
        .join('\n            ') : '';
    
    const npsLines = hasNPS ? `var nps_score = Request.GetFormField("NPS_SCORE");\n            var nps_date = null;` : '';
    const handleOptinLine = standardFields.optin?.enabled ? `
            if (optin == "" || optin == null) {
                optin = "False";
            } else if (optin == "on") {
                optin = "True";
            }` : '';
    const handleNpsDateLine = hasNPS ? `
             if (nps_score != "" && nps_score != null) {
                 nps_date = Now(1);
             }` : '';
    const debugLines = Object.keys(standardFields)
        .filter(key => standardFields[key]?.enabled)
        .map(key => `Write("${key.toUpperCase()}: " + ${key} + "<br>");`).join('\n                ');
    const customDebugLines = customFields.map(field => `Write("${field.name.toUpperCase()}: " + ${field.name.toLowerCase()} + "<br>");`).join('\n                ');
    const npsDebugLine = hasNPS ? 'Write("NPS_SCORE: " + nps_score + "<br>");' : '';

    const deFields: string[] = [];
    if (standardFields.name?.enabled) deFields.push('"NOME": nome');
    if (standardFields.email?.enabled) deFields.push('"EMAIL": email');
    if (standardFields.phone?.enabled) deFields.push('"TELEFONE": telefone');
    if (standardFields.cpf?.enabled) deFields.push('"CPF": cpf');
    if (standardFields.city?.enabled) deFields.push('"CIDADE": cidade');
    if (standardFields.birthdate?.enabled) deFields.push('"DATANASCIMENTO": datanascimento');
    if (standardFields.optin?.enabled) deFields.push('"OPTIN": optin');
    customFields.forEach(field => {
        deFields.push(`"${field.name}": ${field.name.toLowerCase()}`);
    });

    if (hasNPS) {
        deFields.push('"NPS_SCORE": nps_score');
        deFields.push('"NPS_DATE": nps_date');
    }
    
    if (hasABTest) {
        pageState.components.filter(c => c.abTestEnabled).forEach(c => {
            deFields.push(`"VARIANTE_${c.id.toUpperCase()}": variante_${c.id.toLowerCase()}`);
        });
    }

    const deFieldsString = deFields.join(',\n                            ');

>>>>>>> fd42992d803e6100492b4e2b1983070cba8539ca
    return `
<script runat="server">
    Platform.Load("Core", "1.1.1");
    var debug = false; 

    try {
        if (Request.Method == "POST") {
            var deKey = Request.GetFormField("__de");
            var deMethod = Request.GetFormField("__de_method") || 'key';
            var redirectUrl = Request.GetFormField("__successUrl");
            
            var allFields = Request.GetFormFields();
            var payload = {};
            var primaryKeyName = null;
            var primaryKeyValue = null;
            
            for (var i = 0; i < allFields.length; i++) {
                var fieldName = allFields[i].Name;
                var fieldValue = allFields[i].Value;

                // Ignore control fields
                if (fieldName.substring(0, 2) !== "__") {
                    // Handle Optin checkbox case
                    if (fieldName === 'OPTIN' && fieldValue === 'on') {
                        payload[fieldName] = 'True';
                    } else {
                        payload[fieldName] = fieldValue;
                    }
                }

                // Identify the primary key for Upsert (assuming EMAIL)
                if (fieldName.toUpperCase() === "EMAIL") {
                    primaryKeyName = "EMAIL";
                    primaryKeyValue = fieldValue;
                }
            }
<<<<<<< HEAD
            
            // Add NPS score if component exists
            var npsScore = Request.GetFormField("NPS_SCORE");
            if (npsScore != null && npsScore != "") {
                payload["NPS_SCORE"] = npsScore;
                payload["NPS_DATE"] = Now(1);
            }
            
            // Add a default for Optin if it's enabled but not checked
            var hasOptin = false;
            for (var k in payload) {
                if (k.toUpperCase() === 'OPTIN') {
                    hasOptin = true;
                    break;
                }
            }
            if (!hasOptin && Request.GetFormField("OPTIN") == null) {
                var formConfig = ${JSON.stringify(pageState.components.find(c=>c.type==='Form')?.props.fields || {})};
                if(formConfig.optin && formConfig.optin.enabled) {
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

                // Signal to AMPScript that the submission was successful
=======
            if (email != null && email != "" && deKey != null && deKey != "") {
                var de = DataExtension.Init(deKey);
                
                de.Rows.Add({
                        ${deFieldsString}
                });
                showThanks = true;
            } else if (nome != null && nome != "" && deKey != null && deKey != "") {
                /* Fallback for forms without email but with name */
                 var de = DataExtension.Init(deKey);
                de.Rows.Add({
                        ${deFieldsString}
                });
                showThanks = true;
            }

            if (showThanks && redirectUrl && !debug) {
                Platform.Response.Redirect(redirectUrl);
            } else if (showThanks) {
>>>>>>> fd42992d803e6100492b4e2b1983070cba8539ca
                Variable.SetValue("@showThanks", "true");

                if (redirectUrl && !debug) {
                    Platform.Response.Redirect(redirectUrl);
                }
            }
        }
    } catch (e) {
        if (debug) {
            Write("<br><b>--- ERRO ---</b><br>" + Stringify(e));
<<<<<<< HEAD
        } else {
            // In case of error, still show thanks to not lose the lead
             Variable.SetValue("@showThanks", "true");
=======
>>>>>>> fd42992d803e6100492b4e2b1983070cba8539ca
        }
    }
</script>`;
}
