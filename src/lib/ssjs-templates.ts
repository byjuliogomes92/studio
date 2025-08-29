
import type { CloudPage, CustomFormField, FormFieldConfig } from './types';

export function getFormSubmissionScript(pageState: CloudPage): string {
    const formComponent = pageState.components.find(c => c.type === 'Form');
    if (!formComponent) {
        return '';
    }

    // This is a more robust, explicit, and debuggable version of the form submission script.
    return `
<script runat="server">
    Platform.Load("Core", "1.1.1");
    
    // Set to true to print error messages on the page for debugging
    var debug = true; 

    try {
        if (Request.Method == "POST") {
            var deKey = Request.GetFormField("__de");
            
            // 1. Explicitly capture all expected form fields
            var nome = Request.GetFormField("NOME");
            var email = Request.GetFormField("EMAIL");
            var telefone = Request.GetFormField("TELEFONE");
            var cpf = Request.GetFormField("CPF");
            var cidade = Request.GetFormField("CIDADE");
            var datanascimento = Request.GetFormField("DATANASCIMENTO");
            var optin = Request.GetFormField("OPTIN");
            var npsScore = Request.GetFormField("NPS_SCORE");
            
            // Pass the subscriber's name to an AMPScript variable for the thank you message
            if (nome) {
                Variable.SetValue("@NOME", nome);
            }

            // 2. Only proceed if the essential fields (DE Key and Email) are present
            if (deKey && deKey != "" && deKey != "CHANGE-ME") {
                
                var de = DataExtension.Init(deKey);

                // 3. Manually and safely build the payload object for the Data Extension
                var deFields = {};
                if (email) { deFields["EMAIL"] = email; }
                if (nome) { deFields["NOME"] = nome; }
                if (telefone) { deFields["TELEFONE"] = telefone; }
                if (cpf) { deFields["CPF"] = cpf; }
                if (cidade) { deFields["CIDADE"] = cidade; }
                if (datanascimento) { deFields["DATANASCIMENTO"] = datanascimento; }
                
                // Handle NPS score only if it has a value
                if (npsScore && npsScore != "") { 
                    deFields["NPS_SCORE"] = npsScore;
                    deFields["NPS_DATE"] = Now(1);
                }
                
                // Correctly handle the boolean value for the Opt-in checkbox
                if (optin) {
                    deFields["OPTIN"] = (optin == "on") ? "True" : "False";
                }
                
                // Add a creation date for the record
                deFields["CreatedDate"] = Now(1);

                // 4. Use Rows.Add for direct insertion. This returns the number of rows added (1 if successful).
                var status = de.Rows.Add(deFields);
                
                // 5. If the insert is successful, set the flag to show the thank you message
                if (status == 1) {
                    Variable.SetValue("@showThanks", "true");
                }
            }
        }
    } catch (e) {
        // This will now only catch critical script errors.
        if (debug) {
            Write("<br><b>--- SSJS ERROR ---</b><br>" + Stringify(e));
        }
    }
</script>
`;
}
