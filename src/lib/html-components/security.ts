
import type { CloudPage } from '../types';

export const getSSJSSecurityBlock = (pageState: CloudPage): string => {
    const security = pageState.meta.security;
    if (security?.type !== 'password' || !security.passwordConfig) {
        return '';
    }

    const { 
        dataExtensionKey, 
        identifierColumn, 
        passwordColumn, 
        urlParameter 
    } = security.passwordConfig;

    // Return the SSJS block as a string, ready to be inserted into a <script> tag.
    return `
Platform.Load("core", "1");

try {
    // ==============================
    // CONFIGURAÇÕES
    // ==============================
    var deKey = "${dataExtensionKey}";
    var identifierColumn = "${identifierColumn}";
    var passwordColumn = "${passwordColumn}";
    var urlParam = "${urlParameter}";

    var identifier = "";
    var password = "";
    var isAuthenticated = false;
    var errorMessage = "";

    // ==============================
    // CAPTURA PARÂMETROS
    // ==============================
    if (Request.GetFormField("page_identifier")) {
        identifier = Request.GetFormField("page_identifier");
    } else if (Request.GetQueryStringParameter(urlParam)) {
        identifier = Request.GetQueryStringParameter(urlParam);
    }

    if (Request.GetFormField("page_password")) {
        password = Request.GetFormField("page_password");
    }

    // ==============================
    // VALIDA LOGIN
    // ==============================
    if (password && identifier) {
        try {
            var de = DataExtension.Init(deKey);
            var data = de.Rows.Lookup([identifierColumn], [identifier]);

            if (data && data.length > 0) {
                var correctPassword = data[0][passwordColumn];

                if (password == correctPassword) {
                    isAuthenticated = true;
                } else {
                    errorMessage = "Senha ou identificador incorreto.";
                }
            } else {
                errorMessage = "Usuário não encontrado.";
            }
        } catch(ex) {
            errorMessage = "Erro ao validar credenciais: " + ex.message;
        }
    } else if (Request.Method == "POST" && !password) {
        errorMessage = "A senha é obrigatória.";
    }

    // ==============================
    // PASSA VARIÁVEIS PARA O AMPScript
    // ==============================
    Variable.SetValue("@identifier", identifier);
    Variable.SetValue("@isAuthenticated", isAuthenticated);
    Variable.SetValue("@errorMessage", errorMessage);

} catch(ex) {
    Variable.SetValue("@errorMessage", "Erro geral do servidor: " + ex.message);
    Variable.SetValue("@isAuthenticated", false);
}
`;
}


export const getSecurityFormHtml = (pageState: CloudPage): string => {
    const security = pageState.meta.security;
    
    if (security?.type === 'sso') {
        // This part remains unchanged as it uses AMPScript which is fine.
        return `
            %%[
                SET @Id = QueryParameter("id")
                SET @jobid = QueryParameter("jobid")
                SET @listid = QueryParameter("listid")
                SET @batchid = QueryParameter("batchid")
                SET @EnterpriseID = 'ENT_ID' /* <-- Substitua pelo seu Enterprise ID */
                SET @RedirectURL = CloudPagesURL(PAGE_ID_HERE) /* <-- Substitua pelo ID da sua CloudPage */
                SET @LoginURL = CONCAT("https://", @EnterpriseID, ".login.exacttarget.com/hub-sso.aspx?sso_id=", @Id, "&sso_jobid=", @jobid, "&sso_listid=", @listid, "&sso_batchid=", @batchid, "&sso_redirect=", URLEncode(@RedirectURL))
                SET @IsAuthorized = IIF(IsEmailAddress(QueryParameter("sso_email")),true,false)
                IF NOT @IsAuthorized THEN
                    Redirect(@LoginURL)
                ENDIF
                SET @isAuthenticated = @IsAuthorized
            ]%%
        `;
    }
    
    if (security?.type === 'password') {
        return `
            <div class="password-protection-container">
                <form method="post" action="%%=RequestParameter('PAGEURL')=%%" class="password-form">
                    <h2>Acesso Restrito</h2>
                    <p>Por favor, insira suas credenciais para continuar.</p>
                    <input type="text" name="page_identifier" placeholder="Seu Identificador" value="%%=v(@identifier)=%%" required>
                    <input type="password" name="page_password" placeholder="Senha" required>
                    <button type="submit">Acessar</button>
                    %%[ IF NOT Empty(@errorMessage) THEN ]%%
                        <div class="error-message" style="display:block; color: red; margin-top: 10px;">
                            %%=v(@errorMessage)=%%
                        </div>
                    %%[ ENDIF ]%%
                </form>
            </div>
        `;
    }
    
    return '';
}
