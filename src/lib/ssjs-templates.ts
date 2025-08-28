
import type { CloudPage, CustomFormField, FormFieldConfig } from './types';

export function getFormSubmissionScript(pageState: CloudPage): string {
    const formComponent = pageState.components.find(c => c.type === 'Form');
    if (!formComponent) {
        return '';
    }

    // Since we are now using a static script for reliability, we list out all possible fields
    // This script will attempt to get all of them, and if they don't exist in the form, they will just be empty.
    
    const allStandardFields = ['NOME', 'EMAIL', 'TELEFONE', 'CPF', 'CIDADE', 'DATANASCIMENTO', 'OPTIN'];
    const customFields = (formComponent.props.customFields as CustomFormField[] || []);
    const hasNPS = pageState.components.some(c => c.type === 'NPS');
    const abTestComponents = pageState.components.filter(c => c.abTestEnabled);

    let ssjs = `
<script runat="server">
    Platform.Load("Core", "1.1.1");
    var debug = false; 

    try {
        if (Request.Method == "POST") {
            var deKey = Request.GetFormField("__de");
            var redirectUrl = Request.GetFormField("__successUrl");
            var showThanks = false;

            // --- Standard Fields ---
            var nome = Request.GetFormField("NOME");
            var email = Request.GetFormField("EMAIL");
            var telefone = Request.GetFormField("TELEFONE");
            var cpf = Request.GetFormField("CPF");
            var cidade = Request.GetFormField("CIDADE");
            var datanascimento = Request.GetFormField("DATANASCIMENTO");
            var optin = Request.GetFormField("OPTIN");

            // --- Custom Fields ---
            ${customFields.map(f => `var ${f.name.toLowerCase()} = Request.GetFormField("${f.name}");`).join('\n            ')}

            // --- Other system fields ---
            ${hasNPS ? 'var nps_score = Request.GetFormField("NPS_SCORE");\n            var nps_date = null;' : ''}
            ${abTestComponents.map(c => `var variante_${c.id.toLowerCase()} = Request.GetFormField("VARIANTE_${c.id.toUpperCase()}");`).join('\n            ')}


            if (optin == "" || optin == null) {
                optin = "False";
            } else if (optin == "on") {
                optin = "True";
            }
            
            ${hasNPS ? 'if (nps_score != "" && nps_score != null) { nps_date = Now(1); }' : ''}


            if (email != null && email != "" && deKey != null && deKey != "") {
                var de = DataExtension.Init(deKey);
                var deFields = {};
                if (nome) deFields.NOME = nome;
                if (email) deFields.EMAIL = email;
                if (telefone) deFields.TELEFONE = telefone;
                if (cpf) deFields.CPF = cpf;
                if (cidade) deFields.CIDADE = cidade;
                if (datanascimento) deFields.DATANASCIMENTO = datanascimento;
                if (optin) deFields.OPTIN = optin;

                ${customFields.map(f => `if (${f.name.toLowerCase()}) deFields.${f.name} = ${f.name.toLowerCase()};`).join('\n                ')}

                ${hasNPS ? 'if (nps_score) deFields.NPS_SCORE = nps_score;\n                if (nps_date) deFields.NPS_DATE = nps_date;' : ''}
                
                ${abTestComponents.map(c => `if (variante_${c.id.toLowerCase()}) deFields.VARIANTE_${c.id.toUpperCase()} = variante_${c.id.toLowerCase()};`).join('\n                ')}
                
                var existing = de.Rows.Lookup(["EMAIL"], [email]);
                if (existing.length > 0) {
                   de.Rows.Update(deFields, ["EMAIL"], [email]);
                } else {
                   de.Rows.Add(deFields);
                }

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
            /* Fallback to show thanks message on error to avoid user confusion */
            Variable.SetValue("@showThanks", "true");
        }
    }
</script>
`;
    return ssjs;
}
