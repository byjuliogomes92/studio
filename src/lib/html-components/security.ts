
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

    const cookieName = `auth_token_${pageState.id.replace(/-/g, '')}`;

    return `
Platform.Load("core", "1");
try {
    var isAuthenticated = false;
    var errorMessage = "";
    var identifierValue = "";

    // 1. Check for session cookie first
    if (Platform.Request.GetCookieValue("${cookieName}") == "true") {
        isAuthenticated = true;
    } else {
        // 2. Handle POST request (form submission)
        if (Request.Method == "POST") {
            var submittedIdentifier = Request.GetFormField("page_identifier");
            var submittedPassword = Request.GetFormField("page_password");

            if (submittedIdentifier && submittedPassword) {
                try {
                    var de = DataExtension.Init("${dataExtensionKey}");
                    var data = de.Rows.Lookup(["${identifierColumn}"], [submittedIdentifier]);

                    if (data && data.length > 0) {
                        var correctPassword = data[0]["${passwordColumn}"];
                        if (submittedPassword == correctPassword) {
                            isAuthenticated = true;
                            // Set session cookie for subsequent requests
                            Platform.Response.SetCookie("${cookieName}", "true", 0, "Session");
                        } else {
                            errorMessage = "Credenciais inválidas.";
                        }
                    } else {
                        errorMessage = "Usuário não encontrado.";
                    }
                } catch (ex) {
                    errorMessage = "Erro ao verificar credenciais: " + Stringify(ex.message);
                }
            } else {
                errorMessage = "Identificador e senha são obrigatórios.";
            }
             // Persist identifier in case of error
            identifierValue = submittedIdentifier;
        } 
        // 3. Handle GET request (initial page load)
        else {
            identifierValue = Request.GetQueryStringParameter("${urlParameter}");
        }
    }
    
    Variable.SetValue("@identifier", identifierValue);
    Variable.SetValue("@isAuthenticated", isAuthenticated);
    Variable.SetValue("@errorMessage", errorMessage);

} catch (e) {
    Variable.SetValue("@errorMessage", "Ocorreu um erro inesperado: " + Stringify(e.message));
    Variable.SetValue("@isAuthenticated", false);
}
`;
}


export const getSecurityFormHtml = (pageState: CloudPage): string => {
    const security = pageState.meta.security;
    
    if (security?.type === 'sso') {
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
    
    if (security?.type === 'password' && security.passwordConfig) {
        const config = security.passwordConfig;
        const pageStyle = `
            background-color: ${config.backgroundColor || '#f0f2f5'};
            color: ${config.textColor || '#111827'};
            font-family: sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
        `;
        const formContainerStyle = `
            background: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 420px;
            width: 90%;
        `;
        return `
            <style>
                .password-form input {
                    width: 100%;
                    padding: 12px;
                    margin-top: 15px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    box-sizing: border-box;
                }
                .password-form button {
                    width: 100%;
                    padding: 12px;
                    margin-top: 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    background-color: ${config.buttonBackgroundColor || 'var(--theme-color)'};
                    color: ${config.buttonTextColor || '#ffffff'};
                }
            </style>
            <div class="password-protection-container" style="${pageStyle}">
                <form method="post" action="%%=RequestParameter('PAGEURL')=%%" class="password-form" style="${formContainerStyle}">
                    ${config.logoUrl ? `<img src="${config.logoUrl}" alt="Logo" style="max-width: 150px; margin: 0 auto 20px auto; display: block;">` : ''}
                    <h2 style="margin-top: 0; color: ${config.textColor || '#111827'};">${config.title || 'Acesso Restrito'}</h2>
                    <p style="color: ${config.textColor ? `rgba(${parseInt(config.textColor.slice(1, 3), 16)}, ${parseInt(config.textColor.slice(3, 5), 16)}, ${parseInt(config.textColor.slice(5, 7), 16)}, 0.7)` : '#6b7280'};">${config.subtitle || 'Por favor, insira suas credenciais para continuar.'}</p>
                    
                    <input type="hidden" name="page_identifier" value="%%=v(@identifier)=%%">
                    
                    <input type="password" name="page_password" placeholder="Senha" required autofocus>
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
