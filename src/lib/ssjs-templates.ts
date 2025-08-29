
import type { CloudPage, CustomFormField, FormFieldConfig } from './types';

export function getFormSubmissionScript(pageState: CloudPage): string {
    const formComponent = pageState.components.find(c => c.type === 'Form');
    if (!formComponent) {
        return '';
    }

    const standardFields = (formComponent.props.fields as Record<string, FormFieldConfig>) || {};
    const customFields = (formComponent.props.customFields as CustomFormField[]) || [];
    const hasNPS = pageState.components.some(c => c.type === 'NPS');
    const abTestComponents = pageState.components.filter(c => c.abTestEnabled);

    // Explicitly define all possible fields that can be captured
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

    const npsLine = hasNPS ? `var nps_score = Request.GetFormField("NPS_SCORE");` : '';
    const abTestLines = abTestComponents.map(c => `var variante_${c.id.toLowerCase()} = Request.GetFormField("VARIANTE_${c.id.toUpperCase()}");`).join('\n            ');
    
    // --- Build the DE Fields Object ---
    const deFields: string[] = [];
    if (standardFields.name?.enabled) deFields.push('"NOME": nome');
    if (standardFields.email?.enabled) deFields.push('"EMAIL": email');
    if (standardFields.phone?.enabled) deFields.push('"TELEFONE": telefone');
    if (standardFields.cpf?.enabled) deFields.push('"CPF": cpf');
    if (standardFields.city?.enabled) deFields.push('"CIDADE": cidade');
    if (standardFields.birthdate?.enabled) deFields.push('"DATANASCIMENTO": datanascimento');
    
    if (standardFields.optin?.enabled) {
        deFields.push('"OPTIN": optin');
    }

    customFields.forEach(field => {
        deFields.push(`"${field.name}": ${field.name.toLowerCase()}`);
    });

    if (hasNPS) {
        deFields.push('"NPS_SCORE": nps_score');
        deFields.push('"NPS_DATE": nps_date');
    }
    
    abTestComponents.forEach(c => {
        deFields.push(`"VARIANTE_${c.id.toUpperCase()}": variante_${c.id.toLowerCase()}`);
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
            ${getFormFieldLines}
            ${getCustomFormFieldLines}
            ${npsLine}
            ${abTestLines}

            // --- Logic for optional fields ---
            if (typeof optin !== 'undefined') {
                if (optin == "" || optin == null) {
                    optin = "False";
                } else if (optin == "on") {
                    optin = "True";
                }
            }

            var nps_date = null;
            if (typeof nps_score !== 'undefined' && nps_score != "" && nps_score != null) {
                nps_date = Now(1);
            }

            // --- Attempt to save data only if essential fields are present ---
            if (deKey && deKey != "" && deKey != "CHANGE-ME" && email && email != "") {
                
                var de;
                if (deMethod == 'name') {
                    de = DataExtension.FromName(deKey);
                } else {
                    de = DataExtension.Init(deKey);
                }
                
                // Using Rows.Add for simplicity and to guarantee insertion
                var status = de.Rows.Add({
                        ${deFieldsString}
                });

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
        // Even on error, we might want to show thanks to not lose the user experience
        Variable.SetValue("@showThanks", "true");
    }
</script>
`;
}
