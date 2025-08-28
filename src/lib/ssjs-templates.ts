

import type { CloudPage, CustomFormField, FormFieldConfig } from './types';

export function getFormSubmissionScript(pageState: CloudPage): string {
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

    return `
<script runat="server">
    Platform.Load("Core", "1.1.1");
    var debug = false; 

    try {
        if (Request.Method == "POST") {
            var deKey = Request.GetFormField("__de");
            var redirectUrl = Request.GetFormField("__successUrl");
            var showThanks = false;

            ${getFormFieldLines}
            ${getCustomFormFieldLines}
            ${npsLines}
            ${getAbTestFieldLines}

            ${handleOptinLine}
            ${handleNpsDateLine}

            if (debug) {
                Write("<br><b>--- DEBUG ---</b><br>");
                ${debugLines}
                ${customDebugLines}
                ${npsDebugLine}
            }
            
            var hasEmail = typeof email !== 'undefined' && email != null && email != "";

            if (hasEmail && deKey != null && deKey != "") {
                var de = DataExtension.Init(deKey);
                de.Rows.Add({
                    ${deFieldsString}
                });
                showThanks = true;
            }

            if (showThanks && redirectUrl && redirectUrl.length > 0 && !debug) {
                Platform.Response.Redirect(redirectUrl);
            } else if (showThanks) {
                Variable.SetValue("@showThanks", "true");
            }
        }
    } catch (e) {
        if (debug) {
            Write("<br><b>--- ERRO ---</b><br>" + Stringify(e));
        } else {
            Variable.SetValue("@showThanks", "true");
        }
    }
</script>`;
}
