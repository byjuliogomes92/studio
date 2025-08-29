
import type { CloudPage } from "./types";

export function getFormProcessingScript(pageState: CloudPage): string {
    const formComponent = pageState.components.find(c => c.type === 'Form');
    if (!formComponent) {
        return '';
    }

    const deKey = pageState.meta.dataExtensionKey;
    if (!deKey || deKey === 'CHANGE-ME') {
        return '<!-- Data Extension Key not configured in page settings -->';
    }

    const fields = formComponent.props.fields || {};
    const customFields = formComponent.props.customFields || [];

    // Build lists of field names for SSJS
    const fieldNames: string[] = [];
    if (fields.name?.enabled) fieldNames.push('NOME');
    if (fields.email?.enabled) fieldNames.push('EMAIL');
    if (fields.cpf?.enabled) fieldNames.push('CPF');
    if (fields.phone?.enabled) fieldNames.push('TELEFONE');
    if (fields.optin?.enabled) fieldNames.push('OPTIN');
    customFields.forEach((field: any) => {
        fieldNames.push(field.name);
    });

    const getFormFieldsJs = fieldNames.map(name => `var ${name.toLowerCase()} = Platform.Request.GetFormField("${name}");`).join('\n    ');
    const payloadJs = fieldNames.map(name => {
        if (name === 'OPTIN') {
            return `if (optin == "on") { newRow["OPTIN"] = true; }`;
        }
        const varName = name.toLowerCase();
        return `if (${varName}) { newRow["${name}"] = ${varName}; }`;
    }).join('\n        ');

    const redirectUrl = pageState.meta.redirectUrl ? `${pageState.meta.redirectUrl}?__success=true` : `%%=RequestParameter('PAGEURL')=%%&__success=true`;

    return `<script runat="server">
    Platform.Load("Core", "1.1.1");
    if (Platform.Request.Method == "POST" && Platform.Request.GetFormField("submitted") == "true") {
        
        // Anti-spam honeypot
        var honeypot = Platform.Request.GetFormField("honeypot");
        if (honeypot != "") {
            return;
        }

        try {
            var de = DataExtension.Init("${deKey}");

            ${getFormFieldsJs}
            
            var newRow = {};
            newRow["CreatedDate"] = new Date();
            
            ${payloadJs}

            var status = de.Rows.Add(newRow);

            if (status == "OK") {
                Platform.Response.Redirect("${redirectUrl}");
            }

        } catch (e) {
            Platform.Response.Write("An error occurred: " + Stringify(e));
        }
    }
</script>
%%[
    VAR @FormSubmitted
    SET @FormSubmitted = RequestParameter("__success")
]%%
`;
}
