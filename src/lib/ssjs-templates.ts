

import type { CloudPage, CustomFormField, FormFieldConfig } from './types';

// This function is now mostly a fallback or for specific AMPScript processing if needed.
// The main submission logic is handled client-side via API.
export function getFormSubmissionScript(pageState: CloudPage): string {
    const formComponent = pageState.components.find(c => c.type === 'Form');
    if (!formComponent) {
      return '';
    }
  
    const fields = formComponent.props.fields as Record<string, FormFieldConfig> || {};
    const customFields = formComponent.props.customFields as CustomFormField[] || [];
    const allFields: { deField: string; varName: string; isCheckbox: boolean, isDate: boolean }[] = [];
  
    const fieldMapping: {[key: string]: string} = {
        name: 'nome',
        email: 'email',
        phone: 'telefone',
        cpf: 'cpf',
        city: 'cidade',
        birthdate: 'datanascimento',
        optin: 'optin'
    }

    // Standard fields
    for (const fieldName in fields) {
        if (fields[fieldName]?.enabled && fieldMapping[fieldName]) {
            allFields.push({
                deField: fieldName.toUpperCase(),
                varName: fieldMapping[fieldName],
                isCheckbox: fieldName === 'optin',
                isDate: fieldName === 'birthdate'
            });
        }
    }

    // Custom fields
    customFields.forEach(field => {
      const varName = field.name.replace(/[^a-zA-Z0-9_]/g, '');
      allFields.push({ deField: field.name, varName: varName, isCheckbox: field.type === 'checkbox', isDate: field.type === 'date' });
    });
  
    // Add other potential fields
    if (pageState.components.some(c => c.type === 'NPS')) {
      allFields.push({ deField: 'NPS_SCORE', varName: 'nps_score', isCheckbox: false, isDate: false });
      allFields.push({ deField: 'NPS_DATE', varName: 'nps_date', isCheckbox: false, isDate: true });
    }
    pageState.components.forEach(c => {
      if (c.abTestEnabled) {
        const varName = `variante_${c.id.toUpperCase()}`;
        allFields.push({ deField: `VARIANTE_${c.id.toUpperCase()}`, varName: varName, isCheckbox: false, isDate: false });
      }
    });
  
    const varDeclarations = allFields.map(f => `var ${f.varName} = Request.GetFormField("${f.deField}");`).join('\n        ');
    
    const specialHandling = allFields
      .map(f => {
        if (f.isCheckbox) {
          return `if (${f.varName} == "" || ${f.varName} == null) { ${f.varName} = "False"; } else if (${f.varName} == "on") { ${f.varName} = "True"; }`;
        }
        if (f.deField === 'NPS_DATE') {
            return `var ${f.varName} = Now(1);`;
        }
        return null;
      })
      .filter(Boolean)
      .join('\n        ');
  
    const debugWrites = allFields.map(f => `Write("${f.deField}: " + ${f.varName} + "<br>");`).join('\n                ');
    const rowDataFields = allFields.map(f => `"${f.deField}": ${f.varName}`).join(',\n                        ');
  
    const lookupKey = fields.email?.enabled ? 'EMAIL' : (fields.cpf?.enabled ? 'CPF' : null);
    const lookupVar = fields.email?.enabled ? 'email' : (fields.cpf?.enabled ? 'cpf' : null);
    const deKeyVar = 'deKey'; // Use a consistent variable name

    let dataLogic = '';
    if (lookupKey && lookupVar) {
        dataLogic = `
                var existing = de.Rows.Lookup(["${lookupKey}"], [${lookupVar}]);
                if (existing.length > 0) {
                    de.Rows.Update({ ${rowDataFields} }, ["${lookupKey}"], [${lookupVar}]);
                    if (debug) { Write("<br><b>Status:</b> Registro atualizado."); }
                } else {
                    de.Rows.Add({ ${rowDataFields} });
                    if (debug) { Write("<br><b>Status:</b> Novo registro inserido."); }
                }
        `;
    } else {
         dataLogic = `de.Rows.Add({ ${rowDataFields} });`;
    }

    const scriptTemplate = `
<script runat="server">
    Platform.Load("Core", "1.1.1");
    var debug = false; 

    try {
        if (Request.Method == "POST") {
            var ${deKeyVar} = Request.GetFormField("__de");
            var redirectUrl = Request.GetFormField("__successUrl");
            var showThanks = false;

            // --- Dynamically get all configured fields ---
            ${varDeclarations}

            // --- Handle specific field types ---
            ${specialHandling}

            if (debug) {
                Write("<br><b>--- DEBUG ---</b><br>");
                ${debugWrites}
            }

            if (${lookupVar} != null && ${lookupVar} != "" && ${deKeyVar} != null && ${deKeyVar} != "") {
                var de = DataExtension.Init(${deKeyVar});
                ${dataLogic}
                showThanks = true;
            }

            if (showThanks && redirectUrl && !debug) {
                Platform.Response.Redirect(redirectUrl);
            } else if (showThanks) {
                Variable.SetValue("@showThanks", "true");
            }
        }
    } catch (e) {
        if (debug) {
            Write("<br><b>--- ERRO ---</b><br>" + Stringify(e));
        }
    }
</script>
`;
    return scriptTemplate;
  }
