

import type { CloudPage, CustomFormField, FormFieldConfig } from './types';

export function getFormSubmissionScript(pageState: CloudPage): string {
    const formComponent = pageState.components.find(c => c.type === 'Form');
    if (!formComponent) {
        return '';
    }

    // Explicit and safe SSJS script based on the working solution.
    return `
<script runat="server">
    Platform.Load("Core", "1.1.1");
    var debug = false;

    try {
        if (Request.Method == "POST") {
            var deKey = Request.GetFormField("__de");
            
            // Explicitly capture all expected fields
            var nome = Request.GetFormField("NOME");
            var email = Request.GetFormField("EMAIL");
            var telefone = Request.GetFormField("TELEFONE");
            var cpf = Request.GetFormField("CPF");
            var cidade = Request.GetFormField("CIDADE");
            var datanascimento = Request.GetFormField("DATANASCIMENTO");
            var optin = Request.GetFormField("OPTIN");
            var npsScore = Request.GetFormField("NPS_SCORE");
            
            // Set AMPScript variable for thank you message personalization
            if (nome) {
                Variable.SetValue("@NOME", nome);
            }

            if (deKey && deKey != "" && deKey != "CHANGE-ME" && email && email != "") {
                var de = DataExtension.Init(deKey);
                
                // Manually build the payload, checking for values
                var deFields = {};
                if (email) { deFields["EMAIL"] = email; }
                if (nome) { deFields["NOME"] = nome; }
                if (telefone) { deFields["TELEFONE"] = telefone; }
                if (cpf) { deFields["CPF"] = cpf; }
                if (cidade) { deFields["CIDADE"] = cidade; }
                if (datanascimento) { deFields["DATANASCIMENTO"] = datanascimento; }
                
                // Handle NPS score only if it exists
                if (npsScore && npsScore != "") { 
                    deFields["NPS_SCORE"] = npsScore;
                    deFields["NPS_DATE"] = Now(1);
                }
                
                // Handle checkbox value for Opt-in
                if (optin == "on") {
                    deFields["OPTIN"] = "True";
                } else {
                    deFields["OPTIN"] = "False";
                }
                
                var status = de.Rows.Add([deFields]);

                if (status == "OK") {
                    Variable.SetValue("@showThanks", "true");
                }
            }
        }
    } catch (e) {
        if (debug) {
            Write("<br><b>--- SSJS ERROR ---</b><br>" + Stringify(e));
        }
        Variable.SetValue("@errorMessage", Stringify(e));
    }
</script>
`;
}
