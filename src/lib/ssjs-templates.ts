
import type { CloudPage, CustomFormField, FormFieldConfig } from './types';

export function getFormSubmissionScript(pageState: CloudPage): string {
    // This script now combines the robust data handling with the correct state signaling for the thank you message.
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
                Variable.SetValue("@showThanks", "true");

                if (redirectUrl && !debug) {
                    Platform.Response.Redirect(redirectUrl);
                }
            }
        }
    } catch (e) {
        if (debug) {
            Write("<br><b>--- ERRO ---</b><br>" + Stringify(e));
        } else {
            // In case of error, still show thanks to not lose the lead
             Variable.SetValue("@showThanks", "true");
        }
    }
</script>`;
}
