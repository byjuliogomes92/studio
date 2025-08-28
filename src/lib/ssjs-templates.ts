
import type { CloudPage, CustomFormField, FormFieldConfig } from './types';

export function getFormSubmissionScript(pageState: CloudPage): string {
    const formComponent = pageState.components.find(c => c.type === 'Form');
    if (!formComponent) {
        return '';
    }

    // This script now dynamically collects all form fields and ignores control fields.
    // It is robust and adapts to the fields configured in the form component.

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
            var deMethod = Request.GetFormField("__de_method");
            var redirectUrl = Request.GetFormField("__successUrl");
            var showThanks = false;
            
            var controlFields = ["__de", "__de_method", "__successUrl", "__isPost"];
            var deFields = {};
            var formFields = Request.GetFormFields();

            for (var key in formFields) {
                var isControlField = false;
                for (var i = 0; i < controlFields.length; i++) {
                    if (key.toLowerCase() == controlFields[i].toLowerCase()) {
                        isControlField = true;
                        break;
                    }
                }

                if (!isControlField) {
                    var value = formFields[key];
                    if (key.toUpperCase() == 'OPTIN') {
                        value = (value == "on" ? "True" : "False");
                    }
                    deFields[key] = value;
                }
            }

            if (deFields["EMAIL"] != null && deFields["EMAIL"] != "" && deKey != null && deKey != "") {
                 var de;
                 if (deMethod == 'name') {
                    de = DataExtension.Init(deKey);
                 } else {
                    de = DataExtension.Init(deKey); // Default to key
                 }
                 
                 var existing = de.Rows.Lookup(["EMAIL"], [deFields["EMAIL"]]);

                 if (existing.length > 0) {
                    de.Rows.Update(deFields, ["EMAIL"], [deFields["EMAIL"]]);
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
        Variable.SetValue("@errorMessage", Stringify(e));
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

