
import type { CloudPage, CustomFormField, FormFieldConfig } from './types';

export function getFormSubmissionScript(pageState: CloudPage): string {
    const formComponent = pageState.components.find(c => c.type === 'Form');
    if (!formComponent) {
      return '';
    }
  
    const fields = formComponent.props.fields as Record<string, FormFieldConfig> || {};
    const customFields = formComponent.props.customFields as CustomFormField[] || [];
    const allFields: { deField: string; varName: string; isCheckbox: boolean, isDate: boolean }[] = [];
  
    if (fields.name?.enabled) allFields.push({ deField: 'NOME', varName: 'Nome', isCheckbox: false, isDate: false });
    if (fields.email?.enabled) allFields.push({ deField: 'EMAIL', varName: 'Email', isCheckbox: false, isDate: false });
    if (fields.phone?.enabled) allFields.push({ deField: 'TELEFONE', varName: 'Telefone', isCheckbox: false, isDate: false });
    if (fields.cpf?.enabled) allFields.push({ deField: 'CPF', varName: 'Cpf', isCheckbox: false, isDate: false });
    if (fields.city?.enabled) allFields.push({ deField: 'CIDADE', varName: 'Cidade', isCheckbox: false, isDate: false });
    if (fields.birthdate?.enabled) allFields.push({ deField: 'DATANASCIMENTO', varName: 'Datanascimento', isCheckbox: false, isDate: true });
    if (fields.optin?.enabled) allFields.push({ deField: 'OPTIN', varName: 'Optin', isCheckbox: true, isDate: false });
  
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
        if (f.isDate && f.varName !== 'Nps_date') {
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
                    showThanks = true;
                }
            }

            if (showThanks && redirectUrl && redirectUrl != "" && !debug) {
                Platform.Response.Redirect(redirectUrl);
            } else if (showThanks) {
                Variable.SetValue("@showThanks", "true");
            }
        }
    } catch (e) {
        if (debug) {
            Write("<br><b>--- ERRO ---</b><br>" + Stringify(e));
        } else {
            Variable.SetValue("@showThanks", "true");
        }
    }
</script>
`;
    return scriptTemplate;
  }
