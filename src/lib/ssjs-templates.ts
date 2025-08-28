

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
        name: 'Nome',
        email: 'Email',
        phone: 'Telefone',
        cpf: 'Cpf',
        city: 'Cidade',
        birthdate: 'Datanascimento',
        optin: 'Optin'
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
      allFields.push({ deField: 'NPS_SCORE', varName: 'Nps_score', isCheckbox: false, isDate: false });
      allFields.push({ deField: 'NPS_DATE', varName: 'Nps_date', isCheckbox: false, isDate: true });
    }
    pageState.components.forEach(c => {
      if (c.abTestEnabled) {
        const varName = `Variante_${c.id.toUpperCase()}`;
        allFields.push({ deField: `VARIANTE_${c.id.toUpperCase()}`, varName: varName, isCheckbox: false, isDate: false });
      }
    });
  
    const varDeclarations = allFields.map(f => `var ${f.varName} = Request.GetFormField("${f.deField}");`).join('\n        ');
    
    const specialHandling = allFields
      .map(f => {
        if (f.isCheckbox) {
          return `if (${f.varName} == "" || ${f.varName} == null) { ${f.varName} = "False"; } else if (${f.varName} == "on") { ${f.varName} = "True"; }`;
        }
        if (f.isDate && f.deField !== 'NPS_DATE') {
             return `if (${f.varName} == "" || ${f.varName} == null) { ${f.varName} = Now(1); }`;
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
  
    const lookupKey = fields.email?.enabled ? 'EMAIL' : (fields.cpf?.enabled ? 'CPF' : '');
    const lookupVar = fields.email?.enabled ? 'Email' : (fields.cpf?.enabled ? 'Cpf' : '');
  
    const scriptTemplate = `
<script runat="server">
    Platform.Load("Core", "1.1.1");
    var debug = false;
    // This script now primarily serves as a backup or for specific server-side processing,
    // as the main submission is handled via the /api/submit endpoint.
    try {
        if (Request.Method == "POST") {
            // Minimal processing for AMPScript fallback if needed
        }
    } catch (e) {
        if (debug) {
            Write("<br><b>--- SSJS Fallback Error ---</b><br>" + Stringify(e));
        }
    }
</script>
`;
    return scriptTemplate;
  }

