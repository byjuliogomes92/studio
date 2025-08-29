
import type { CloudPage } from './types';

export function getFormSubmissionScript(pageState: CloudPage): string {
    // This function returns a static, robust SSJS template.
    // All logic is now self-contained within the SSJS string for maximum reliability.
    return `
<script runat="server">
    Platform.Load("Core", "1.1.1");
    var debug = false; 

    try {
        if (Request.Method == "POST") {
            var deKey = Request.GetFormField("__de");
            var deMethod = Request.GetFormField("__de_method") || 'key'; // 'key' or 'name'
            var redirectUrl = Request.GetFormField("__successUrl");
            var isPost = Request.GetFormField("__isPost");

            if (!deKey || deKey == "CHANGE-ME") {
                if(debug) Write("Data Extension key not provided or not configured.");
                // Fail gracefully, show thank you message to not lose lead.
                Variable.SetValue("@showThanks", "true");
                return;
            }

            var allFields = Request.GetFormFields();
            var payload = {};
            var primaryKeyField = "EMAIL"; // Default Primary Key for Upsert
            var primaryKeyValue = Request.GetFormField(primaryKeyField);
            var controlFields = ["__DE", "__DE_METHOD", "__SUCCESSURL", "__ISPOST"];

            for (var i = 0; i < allFields.length; i++) {
                var fieldName = allFields[i].Name.toUpperCase();
                var fieldValue = allFields[i].Value;

                // Check if the field is a control field
                var isControlField = false;
                for (var j = 0; j < controlFields.length; j++) {
                    if (fieldName == controlFields[j]) {
                        isControlField = true;
                        break;
                    }
                }

                if (!isControlField) {
                    // Handle Optin checkbox case
                    if (fieldName === 'OPTIN' && fieldValue === 'on') {
                        payload[fieldName] = 'True';
                    } else {
                        payload[fieldName] = fieldValue;
                    }
                }
            }

            // Ensure OPTIN is set to 'False' if it wasn't submitted (unchecked)
            // This requires the 'OPTIN' column to exist in the form component config.
            if (payload["OPTIN"] === undefined) {
                 // Check if opt-in was a potential field in the form at all.
                 var formComponent = pageState.components.find(function(c) { return c.type === 'Form' && c.props.fields.optin && c.props.fields.optin.enabled; });
                 if(formComponent) {
                    payload["OPTIN"] = "False";
                 }
            }
            
            // Add NPS score and date if available
            if (payload["NPS_SCORE"] != null && payload["NPS_SCORE"] != "") {
                payload["NPS_DATE"] = Now(1);
            } else {
                delete payload["NPS_SCORE"];
            }

            // Perform the Upsert operation
            if (primaryKeyValue) {
                var de;
                if (deMethod === 'name') {
                    de = DataExtension.FromName(deKey);
                } else {
                    de = DataExtension.Init(deKey);
                }
                
                var status = de.Rows.Upsert(payload, [primaryKeyField]);
            } else {
                 if(debug) Write("Primary key value not found for field: " + primaryKeyField);
            }

            // Set AMPScript variable to show thank you message
            Variable.SetValue("@showThanks", "true");

            if (redirectUrl && !debug) {
                Platform.Response.Redirect(redirectUrl);
            }
        }
    } catch (e) {
        if (debug) {
            Write("<br><b>--- SSJS ERROR ---</b><br>" + Stringify(e));
        }
        // In case of any error, still show the thank you page to not lose the lead.
        Variable.SetValue("@showThanks", "true");
    }
</script>
`;
}
