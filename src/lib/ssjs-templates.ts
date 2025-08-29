
import type { CloudPage } from './types';

export function getFormSubmissionScript(pageState: CloudPage): string {
    const { meta, components } = pageState;
    const deKey = meta.dataExtensionKey;
    const formComponent = components.find(c => c.type === 'Form');
    const customFields = formComponent?.props.customFields || [];

    // Build a list of all possible fields from the form configuration
    const allFieldNames = ['EMAIL', 'NOME', 'CPF', 'TELEFONE', 'OPTIN'];
    customFields.forEach((field: any) => {
        allFieldNames.push(field.name);
    });

    // Generate SSJS code for capturing form fields
    const fieldCaptures = allFieldNames.map(fieldName => {
        return `var ${fieldName} = Request.GetFormField("${fieldName}");`;
    }).join('\n        ');

    // Generate SSJS code for building the payload object, only including fields that have a value
    const payloadBuilder = allFieldNames.map(fieldName => {
        return `if (${fieldName}) { newRow["${fieldName}"] = ${fieldName}; }`;
    }).join('\n            ');
    
    // Specifically handle the boolean for OPTIN
    const optinLogic = `
            if (OPTIN == "on") {
                newRow["OPTIN"] = true;
            } else {
                newRow["OPTIN"] = false;
            }`;

    return `
<script runat="server">
    Platform.Load("Core", "1.1.1");

    var debug = false; 

    try {
        if (Request.Method == "POST") {
            var deKey = "${deKey}";
            var honeypot = Request.GetFormField("honeypot");

            // Honeypot check for bots
            if (honeypot != "") {
                return;
            }

            var email = Request.GetFormField("EMAIL");

            if (!deKey || deKey == "" || deKey == "CHANGE-ME" || !email || email == "") {
                 if(debug) {
                    Write("Debug: DE Key or Email is missing.");
                 }
                 return; // Stop processing if essential info is missing
            }

            // Dynamically capture all possible form fields
            ${fieldCaptures}

            var de = DataExtension.Init(deKey);
            var newRow = {
                "CreatedDate": new Date()
            };

            // Dynamically build the payload
            ${payloadBuilder}
            
            // Handle boolean conversion for OPTIN
            ${optinLogic}

            var status = de.Rows.Add(newRow);

            if (status == "OK") {
                // Set AMPScript variable for thank you message
                Variable.SetValue("@showThanks", "true");
                
                // Pass form fields back to AMPScript for personalization
                if (NOME) { Variable.SetValue("@NOME", NOME); }

                // Redirect to the same page with a success parameter to prevent re-submission
                var redirectURL = Platform.Request.GetInfo().url;
                Redirect(redirectURL + "?__success=true&NOME=" + NOME);
            } else {
                 if(debug) {
                    Write("Debug: Failed to add row. Status: " + status);
                 }
            }
        }
    } catch (e) {
        if (debug) {
            Write("Debug: An error occurred: " + Stringify(e));
        }
    }
</script>
`;
}
