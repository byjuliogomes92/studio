

import type { CloudPage, CustomFormField, FormFieldConfig } from './types';

// This function is now mostly a fallback or for specific AMPScript processing if needed.
// The main submission logic is handled client-side via API.
export function getFormSubmissionScript(pageState: CloudPage): string {
    // Using the provided, reliable static SSJS script to ensure correct functionality.
    const scriptTemplate = `
<script runat="server">
    Platform.Load("Core", "1.1.1");
    var debug = false; 

    try {
        if (Request.Method == "POST") {
            var deKey = Request.GetFormField("__de");
            var redirectUrl = Request.GetFormField("__successUrl");
            var showThanks = false;

            // --- Dynamically get all configured fields ---
            var nome = Request.GetFormField("NOME");
            var email = Request.GetFormField("EMAIL");
            var telefone = Request.GetFormField("TELEFONE");
            var cpf = Request.GetFormField("CPF");
            var optin = Request.GetFormField("OPTIN");
            var nps_score = Request.GetFormField("NPS_SCORE");
            var nps_date = null;


            // --- Handle specific field types ---
            if (optin == "" || optin == null) {
                optin = "False";
            } else if (optin == "on") {
                optin = "True";
            }
             if (nps_score != "" && nps_score != null) {
                nps_date = Now(1);
            }

            if (debug) {
                Write("<br><b>--- DEBUG ---</b><br>");
                Write("NOME: " + nome + "<br>");
                Write("EMAIL: " + email + "<br>");
                Write("TELEFONE: " + telefone + "<br>");
                Write("CPF: " + cpf + "<br>");
                Write("OPTIN: " + optin + "<br>");
                Write("NPS_SCORE: " + nps_score + "<br>");
            }

            if (email != null && email != "" && deKey != null && deKey != "") {
                var de = DataExtension.Init(deKey);
                var existing = de.Rows.Lookup(["EMAIL"], [email]);

                if (existing.length > 0) {
                    // Update existing record
                    de.Rows.Update(
                        {
                            "NOME": nome,
                            "TELEFONE": telefone,
                            "CPF": cpf,
                            "OPTIN": optin,
                            "NPS_SCORE": nps_score,
                            "NPS_DATE": nps_date
                        },
                        ["EMAIL"], [email]
                    );
                     if (debug) { Write("<br><b>Status:</b> Registro atualizado."); }
                } else {
                    // Add new record
                    de.Rows.Add({
                        "NOME": nome,
                        "EMAIL": email,
                        "TELEFONE": telefone,
                        "CPF": cpf,
                        "OPTIN": optin,
                        "NPS_SCORE": nps_score,
                        "NPS_DATE": nps_date
                    });
                     if (debug) { Write("<br><b>Status:</b> Novo registro inserido."); }
                }

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
