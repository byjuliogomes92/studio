

import type { CloudPage, CustomFormField, FormFieldConfig } from './types';

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
    try {
        if (Request.Method == "POST") {
            var deIdentifier = Request.GetFormField("__de");
            var deMethod = Request.GetFormField("__de_method");
            var redirectUrl = Request.GetFormField("__successUrl");
            var showThanks = false;

            ${varDeclarations}

            ${specialHandling}

            if (debug) {
                Write("<br><b>--- DEBUG ---</b><br>");
                ${debugWrites}
            }

            if (deIdentifier != null && deIdentifier != "") {
                var de;
                if (deMethod == "name") {
                    var deList = DataExtension.Retrieve({Property:"Name",SimpleOperator:"equals",Value:deIdentifier});
                    if (deList && deList.length > 0) {
                        de = DataExtension.Init(deList[0].CustomerKey);
                    }
                } else {
                    de = DataExtension.Init(deIdentifier);
                }

                if (de) {
                    var rowData = {
                        ${rowDataFields}
                    };

                    var updateKey = "${lookupKey}";
                    var updateValue = ${lookupKey ? lookupVar : '""'};
                    
                    if (updateKey != "" && updateValue != null && updateValue != "") {
                        var existing = de.Rows.Lookup([updateKey], [updateValue]);
                        if (existing && existing.length > 0) {
                            de.Rows.Update(rowData, [updateKey], [updateValue]);
                            if (debug) { Write("<br><b>Status:</b> Registro atualizado."); }
                        } else {
                            de.Rows.Add(rowData);
                            if (debug) { Write("<br><b>Status:</b> Novo registro inserido."); }
                        }
                    } else {
                        de.Rows.Add(rowData);
                        if (debug) { Write("<br><b>Status:</b> Novo registro inserido (sem chave de atualização)."); }
                    }
                    
                    if (!redirectUrl || redirectUrl == "") {
                       showThanks = true;
                    }
                }
            }

            if (showThanks == false && redirectUrl && redirectUrl != "" && !debug) {
                Platform.Response.Redirect(redirectUrl);
            } else if (showThanks) {
                Variable.SetValue("@showThanks", "true");
            }
        }
    } catch (e) {
        if (debug) {
            Write("<br><b>--- ERRO ---</b><br>" + Stringify(e));
        } else {
             // Fallback to showing thanks message on error to avoid blank pages
            Variable.SetValue("@showThanks", "true");
        }
    }
</script>
`;
    return scriptTemplate;
  }

    